"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useAtomValue } from "jotai";
import { cameraConstraintsAtom } from "@/store/cameraSettingsAtom";
import type { SocketActions } from "./useSocket";

interface CameraPeer {
  pc: RTCPeerConnection;
  userId: string;
}

export interface UseCameraShareReturn {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  localStream: MediaStream | null;
  isLocalSharing: boolean;
  remoteStreams: Map<string, MediaStream>;
}

export function useCameraShare(
  actions: SocketActions,
  currentUserId: string | null,
): UseCameraShareReturn {
  const cameraConstraints = useAtomValue(cameraConstraintsAtom);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const peersRef = useRef<Map<string, CameraPeer>>(new Map());
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const cameraConstraintsRef = useRef<MediaTrackConstraints>(cameraConstraints);

  // Keep refs in sync with state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    cameraConstraintsRef.current = cameraConstraints;
  }, [cameraConstraints]);

  // Get ICE servers on mount
  useEffect(() => {
    actions.getIceServers().then((servers) => {
      iceServersRef.current = servers;
    });
  }, [actions]);

  const getIceConfig = useCallback((): RTCConfiguration => ({
    iceServers: iceServersRef.current.length > 0
      ? iceServersRef.current
      : [{ urls: "stun:stun.l.google.com:19302" }],
  }), []);

  const closePeer = useCallback((userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.pc.close();
      peersRef.current.delete(userId);
    }
  }, []);

  const closeAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => peer.pc.close());
    peersRef.current.clear();
  }, []);

  // Sharer: create a PC for a given viewer and send an offer
  const createSharerPC = useCallback((viewerUserId: string) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    // Close existing PC for this viewer if any
    const existing = peersRef.current.get(viewerUserId);
    if (existing) existing.pc.close();

    const pc = new RTCPeerConnection(getIceConfig());

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        actions.sendCameraShareSignal(viewerUserId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Add camera tracks to the connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    peersRef.current.set(viewerUserId, { pc, userId: viewerUserId });

    // Create and send offer
    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
      actions.sendCameraShareSignal(viewerUserId, { type: "offer", sdp: offer });
    });
  }, [actions, getIceConfig]);

  // Viewer: create a PC for receiving and wait for the sharer's offer
  const createViewerPC = useCallback((sharerUserId: string) => {
    const pc = new RTCPeerConnection(getIceConfig());
    const incomingStream = new MediaStream();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        actions.sendCameraShareSignal(sharerUserId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        incomingStream.addTrack(track);
      });
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(sharerUserId, incomingStream);
        return next;
      });
    };

    peersRef.current.set(sharerUserId, { pc, userId: sharerUserId });
    return pc;
  }, [actions, getIceConfig]);

  // Start sharing the camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraConstraintsRef.current,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsLocalSharing(true);

      // Tell the server to start the camera share session
      actions.startCamera();
    } catch {
      console.error("[CameraShare] Failed to capture camera");
    }
  }, [actions]);

  // Stop sharing
  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    setIsLocalSharing(false);
    closeAllPeers();
    setRemoteStreams(new Map());
    actions.stopCamera();
  }, [actions, closeAllPeers]);

  // Listen for camera signaling events
  useEffect(() => {
    const streamSocket = actions.getStreamSocket();
    if (!streamSocket) return;

    // When camera_started: if we're the sharer, create PCs for all viewers
    const handleCameraStarted = (data: {
      user_id?: number;
      viewer_user_ids?: string[];
    }) => {
      const sharerId = data.user_id ? String(data.user_id) : null;
      if (sharerId === currentUserId && data.viewer_user_ids) {
        // We are the sharer — create PCs for all current viewers
        // No peer existence guard — createSharerPC already closes stale PCs
        data.viewer_user_ids.forEach((viewerUid) => {
          createSharerPC(viewerUid);
        });
      }
      // Viewers will wait for the offer to arrive via camera_share_signal
    };

    // New viewer joined (or re-joined after refresh) — sharer creates a fresh PC for them.
    // No peer existence guard — createSharerPC already closes stale PCs, and a
    // viewer who refreshed needs a new offer even though the old peer still exists.
    const handleViewerJoined = (data: { user_id: string }) => {
      if (isLocalSharing) {
        createSharerPC(data.user_id);
      }
    };

    // Handle signaling messages (offer/answer/ice-candidate)
    const handleCameraShareSignal = (data: {
      from_user_id: string;
      signal: {
        type: string;
        sdp?: RTCSessionDescriptionInit;
        candidate?: RTCIceCandidateInit;
      };
    }) => {
      const { from_user_id, signal } = data;

      if (signal.type === "offer") {
        // We are a viewer receiving an offer from a sharer
        let peer = peersRef.current.get(from_user_id);
        const pc = peer ? peer.pc : createViewerPC(from_user_id);
        if (!peer) {
          peer = peersRef.current.get(from_user_id)!;
        }
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!))
          .then(() => pc.createAnswer())
          .then((answer) => {
            pc.setLocalDescription(answer);
            actions.sendCameraShareSignal(from_user_id, {
              type: "answer",
              sdp: answer,
            });
          });
      } else if (signal.type === "answer") {
        // We are the sharer receiving an answer
        const peer = peersRef.current.get(from_user_id);
        if (peer) {
          peer.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
        }
      } else if (signal.type === "ice-candidate") {
        const peer = peersRef.current.get(from_user_id);
        if (peer && signal.candidate) {
          peer.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    };

    // Camera stopped — clean up peer for that user
    const handleCameraStopped = (data: { user_id?: number }) => {
      const uid = data.user_id ? String(data.user_id) : null;
      if (uid) {
        closePeer(uid);
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(uid);
          return next;
        });
      }
    };

    streamSocket.on("camera_started", handleCameraStarted);
    streamSocket.on("camera_viewer_joined", handleViewerJoined);
    streamSocket.on("camera_share_signal", handleCameraShareSignal);
    streamSocket.on("camera_stopped", handleCameraStopped);

    return () => {
      streamSocket.off("camera_started", handleCameraStarted);
      streamSocket.off("camera_viewer_joined", handleViewerJoined);
      streamSocket.off("camera_share_signal", handleCameraShareSignal);
      streamSocket.off("camera_stopped", handleCameraStopped);
    };
  }, [
    actions,
    currentUserId,
    isLocalSharing,
    createSharerPC,
    createViewerPC,
    closePeer,
  ]);

  // Mid-session device change: re-acquire stream and replaceTrack on all outbound PCs
  useEffect(() => {
    if (!isLocalSharing || !localStreamRef.current) return;

    const updateTrack = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: cameraConstraints,
        });

        // Stop old tracks
        localStreamRef.current?.getTracks().forEach((t) => t.stop());

        setLocalStream(newStream);
        localStreamRef.current = newStream;

        const newTrack = newStream.getVideoTracks()[0];
        if (newTrack) {
          peersRef.current.forEach((peer) => {
            const sender = peer.pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(newTrack);
            }
          });
        }
      } catch {
        console.error("[CameraShare] Failed to switch camera device");
      }
    };

    updateTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraConstraints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peersRef.current.forEach((peer) => peer.pc.close());
      peersRef.current.clear();
    };
  }, []);

  return useMemo(
    () => ({ startCamera, stopCamera, localStream, isLocalSharing, remoteStreams }),
    [startCamera, stopCamera, localStream, isLocalSharing, remoteStreams]
  );
}
