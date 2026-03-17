"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { audioStateAtom, participantsAtom } from "@/store/roomAtoms";
import {
  audioSettingsAtom,
  audioConstraintsAtom,
} from "@/store/audioSettingsAtom";
import {
  createSendPipeline,
  createReceivePipeline,
} from "@/lib/audioProcessing";
import type { SocketActions } from "./useSocket";

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  remoteStream: MediaStream;
  audioElement: HTMLAudioElement;
  gainNode: GainNode;
  cleanupReceivePipeline?: () => void;
}

export function useWebRTC(actions: SocketActions) {
  const audioState = useAtomValue(audioStateAtom);
  const audioSettings = useAtomValue(audioSettingsAtom);
  const audioConstraints = useAtomValue(audioConstraintsAtom);
  const setParticipants = useSetAtom(participantsAtom);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(
    null
  );
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const pendingParticipantsRef = useRef<string[]>([]);
  const lastSpeakingRef = useRef(false);
  const sendPipelineRef = useRef<{ cleanup: () => void } | null>(null);
  const prevConstraintsRef = useRef<string>("");

  // Get ICE servers on mount
  useEffect(() => {
    actions.getIceServers().then((servers) => {
      iceServersRef.current = servers;
    });
  }, [actions]);

  const createPeerConnection = useCallback(
    (userId: string, initiator: boolean) => {
      const pc = new RTCPeerConnection({
        iceServers:
          iceServersRef.current.length > 0
            ? iceServersRef.current
            : [{ urls: "stun:stun.l.google.com:19302" }],
      });

      const remoteStream = new MediaStream();

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      // Create a temporary gain node — will be replaced by receive pipeline once tracks arrive
      const gainNode = ctx.createGain();
      gainNode.gain.value = audioState.isDeafened ? 0 : 1;
      gainNode.connect(ctx.destination);

      const audioElement = new Audio();
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;

      // Apply output device if set
      if (audioSettings.output_device && "setSinkId" in audioElement) {
        (audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> })
          .setSinkId(audioSettings.output_device)
          .catch(() => {});
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          actions.sendSignal(userId, {
            type: "ice-candidate",
            candidate: event.candidate,
          });
        }
      };

      let receivePipelineCreated = false;
      let cleanupReceivePipeline: (() => void) | undefined;
      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        // Build receive pipeline once tracks arrive
        if (!receivePipelineCreated && remoteStream.getAudioTracks().length > 0) {
          receivePipelineCreated = true;
          // Disconnect the placeholder gain node
          gainNode.disconnect();
          try {
            const pipeline = createReceivePipeline(
              ctx,
              remoteStream,
              audioState.isDeafened ? 0 : 1
            );
            // Update the peer's gainNode reference to the pipeline's gain
            const peer = peersRef.current.get(userId);
            if (peer) {
              peer.gainNode = pipeline.gainNode;
              peer.cleanupReceivePipeline = pipeline.cleanup;
            }
            cleanupReceivePipeline = pipeline.cleanup;
          } catch {
            // Fallback: reconnect placeholder gain and use audioElement
            gainNode.connect(ctx.destination);
          }
        }
      };

      // Add processed tracks (filtered/compressed) to peer connection
      const streamToSend = processedStream || localStream;
      if (streamToSend) {
        streamToSend.getTracks().forEach((track) => {
          pc.addTrack(track, streamToSend);
        });
      }

      const peerConn: PeerConnection = {
        pc,
        userId,
        remoteStream,
        audioElement,
        gainNode,
        cleanupReceivePipeline,
      };
      peersRef.current.set(userId, peerConn);

      if (initiator) {
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          actions.sendSignal(userId, { type: "offer", sdp: offer });
        });
      }

      return peerConn;
    },
    [localStream, processedStream, audioState.isDeafened, audioSettings.output_device, actions]
  );

  // Listen for WebRTC signals
  useEffect(() => {
    const streamSocket = actions.getStreamSocket();
    if (!streamSocket) return;

    const handleSignal = (data: {
      from_user_id: string;
      signal: {
        type: string;
        sdp?: RTCSessionDescriptionInit;
        candidate?: RTCIceCandidateInit;
      };
    }) => {
      const { from_user_id, signal } = data;

      if (signal.type === "offer") {
        let peer = peersRef.current.get(from_user_id);
        // If the existing peer connection is stale (closed/failed from a hard refresh),
        // tear it down and create a fresh one.
        if (
          peer &&
          (peer.pc.connectionState === "closed" ||
            peer.pc.connectionState === "failed")
        ) {
          peer.cleanupReceivePipeline?.();
          peer.pc.close();
          peer.audioElement.srcObject = null;
          peersRef.current.delete(from_user_id);
          peer = undefined;
        }
        if (!peer) {
          peer = createPeerConnection(from_user_id, false);
        }
        peer.pc
          .setRemoteDescription(new RTCSessionDescription(signal.sdp!))
          .then(() => {
            return peer!.pc.createAnswer();
          })
          .then((answer) => {
            peer!.pc.setLocalDescription(answer);
            actions.sendSignal(from_user_id, { type: "answer", sdp: answer });
          });
      } else if (signal.type === "answer") {
        const peer = peersRef.current.get(from_user_id);
        if (peer) {
          peer.pc.setRemoteDescription(
            new RTCSessionDescription(signal.sdp!)
          );
        }
      } else if (signal.type === "ice-candidate") {
        const peer = peersRef.current.get(from_user_id);
        if (peer && signal.candidate) {
          peer.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    };

    const handleAudioJoined = (_data: { user_id: string }) => {
      // Don't create PC here — the joiner will initiate via existing_audio_participants.
      // Our PC will be created reactively in handleSignal when the joiner's offer arrives.
      // This prevents the "glare" condition where both sides send offers simultaneously.
    };

    const handleAudioLeft = (data: { user_id: string }) => {
      const peer = peersRef.current.get(data.user_id);
      if (peer) {
        peer.cleanupReceivePipeline?.();
        peer.pc.close();
        peer.audioElement.srcObject = null;
        peersRef.current.delete(data.user_id);
      }
    };

    const handleExistingParticipants = (data: { user_ids: string[] }) => {
      if (localStream) {
        data.user_ids.forEach((uid) => {
          if (!peersRef.current.has(uid)) {
            createPeerConnection(uid, true);
          }
        });
      } else {
        // localStream not ready yet — stash for later
        pendingParticipantsRef.current = data.user_ids;
      }
    };

    streamSocket.on("signal", handleSignal);
    streamSocket.on("audio_joined", handleAudioJoined);
    streamSocket.on("audio_left", handleAudioLeft);
    streamSocket.on("existing_audio_participants", handleExistingParticipants);

    return () => {
      streamSocket.off("signal", handleSignal);
      streamSocket.off("audio_joined", handleAudioJoined);
      streamSocket.off("audio_left", handleAudioLeft);
      streamSocket.off(
        "existing_audio_participants",
        handleExistingParticipants
      );
    };
  }, [actions, createPeerConnection, localStream]);

  // Process pending participants once localStream is available
  useEffect(() => {
    if (!localStream || pendingParticipantsRef.current.length === 0) return;
    const pending = pendingParticipantsRef.current;
    pendingParticipantsRef.current = [];
    pending.forEach((uid) => {
      if (!peersRef.current.has(uid)) {
        createPeerConnection(uid, true);
      }
    });
  }, [localStream, createPeerConnection]);

  // Speaking detection — uses raw localStream (not processed) for accuracy
  useEffect(() => {
    if (!localStream) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(localStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    analyserIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const isSpeaking = average > 15;

      // Only emit when speaking state changes to avoid flooding
      if (isSpeaking !== lastSpeakingRef.current) {
        lastSpeakingRef.current = isSpeaking;
        actions.emitSpeaking(isSpeaking);
      }
    }, 200);

    return () => {
      if (analyserIntervalRef.current) {
        clearInterval(analyserIntervalRef.current);
      }
      source.disconnect();
    };
  }, [localStream, actions]);

  // Mute: toggle both raw and processed track enabled
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audioState.isMuted;
      });
    }
    if (processedStream) {
      processedStream.getAudioTracks().forEach((track) => {
        track.enabled = !audioState.isMuted;
      });
    }
  }, [audioState.isMuted, localStream, processedStream]);

  // Deafen: set all remote gains to 0
  useEffect(() => {
    peersRef.current.forEach((peer) => {
      peer.gainNode.gain.value = audioState.isDeafened ? 0 : 1;
    });
  }, [audioState.isDeafened]);

  // Mid-session settings change: re-acquire mic and rebuild send pipeline
  useEffect(() => {
    const serialized = JSON.stringify(audioConstraints);
    // Skip on first render or when not in a call
    if (!localStream || !prevConstraintsRef.current) {
      prevConstraintsRef.current = serialized;
      return;
    }
    if (serialized === prevConstraintsRef.current) return;
    prevConstraintsRef.current = serialized;

    const wasMuted = audioState.isMuted;

    (async () => {
      try {
        // Get new stream with updated constraints
        const newRawStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });

        // Rebuild send pipeline
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        sendPipelineRef.current?.cleanup();
        const pipeline = createSendPipeline(
          audioContextRef.current,
          newRawStream
        );
        sendPipelineRef.current = pipeline;

        // Preserve mute state on new tracks
        if (wasMuted) {
          newRawStream.getAudioTracks().forEach((t) => (t.enabled = false));
          pipeline.processedStream
            .getAudioTracks()
            .forEach((t) => (t.enabled = false));
        }

        // Replace track on all peers — no renegotiation needed
        const newTrack = pipeline.processedStream.getAudioTracks()[0];
        if (newTrack) {
          peersRef.current.forEach((peer) => {
            const sender = peer.pc
              .getSenders()
              .find((s) => s.track?.kind === "audio");
            sender?.replaceTrack(newTrack);
          });
        }

        // Stop old raw stream tracks
        localStream.getTracks().forEach((t) => t.stop());

        setLocalStream(newRawStream);
        setProcessedStream(pipeline.processedStream);
      } catch {
        console.error("Failed to update audio settings mid-session");
      }
    })();
  }, [audioConstraints, localStream, audioState.isMuted]);

  // Output device change: update setSinkId on all peer audio elements
  useEffect(() => {
    if (!audioSettings.output_device) return;
    peersRef.current.forEach((peer) => {
      if ("setSinkId" in peer.audioElement) {
        (peer.audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> })
          .setSinkId(audioSettings.output_device)
          .catch(() => {});
      }
    });
  }, [audioSettings.output_device]);

  const joinVoice = useCallback(async () => {
    try {
      // Resume AudioContext if suspended — browsers require a user gesture and this
      // callback runs inside a click handler, so resuming here is reliable.
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      // Build send processing pipeline
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const pipeline = createSendPipeline(audioContextRef.current, stream);
      sendPipelineRef.current = pipeline;

      // Store serialized constraints to detect future changes
      prevConstraintsRef.current = JSON.stringify(audioConstraints);

      // Raw stream for speaking detection, processed for peer connections
      setLocalStream(stream);
      setProcessedStream(pipeline.processedStream);
      actions.joinAudio();

      // Create peer connections to all existing audio participants
      // They will be notified via audio_joined event
    } catch {
      console.error("Failed to get microphone access");
    }
  }, [actions, audioConstraints]);

  const leaveVoice = useCallback(() => {
    // Clean up send pipeline
    sendPipelineRef.current?.cleanup();
    sendPipelineRef.current = null;

    // Close all peer connections and their receive pipelines
    peersRef.current.forEach((peer) => {
      peer.cleanupReceivePipeline?.();
      peer.pc.close();
      peer.audioElement.srcObject = null;
    });
    peersRef.current.clear();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setProcessedStream(null);

    actions.leaveAudio();
  }, [localStream, actions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sendPipelineRef.current?.cleanup();
      peersRef.current.forEach((peer) => {
        peer.cleanupReceivePipeline?.();
        peer.pc.close();
        peer.audioElement.srcObject = null;
      });
      peersRef.current.clear();

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    joinVoice,
    leaveVoice,
    localStream,
    isInVoice: !!localStream,
  };
}
