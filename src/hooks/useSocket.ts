"use client";

import { useEffect, useRef, useCallback } from "react";
import { Manager, type Socket } from "socket.io-client";
import { useSetAtom } from "jotai";
import { API_URL } from "@/lib/config";
import { getAccessToken, apiGetChatHistory, apiGetPlaylist } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/adapters";
import {
  participantsAtom,
  messagesAtom,
  queueAtom,
  currentTrackIdAtom,
  pendingUsersAtom,
  playerStateAtom,
  audioStateAtom,
  screenShareAtom,
  syncStatusAtom,
  socketConnectedAtom,
  roomAtom,
  roomEndedAtom,
  roomAnnouncementAtom,
  roomAlertsAtom,
  serviceStatusAtom,
} from "@/store/roomAtoms";
import type { RoomParticipant, ChatMessage, QueueTrack, PendingUser, Broadcast } from "@/lib/types";
import { toast } from "sonner";

export interface SocketActions {
  sendMessage: (text: string) => void;
  emitPlay: (currentTime: number) => void;
  emitPause: (currentTime: number) => void;
  emitSeek: (currentTime: number) => void;
  emitChangeMedia: (url: string, title: string) => void;
  joinAudio: () => void;
  leaveAudio: () => void;
  toggleMute: (muted: boolean) => void;
  addToPlaylist: (url: string) => void;
  votePlaylistItem: (trackId: string, vote: "up" | "down") => void;
  skipTrack: () => void;
  approveJoin: (userId: string) => void;
  declineJoin: (userId: string) => void;
  sendSignal: (targetUserId: string, signal: unknown) => void;
  sendScreenShareSignal: (targetUserId: string, signal: unknown) => void;
  getIceServers: () => Promise<RTCIceServer[]>;
  emitSpeaking: (isSpeaking: boolean) => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  getStreamSocket: () => Socket | null;
  sendAnnouncement: (title: string, body: string, requiresAck?: boolean) => void;
  dismissAnnouncement: () => void;
}

export function useSocket(roomId: string): SocketActions {
  const setParticipants = useSetAtom(participantsAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setQueue = useSetAtom(queueAtom);
  const setCurrentTrackId = useSetAtom(currentTrackIdAtom);
  const setPendingUsers = useSetAtom(pendingUsersAtom);
  const setPlayerState = useSetAtom(playerStateAtom);
  const setAudioState = useSetAtom(audioStateAtom);
  const setScreenShare = useSetAtom(screenShareAtom);
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setSocketConnected = useSetAtom(socketConnectedAtom);
  const setRoom = useSetAtom(roomAtom);
  const setRoomEnded = useSetAtom(roomEndedAtom);
  const setAnnouncement = useSetAtom(roomAnnouncementAtom);
  const setAlerts = useSetAtom(roomAlertsAtom);
  const setServiceStatus = useSetAtom(serviceStatusAtom);

  const socketsRef = useRef<{
    manager: Manager;
    room: Socket;
    chat: Socket;
    sync: Socket;
    audio: Socket;
    stream: Socket;
  } | null>(null);

  const sequenceRef = useRef(0);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let cleaned = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const manager = new Manager(API_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const roomSocket = manager.socket("/room", { auth: { token } });
    const chatSocket = manager.socket("/chat", { auth: { token } });
    const syncSocket = manager.socket("/sync", { auth: { token } });
    const audioSocket = manager.socket("/audio", { auth: { token } });
    const streamSocket = manager.socket("/stream", { auth: { token } });

    socketsRef.current = {
      manager,
      room: roomSocket,
      chat: chatSocket,
      sync: syncSocket,
      audio: audioSocket,
      stream: streamSocket,
    };

    // Clear any previous room-ended state on fresh mount
    setRoomEnded(null);

    // --- /room namespace ---
    roomSocket.on("connect", () => {
      if (cleaned) return;
      console.log("[SharePlay] Room socket connected");
      setSocketConnected(true);
      roomSocket.emit("join_room", { room_code: roomId });
    });

    roomSocket.on("connect_error", (err: Error) => {
      if (cleaned) return;
      console.error("[SharePlay] Room socket connection error:", err.message);
    });

    roomSocket.on("disconnect", (reason: string) => {
      if (cleaned) return;
      console.log("[SharePlay] Room socket disconnected:", reason);
      setSocketConnected(false);
    });

    roomSocket.on("error", (data: { message?: string }) => {
      if (cleaned) return;
      const msg = data?.message || "";
      console.error("[SharePlay] Room error:", msg);
      if (msg.includes("not found") || msg.includes("inactive")) {
        setRoomEnded("room_inactive");
      }
    });

    roomSocket.on("room_ended", (data: { reason?: string }) => {
      if (cleaned) return;
      const reason = data?.reason || "room_ended";
      setRoomEnded(reason as "host_left" | "host_disconnected" | "room_ended");
    });

    roomSocket.on("heartbeat_ping", (data: { ts: number }) => {
      if (cleaned) return;
      roomSocket.emit("heartbeat_pong", { ts: data.ts });
    });

    roomSocket.on("room_state", (data: {
      participants?: Array<{ user_id: number; username: string; avatar_url?: string | null; role: string }>;
      settings?: Record<string, unknown>;
      sync_state?: { video_url?: string; title?: string; is_playing?: boolean; current_time?: number; duration?: number; sequence_id?: number };
    }) => {
      if (cleaned) return;
      // Participants from connection manager
      if (data.participants) {
        setParticipants(data.participants.map((p): RoomParticipant => ({
          id: String(p.user_id),
          username: p.username,
          avatar_url: resolveAvatarUrl(p.avatar_url ?? null, p.username),
          is_online: true,
          role: (p.role === "primary_host" ? "host" : p.role === "co_host" ? "co-host" : "member") as "host" | "co-host" | "member",
          is_muted: false,
          is_speaking: false,
          is_deafened: false,
          is_screen_sharing: false,
        })));
      }
      // Sync state (current playback)
      if (data.sync_state && data.sync_state.video_url) {
        sequenceRef.current = data.sync_state.sequence_id || 0;
        setPlayerState({
          isPlaying: data.sync_state.is_playing || false,
          currentTime: data.sync_state.current_time || 0,
          videoUrl: data.sync_state.video_url,
          title: data.sync_state.title || "",
          subtitle: "",
          thumbnailUrl: "",
          duration: data.sync_state.duration || 0,
          sequenceId: data.sync_state.sequence_id || 0,
        });
      }
      // Load chat history via REST (backend doesn't include messages in room_state)
      apiGetChatHistory(roomId).then((history) => {
        if (cleaned) return;
        if (history && history.length > 0) {
          const historyMsgs = history.map((m): ChatMessage => ({
            id: String(m.id),
            sender: {
              id: String(m.user_id),
              username: m.username,
              avatar_url: resolveAvatarUrl(m.avatar_url ?? null, m.username),
            },
            text: m.content,
            is_system: m.message_type === "system",
            created_at: m.created_at,
          }));
          // Merge with any real-time messages that arrived before history loaded
          setMessages((prev) => {
            const historyIds = new Set(historyMsgs.map((m) => m.id));
            const realtimeOnly = prev.filter((m) => !historyIds.has(m.id));
            return [...historyMsgs, ...realtimeOnly];
          });
        }
      }).catch(() => { /* Chat history load failed, messages will come via socket */ });

      // Load existing playlist/queue via REST
      apiGetPlaylist(roomId).then((items) => {
        if (cleaned) return;
        if (items && items.length > 0) {
          setQueue(items.map((item): QueueTrack => ({
            id: String(item.id),
            title: item.title,
            artist: item.added_by_username || "",
            album_art_url: item.thumbnail_url || "",
            duration_seconds: item.duration_seconds ?? 0,
            added_by: item.added_by_username || "",
            vote_score: 0,
            status: item.status as QueueTrack["status"],
          })));
        }
      }).catch(() => { /* Playlist load failed, items will come via socket */ });
    });

    roomSocket.on("user_left", (data: { user_id: number }) => {
      if (cleaned) return;
      setParticipants((prev) =>
        prev.map((p) => p.id === String(data.user_id) ? { ...p, is_online: false } : p)
      );
    });

    // Lobby user requesting to join (pending approval)
    roomSocket.on("join_request", (data: { user_id: number; username: string; avatar_url?: string | null }) => {
      if (cleaned) return;
      console.log("[SharePlay] join_request received:", data);
      const pending: PendingUser = {
        id: String(data.user_id),
        username: data.username,
        avatar_url: resolveAvatarUrl(data.avatar_url ?? null, data.username),
        requested_at: new Date().toISOString(),
      };
      setPendingUsers((prev) => {
        if (prev.some((p) => p.id === pending.id)) return prev;
        return [...prev, pending];
      });
    });

    // When a pending user is approved/declined or fully joins, remove from pending
    roomSocket.on("user_joined", (data: { user_id: number; username: string; avatar_url: string | null; role: string }) => {
      if (cleaned) return;
      // Remove from pending list since they've been approved and joined
      setPendingUsers((prev) => prev.filter((p) => p.id !== String(data.user_id)));

      setParticipants((prev) => {
        const existing = prev.find((p) => p.id === String(data.user_id));
        if (existing) {
          return prev.map((p) => p.id === String(data.user_id) ? { ...p, is_online: true } : p);
        }
        return [...prev, {
          id: String(data.user_id),
          username: data.username,
          avatar_url: resolveAvatarUrl(data.avatar_url ?? null, data.username),
          is_online: true,
          role: (data.role === "primary_host" ? "host" : data.role === "co_host" ? "co-host" : "member") as "host" | "co-host" | "member",
          is_muted: false,
          is_speaking: false,
          is_deafened: false,
          is_screen_sharing: false,
        }];
      });
    });

    // --- Broadcast listeners ---
    roomSocket.on("broadcast:announcement", (data: Broadcast) => {
      if (cleaned) return;
      setAnnouncement(data);
      if (data.requires_ack) {
        roomSocket.emit("broadcast:ack", { broadcast_id: data.id });
      }
    });

    roomSocket.on("broadcast:alert", (data: Broadcast) => {
      if (cleaned) return;
      toast(data.title, {
        description: data.body,
        duration: data.auto_dismiss_ms || 8000,
      });
      setAlerts((prev) => [...prev.slice(-19), data]);
    });

    roomSocket.on("broadcast:service_status", (data: Broadcast) => {
      if (cleaned) return;
      setServiceStatus(data);
      if (data.requires_ack) {
        roomSocket.emit("broadcast:ack", { broadcast_id: data.id });
      }
    });

    roomSocket.on("broadcast:dismiss", (data: { type: string }) => {
      if (cleaned) return;
      if (data.type === "announcement") setAnnouncement(null);
      if (data.type === "service_status") setServiceStatus(null);
    });

    // --- /chat namespace ---
    chatSocket.on("connect", () => {
      if (cleaned) return;
      chatSocket.emit("join_room", { room_code: roomId });
    });

    chatSocket.on("connect_error", (err: Error) => {
      if (cleaned) return;
      console.error("[SharePlay] Chat socket connection error:", err.message);
    });

    chatSocket.on("error", (data: { message?: string }) => {
      if (cleaned) return;
      console.error("[SharePlay] Chat socket error:", data?.message || data);
    });

    chatSocket.on("new_message", (data: { id: number; user_id: number; username: string; avatar_url?: string | null; content: string; message_type?: string; created_at: string }) => {
      if (cleaned) return;
      const msg: ChatMessage = {
        id: String(data.id),
        sender: {
          id: String(data.user_id),
          username: data.username,
          avatar_url: resolveAvatarUrl(data.avatar_url ?? null, data.username),
        },
        text: data.content,
        is_system: data.message_type === "system",
        created_at: data.created_at,
      };
      setMessages((prev) => {
        // Dedupe by id
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    chatSocket.on("system_message", (data: { message: string; created_at: string }) => {
      if (cleaned) return;
      setMessages((prev) => [...prev, {
        id: `sys-${Date.now()}`,
        sender: { id: "system", username: "System", avatar_url: "" },
        text: data.message,
        is_system: true,
        created_at: data.created_at,
      }]);
    });

    // --- /sync namespace ---
    syncSocket.on("connect", () => {
      if (cleaned) return;
      syncSocket.emit("join_room", { room_code: roomId });
    });

    syncSocket.on("sync_update", (data: { video_url?: string; title?: string; subtitle?: string; thumbnail_url?: string; is_playing: boolean; current_time: number; duration?: number; sequence_id: number }) => {
      if (cleaned) return;
      if (data.sequence_id >= sequenceRef.current) {
        sequenceRef.current = data.sequence_id;
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: data.is_playing,
          currentTime: data.current_time,
          videoUrl: data.video_url || prev.videoUrl,
          title: data.title || prev.title,
          subtitle: data.subtitle || prev.subtitle,
          thumbnailUrl: data.thumbnail_url || prev.thumbnailUrl,
          duration: data.duration ?? prev.duration,
          sequenceId: data.sequence_id,
        }));
        setSyncStatus("synced");
      }
    });

    syncSocket.on("sync_rejected", (data: { reason: string; current_state?: { is_playing: boolean; current_time: number; sequence_id: number } }) => {
      if (cleaned) return;
      if (data.current_state) {
        sequenceRef.current = data.current_state.sequence_id;
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: data.current_state!.is_playing,
          currentTime: data.current_state!.current_time,
          sequenceId: data.current_state!.sequence_id,
        }));
      }
      setSyncStatus("out-of-sync");
      const t = setTimeout(() => {
        if (!cleaned) setSyncStatus("synced");
      }, 3000);
      timers.push(t);
    });

    syncSocket.on("media_changed", (data: { video_url: string; title: string; subtitle?: string; thumbnail_url?: string; duration: number; sequence_id: number }) => {
      if (cleaned) return;
      sequenceRef.current = data.sequence_id;
      setPlayerState({
        isPlaying: true,
        currentTime: 0,
        videoUrl: data.video_url,
        title: data.title,
        subtitle: data.subtitle || "",
        thumbnailUrl: data.thumbnail_url || "",
        duration: data.duration,
        sequenceId: data.sequence_id,
      });
    });

    syncSocket.on("playlist_updated", (data: { action: string; item: { id: string; title: string; url: string; duration_seconds: number; thumbnail_url?: string; added_by_username?: string; votes?: number } }) => {
      if (cleaned) return;
      if (data.action === "add" && data.item) {
        setQueue((prev) => {
          if (prev.some((t) => t.id === data.item.id)) return prev;
          return [...prev, {
            id: data.item.id,
            title: data.item.title,
            artist: data.item.added_by_username || "",
            album_art_url: data.item.thumbnail_url || "",
            duration_seconds: data.item.duration_seconds,
            added_by: data.item.added_by_username || "",
            vote_score: 0,
            status: "queued" as const,
          }];
        });
      } else if (data.action === "remove" && data.item) {
        setQueue((prev) => prev.filter((t) => t.id !== data.item.id));
      } else if (data.action === "vote" && data.item) {
        setQueue((prev) => prev.map((t) =>
          t.id === data.item.id
            ? { ...t, vote_score: data.item.votes ?? t.vote_score }
            : t
        ));
      }
    });

    // --- /audio namespace ---
    audioSocket.on("connect", () => {
      if (cleaned) return;
      audioSocket.emit("join_room", { room_code: roomId });
    });

    audioSocket.on("audio_state_update", (data: { user_id: number; is_muted: boolean; is_speaking: boolean }) => {
      if (cleaned) return;
      setParticipants((prev) =>
        prev.map((p) => p.id === String(data.user_id)
          ? { ...p, is_muted: data.is_muted, is_speaking: data.is_speaking }
          : p
        )
      );
    });

    // --- /stream namespace ---
    streamSocket.on("connect", () => {
      if (cleaned) return;
      streamSocket.emit("join_room", { room_code: roomId });
    });

    streamSocket.on("screen_share_started", (data: { user_id?: number; username?: string; session_id?: string; viewer_user_ids?: string[] }) => {
      if (cleaned) return;
      setScreenShare({
        isSharing: true,
        sharerUserId: data.user_id ? String(data.user_id) : null,
        sessionId: data.session_id || null,
      });
    });

    streamSocket.on("screen_share_stopped", () => {
      if (cleaned) return;
      setScreenShare({ isSharing: false, sharerUserId: null, sessionId: null });
    });

    // Connect all
    roomSocket.connect();
    chatSocket.connect();
    syncSocket.connect();
    audioSocket.connect();
    streamSocket.connect();

    return () => {
      cleaned = true;

      // Clear all pending timers
      for (const t of timers) clearTimeout(t);

      // Disconnect sockets
      socketsRef.current = null;
      roomSocket.emit("leave_room", { room_code: roomId });
      roomSocket.removeAllListeners();
      chatSocket.removeAllListeners();
      syncSocket.removeAllListeners();
      audioSocket.removeAllListeners();
      streamSocket.off("screen_share_started");
      streamSocket.off("screen_share_stopped");
      streamSocket.removeAllListeners();
      roomSocket.disconnect();
      chatSocket.disconnect();
      syncSocket.disconnect();
      audioSocket.disconnect();
      streamSocket.disconnect();
      manager.engine?.close();

      // Reset all room state atoms to defaults
      setRoom(null);
      setParticipants([]);
      setMessages([]);
      setQueue([]);
      setCurrentTrackId(undefined);
      setPendingUsers([]);
      setPlayerState({
        isPlaying: false,
        currentTime: 0,
        videoUrl: "",
        title: "",
        subtitle: "",
        thumbnailUrl: "",
        duration: 0,
        sequenceId: 0,
      });
      setAudioState({ isMuted: false, isDeafened: false, isInAudio: false });
      setScreenShare({ isSharing: false, sharerUserId: null, sessionId: null });
      setSyncStatus("synced");
      setSocketConnected(false);
      setAnnouncement(null);
      setAlerts([]);
      setServiceStatus(null);
    };
  }, [roomId, setParticipants, setMessages, setQueue, setCurrentTrackId, setPendingUsers, setPlayerState, setAudioState, setScreenShare, setSyncStatus, setSocketConnected, setRoom, setRoomEnded, setAnnouncement, setAlerts, setServiceStatus]);

  const sendMessage = useCallback((text: string) => {
    const chat = socketsRef.current?.chat;
    if (!chat?.connected) {
      console.error("[SharePlay] Chat socket not connected, cannot send message");
      return;
    }
    chat.emit("send_message", { room_code: roomId, content: text });
  }, [roomId]);

  const emitPlay = useCallback((currentTime: number) => {
    sequenceRef.current++;
    socketsRef.current?.sync.emit("play", {
      room_code: roomId,
      current_time: currentTime,
      sequence_id: sequenceRef.current,
    });
    setSyncStatus("syncing");
  }, [roomId, setSyncStatus]);

  const emitPause = useCallback((currentTime: number) => {
    sequenceRef.current++;
    socketsRef.current?.sync.emit("pause", {
      room_code: roomId,
      current_time: currentTime,
      sequence_id: sequenceRef.current,
    });
    setSyncStatus("syncing");
  }, [roomId, setSyncStatus]);

  const emitSeek = useCallback((currentTime: number) => {
    sequenceRef.current++;
    socketsRef.current?.sync.emit("seek", {
      room_code: roomId,
      current_time: currentTime,
      sequence_id: sequenceRef.current,
    });
    setSyncStatus("syncing");
  }, [roomId, setSyncStatus]);

  const emitChangeMedia = useCallback((url: string, title: string) => {
    sequenceRef.current++;
    socketsRef.current?.sync.emit("change_media", {
      room_code: roomId,
      url,
      title,
      sequence_id: sequenceRef.current,
    });
    // Optimistically update player state — the sync_update echo from the
    // server will be dropped (sequence_id == sequenceRef.current, not >),
    // so set state locally so the host sees the video immediately.
    setPlayerState({
      isPlaying: true,
      currentTime: 0,
      videoUrl: url,
      title,
      subtitle: "",
      thumbnailUrl: "",
      duration: 0,
      sequenceId: sequenceRef.current,
    });
    setSyncStatus("syncing");
  }, [roomId, setPlayerState, setSyncStatus]);

  const joinAudio = useCallback(() => {
    socketsRef.current?.audio.emit("join_audio", { room_code: roomId });
    setAudioState((prev) => ({ ...prev, isInAudio: true }));
  }, [roomId, setAudioState]);

  const leaveAudio = useCallback(() => {
    socketsRef.current?.audio.emit("leave_audio", { room_code: roomId });
    setAudioState((prev) => ({ ...prev, isInAudio: false, isMuted: false, isDeafened: false }));
  }, [roomId, setAudioState]);

  const toggleMute = useCallback((muted: boolean) => {
    socketsRef.current?.audio.emit("toggle_mute", { room_code: roomId, is_muted: muted });
    setAudioState((prev) => ({ ...prev, isMuted: muted }));
  }, [roomId, setAudioState]);

  const addToPlaylist = useCallback((url: string) => {
    socketsRef.current?.sync.emit("add_to_playlist", { room_code: roomId, url });
  }, [roomId]);

  const votePlaylistItem = useCallback((trackId: string, vote: "up" | "down") => {
    socketsRef.current?.sync.emit("vote_playlist_item", { room_code: roomId, track_id: trackId, vote });
  }, [roomId]);

  const skipTrack = useCallback(() => {
    socketsRef.current?.sync.emit("skip_track", { room_code: roomId });
  }, [roomId]);

  const approveJoin = useCallback((userId: string) => {
    socketsRef.current?.room.emit("approve_join", { user_id: Number(userId) });
    setPendingUsers((prev) => prev.filter((p) => p.id !== userId));
  }, [setPendingUsers]);

  const declineJoin = useCallback((userId: string) => {
    socketsRef.current?.room.emit("decline_join", { user_id: Number(userId) });
    setPendingUsers((prev) => prev.filter((p) => p.id !== userId));
  }, [setPendingUsers]);

  const sendSignal = useCallback((targetUserId: string, signal: unknown) => {
    socketsRef.current?.stream.emit("signal", {
      room_code: roomId,
      target_user_id: targetUserId,
      signal,
    });
  }, [roomId]);

  const sendScreenShareSignal = useCallback((targetUserId: string, signal: unknown) => {
    socketsRef.current?.stream.emit("screen_share_signal", {
      room_code: roomId,
      target_user_id: targetUserId,
      signal,
    });
  }, [roomId]);

  const getIceServers = useCallback((): Promise<RTCIceServer[]> => {
    return new Promise((resolve) => {
      const stream = socketsRef.current?.stream;
      if (!stream) {
        resolve([{ urls: "stun:stun.l.google.com:19302" }]);
        return;
      }
      stream.emit("get_ice_servers", { room_code: roomId }, (response: { servers?: RTCIceServer[] }) => {
        resolve(response?.servers || [{ urls: "stun:stun.l.google.com:19302" }]);
      });
    });
  }, [roomId]);

  const emitSpeaking = useCallback((isSpeaking: boolean) => {
    socketsRef.current?.audio.emit("speaking", { room_code: roomId, is_speaking: isSpeaking });
  }, [roomId]);

  const startScreenShare = useCallback(() => {
    socketsRef.current?.stream.emit("start_screen_share", { room_code: roomId });
    setScreenShare((prev) => ({ ...prev, isSharing: true }));
  }, [roomId, setScreenShare]);

  const stopScreenShare = useCallback(() => {
    socketsRef.current?.stream.emit("stop_screen_share", { room_code: roomId });
    setScreenShare((prev) => ({ ...prev, isSharing: false, sharerUserId: null, sessionId: null }));
  }, [roomId, setScreenShare]);

  const getStreamSocket = useCallback(() => {
    return socketsRef.current?.stream || null;
  }, []);

  const sendAnnouncement = useCallback((title: string, body: string, requiresAck?: boolean) => {
    socketsRef.current?.room.emit("send_announcement", {
      title,
      body,
      requires_ack: requiresAck ?? false,
    });
  }, []);

  const dismissAnnouncement = useCallback(() => {
    socketsRef.current?.room.emit("dismiss_announcement", {});
  }, []);

  return {
    sendMessage,
    emitPlay,
    emitPause,
    emitSeek,
    emitChangeMedia,
    joinAudio,
    leaveAudio,
    toggleMute,
    addToPlaylist,
    votePlaylistItem,
    skipTrack,
    approveJoin,
    declineJoin,
    sendSignal,
    sendScreenShareSignal,
    getIceServers,
    emitSpeaking,
    startScreenShare,
    stopScreenShare,
    getStreamSocket,
    sendAnnouncement,
    dismissAnnouncement,
  };
}
