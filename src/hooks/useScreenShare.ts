"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useAtomValue } from "jotai";
import { screenShareAtom } from "@/store/roomAtoms";
import type { SocketActions } from "./useSocket";

interface ScreenSharePeer {
  pc: RTCPeerConnection;
  userId: string;
}

export interface UseScreenShareReturn {
  startSharing: () => Promise<void>;
  stopSharing: () => void;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isLocalSharing: boolean;
}

export function useScreenShare(
  actions: SocketActions,
  currentUserId: string | null,
): UseScreenShareReturn {
  const screenShare = useAtomValue(screenShareAtom);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const peersRef = useRef<Map<string, ScreenSharePeer>>(new Map());
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

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

    // Close existing PC for this viewer if any (stale from viewer refresh)
    const existing = peersRef.current.get(viewerUserId);
    if (existing) existing.pc.close();

    const pc = new RTCPeerConnection(getIceConfig());

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        actions.sendScreenShareSignal(viewerUserId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Add display tracks to the connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    peersRef.current.set(viewerUserId, { pc, userId: viewerUserId });

    // Create and send offer
    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
      actions.sendScreenShareSignal(viewerUserId, { type: "offer", sdp: offer });
    });
  }, [actions, getIceConfig]);

  // Viewer: create a PC for receiving and wait for the sharer's offer
  const createViewerPC = useCallback((sharerUserId: string) => {
    const pc = new RTCPeerConnection(getIceConfig());
    const incomingStream = new MediaStream();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        actions.sendScreenShareSignal(sharerUserId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        incomingStream.addTrack(track);
      });
      setRemoteStream(incomingStream);
    };

    peersRef.current.set(sharerUserId, { pc, userId: sharerUserId });
    return pc;
  }, [actions, getIceConfig]);

  // Start sharing the screen
  const startSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsLocalSharing(true);

      // Listen for browser "Stop Sharing" button
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        actions.stopScreenShare();
        setLocalStream(null);
        localStreamRef.current = null;
        setIsLocalSharing(false);
        closeAllPeers();
      });

      // Tell the server to start the screen share session
      actions.startScreenShare();
    } catch {
      console.error("[ScreenShare] Failed to capture display");
    }
  }, [actions, closeAllPeers]);

  // Stop sharing
  const stopSharing = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    setIsLocalSharing(false);
    closeAllPeers();
    actions.stopScreenShare();
  }, [localStream, actions, closeAllPeers]);

  // Listen for screen share signaling events
  useEffect(() => {
    const streamSocket = actions.getStreamSocket();
    if (!streamSocket) return;

    // When screen_share_started: if we're the sharer, create PCs for all viewers
    const handleScreenShareStarted = (data: {
      user_id?: number;
      viewer_user_ids?: string[];
    }) => {
      const sharerId = data.user_id ? String(data.user_id) : null;
      if (sharerId === currentUserId && data.viewer_user_ids) {
        // We are the sharer — create PCs for all current viewers
        // No peer existence guard — createSharerPC handles closing stale PCs
        data.viewer_user_ids.forEach((viewerUid) => {
          createSharerPC(viewerUid);
        });
      }
      // Viewers will wait for the offer to arrive via screen_share_signal
    };

    // New viewer joined (or re-joined after refresh) — sharer creates a fresh PC for them.
    // No peer existence guard — a viewer who refreshed needs a new offer even
    // though the old stale peer still exists in peersRef.
    const handleViewerJoined = (data: { user_id: string }) => {
      if (isLocalSharing) {
        createSharerPC(data.user_id);
      }
    };

    // Handle signaling messages (offer/answer/ice-candidate)
    const handleScreenShareSignal = (data: {
      from_user_id: string;
      signal: {
        type: string;
        sdp?: RTCSessionDescriptionInit;
        candidate?: RTCIceCandidateInit;
      };
    }) => {
      const { from_user_id, signal } = data;

      if (signal.type === "offer") {
        // We are a viewer receiving an offer from the sharer
        let peer = peersRef.current.get(from_user_id);
        const pc = peer ? peer.pc : createViewerPC(from_user_id);
        if (!peer) {
          peer = peersRef.current.get(from_user_id)!;
        }
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!))
          .then(() => pc.createAnswer())
          .then((answer) => {
            pc.setLocalDescription(answer);
            actions.sendScreenShareSignal(from_user_id, {
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

    // Screen share stopped — viewers clean up
    const handleScreenShareStopped = () => {
      closeAllPeers();
      setRemoteStream(null);
    };

    streamSocket.on("screen_share_started", handleScreenShareStarted);
    streamSocket.on("screen_share_viewer_joined", handleViewerJoined);
    streamSocket.on("screen_share_signal", handleScreenShareSignal);
    streamSocket.on("screen_share_stopped", handleScreenShareStopped);

    return () => {
      streamSocket.off("screen_share_started", handleScreenShareStarted);
      streamSocket.off("screen_share_viewer_joined", handleViewerJoined);
      streamSocket.off("screen_share_signal", handleScreenShareSignal);
      streamSocket.off("screen_share_stopped", handleScreenShareStopped);
    };
  }, [
    actions,
    currentUserId,
    isLocalSharing,
    createSharerPC,
    createViewerPC,
    closeAllPeers,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peersRef.current.forEach((peer) => peer.pc.close());
      peersRef.current.clear();
    };
  }, []);

  return useMemo(
    () => ({ startSharing, stopSharing, remoteStream, localStream, isLocalSharing }),
    [startSharing, stopSharing, remoteStream, localStream, isLocalSharing]
  );
}
