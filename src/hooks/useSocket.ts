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
  cameraShareAtom,
  syncStatusAtom,
  socketConnectedAtom,
  roomAtom,
  roomEndedAtom,
  roomAnnouncementAtom,
  roomAlertsAtom,
  serviceStatusAtom,
  liveReactionsAtom,
} from "@/store/roomAtoms";
import type { RoomParticipant, ChatMessage, QueueTrack, PendingUser, Broadcast, LiveReaction } from "@/lib/types";
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
  addToPlaylist: (url: string, meta?: { title?: string; thumbnail_url?: string; duration_seconds?: number }) => void;
  removeFromPlaylist: (trackId: string) => void;
  playPlaylistItem: (trackId: string) => void;
  votePlaylistItem: (trackId: string, vote: "up" | "down") => void;
  skipTrack: () => void;
  playNext: () => void;
  approveJoin: (userId: string) => void;
  declineJoin: (userId: string) => void;
  assignRole: (targetUserId: string, role: string) => void;
  sendSignal: (targetUserId: string, signal: unknown) => void;
  sendScreenShareSignal: (targetUserId: string, signal: unknown) => void;
  getIceServers: () => Promise<RTCIceServer[]>;
  emitSpeaking: (isSpeaking: boolean) => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  sendCameraShareSignal: (targetUserId: string, signal: unknown) => void;
  startCamera: () => void;
  stopCamera: () => void;
  getStreamSocket: () => Socket | null;
  sendAnnouncement: (title: string, body: string, requiresAck?: boolean) => void;
  dismissAnnouncement: () => void;
  addReaction: (messageId: string, emoji: string) => void;
  sendLiveReaction: (emoji: string) => void;
  leaveRoom: () => void;
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
  const setCameraShare = useSetAtom(cameraShareAtom);
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setSocketConnected = useSetAtom(socketConnectedAtom);
  const setRoom = useSetAtom(roomAtom);
  const setRoomEnded = useSetAtom(roomEndedAtom);
  const setAnnouncement = useSetAtom(roomAnnouncementAtom);
  const setAlerts = useSetAtom(roomAlertsAtom);
  const setServiceStatus = useSetAtom(serviceStatusAtom);
  const setLiveReactions = useSetAtom(liveReactionsAtom);

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
      streaming_state?: {
        audio_participants?: Record<string, { user_id?: number; is_muted?: boolean; is_speaking?: boolean }>;
        camera_sharers?: number[];
        screen_share?: { user_id: number; username?: string; session_id?: string } | null;
      };
    }) => {
      if (cleaned) return;
      const ss = data.streaming_state;

      // Participants from connection manager — use streaming_state for accurate flags
      if (data.participants) {
        setParticipants(data.participants.map((p): RoomParticipant => {
          const audioInfo = ss?.audio_participants?.[String(p.user_id)];
          const isCameraSharing = ss?.camera_sharers?.includes(p.user_id) ?? false;
          const isScreenSharing = ss?.screen_share?.user_id === p.user_id;
          return {
            id: String(p.user_id),
            username: p.username,
            avatar_url: resolveAvatarUrl(p.avatar_url ?? null, p.username),
            is_online: true,
            role: (p.role === "primary_host" ? "host" : p.role === "co_host" ? "co-host" : "member") as "host" | "co-host" | "member",
            is_muted: audioInfo?.is_muted ?? false,
            is_speaking: audioInfo?.is_speaking ?? false,
            is_deafened: false,
            is_screen_sharing: isScreenSharing,
            is_camera_sharing: isCameraSharing,
          };
        }));
      }

      // Set screen share and camera share atoms from streaming_state
      if (ss?.screen_share) {
        setScreenShare({
          isSharing: true,
          sharerUserId: String(ss.screen_share.user_id),
          sessionId: ss.screen_share.session_id || null,
        });
      }
      if (ss?.camera_sharers && ss.camera_sharers.length > 0) {
        setCameraShare({ sharerUserIds: ss.camera_sharers.map(String) });
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
          const historyMsgs = history.map((m): ChatMessage => {
            const reactions: Record<string, string[]> = {};
            if (m.reactions) {
              for (const [emoji, userIds] of Object.entries(m.reactions)) {
                reactions[emoji] = (userIds as number[]).map(String);
              }
            }
            return {
              id: String(m.id),
              sender: {
                id: String(m.user_id),
                username: m.username,
                avatar_url: resolveAvatarUrl(m.avatar_url ?? null, m.username),
              },
              text: m.content,
              is_system: m.message_type === "system",
              created_at: m.created_at,
              reactions: Object.keys(reactions).length > 0 ? reactions : undefined,
            };
          });
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

    roomSocket.on("user_reconnected", (data: { user_id: number; username: string; avatar_url: string | null; role: string }) => {
      if (cleaned) return;
      // Silently mark participant as online without triggering join UI
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
          is_camera_sharing: false,
        }];
      });
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
          is_camera_sharing: false,
        }];
      });
    });

    roomSocket.on("role_changed", (data: { target_user_id: number; new_role: string; changed_by: number }) => {
      if (cleaned) return;
      const frontendRole = (
        data.new_role === "primary_host" ? "host" :
        data.new_role === "co_host" ? "co-host" : "member"
      ) as "host" | "co-host" | "member";

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === String(data.target_user_id)) return { ...p, role: frontendRole };
          // Host transfer: demote old host to co-host
          if (data.new_role === "primary_host" && p.id === String(data.changed_by)) return { ...p, role: "co-host" as const };
          return p;
        })
      );
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

    // --- Live reactions ---
    roomSocket.on("live_reaction", (data: { user_id: number; username: string; emoji: string }) => {
      if (cleaned) return;
      const reaction: LiveReaction = {
        id: `lr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        emoji: data.emoji,
        userId: String(data.user_id),
        username: data.username,
        x: 5 + Math.random() * 25,
        createdAt: Date.now(),
      };
      setLiveReactions((prev) => [...prev.slice(-29), reaction]);
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

    chatSocket.on("reaction_updated", (data: { message_id: number; reactions: Record<string, number[]> }) => {
      if (cleaned) return;
      const converted: Record<string, string[]> = {};
      for (const [emoji, userIds] of Object.entries(data.reactions)) {
        converted[emoji] = userIds.map(String);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === String(data.message_id) ? { ...m, reactions: converted } : m
        )
      );
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

    syncSocket.on("playlist_now_playing", (data: { now_playing: { id: number; url: string; title: string; thumbnail_url?: string; duration_seconds?: number; added_by_username?: string; status: string } | null }) => {
      if (cleaned) return;
      const np = data.now_playing;
      // Update queue statuses: mark old playing as played, mark new as playing
      setQueue((prev) => prev.map((t) => {
        if (np && String(np.id) === t.id) {
          return { ...t, status: "playing" as const };
        }
        if (t.status === "playing") {
          return { ...t, status: "played" as const };
        }
        return t;
      }));
      // Update player state to switch to the next video
      if (np) {
        sequenceRef.current += 1;
        setPlayerState({
          isPlaying: true,
          currentTime: 0,
          videoUrl: np.url,
          title: np.title,
          subtitle: np.added_by_username || "",
          thumbnailUrl: np.thumbnail_url || "",
          duration: np.duration_seconds ?? 0,
          sequenceId: sequenceRef.current,
        });
      } else {
        // Queue exhausted — stop playback
        setPlayerState({
          isPlaying: false,
          currentTime: 0,
          videoUrl: "",
          title: "",
          subtitle: "",
          thumbnailUrl: "",
          duration: 0,
          sequenceId: sequenceRef.current,
        });
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

    streamSocket.on("camera_started", (data: { user_id?: number; username?: string; viewer_user_ids?: string[] }) => {
      if (cleaned) return;
      const uid = data.user_id ? String(data.user_id) : null;
      if (uid) {
        setCameraShare((prev) => ({
          sharerUserIds: prev.sharerUserIds.includes(uid) ? prev.sharerUserIds : [...prev.sharerUserIds, uid],
        }));
        setParticipants((prev) =>
          prev.map((p) => p.id === uid ? { ...p, is_camera_sharing: true } : p)
        );
      }
    });

    streamSocket.on("camera_stopped", (data: { user_id?: number }) => {
      if (cleaned) return;
      const uid = data.user_id ? String(data.user_id) : null;
      if (uid) {
        setCameraShare((prev) => ({
          sharerUserIds: prev.sharerUserIds.filter((id) => id !== uid),
        }));
        setParticipants((prev) =>
          prev.map((p) => p.id === uid ? { ...p, is_camera_sharing: false } : p)
        );
      }
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
      roomSocket.removeAllListeners();
      chatSocket.removeAllListeners();
      syncSocket.removeAllListeners();
      audioSocket.removeAllListeners();
      streamSocket.off("screen_share_started");
      streamSocket.off("screen_share_stopped");
      streamSocket.off("camera_started");
      streamSocket.off("camera_stopped");
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
      setCameraShare({ sharerUserIds: [] });
      setSyncStatus("synced");
      setSocketConnected(false);
      setAnnouncement(null);
      setAlerts([]);
      setServiceStatus(null);
      setLiveReactions([]);
    };
  }, [roomId, setParticipants, setMessages, setQueue, setCurrentTrackId, setPendingUsers, setPlayerState, setAudioState, setScreenShare, setCameraShare, setSyncStatus, setSocketConnected, setRoom, setRoomEnded, setAnnouncement, setAlerts, setServiceStatus, setLiveReactions]);

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

  const addToPlaylist = useCallback((url: string, meta?: { title?: string; thumbnail_url?: string; duration_seconds?: number }) => {
    socketsRef.current?.sync.emit("playlist_add", {
      room_code: roomId,
      url,
      ...(meta?.title && { title: meta.title }),
      ...(meta?.thumbnail_url && { thumbnail_url: meta.thumbnail_url }),
      ...(meta?.duration_seconds != null && { duration_seconds: meta.duration_seconds }),
    });
  }, [roomId]);

  const removeFromPlaylist = useCallback((trackId: string) => {
    socketsRef.current?.sync.emit("playlist_remove", { room_code: roomId, item_id: trackId });
  }, [roomId]);

  const playPlaylistItem = useCallback((trackId: string) => {
    socketsRef.current?.sync.emit("playlist_play_item", { room_code: roomId, item_id: trackId });
  }, [roomId]);

  const votePlaylistItem = useCallback((trackId: string, vote: "up" | "down") => {
    socketsRef.current?.sync.emit("playlist_vote", { room_code: roomId, item_id: trackId, vote: vote === "up" ? 1 : -1 });
  }, [roomId]);

  const skipTrack = useCallback(() => {
    socketsRef.current?.sync.emit("playlist_skip", { room_code: roomId });
  }, [roomId]);

  const playNext = useCallback(() => {
    socketsRef.current?.sync.emit("playlist_next", { room_code: roomId });
  }, [roomId]);

  const approveJoin = useCallback((userId: string) => {
    socketsRef.current?.room.emit("approve_join", { user_id: Number(userId) });
    setPendingUsers((prev) => prev.filter((p) => p.id !== userId));
  }, [setPendingUsers]);

  const declineJoin = useCallback((userId: string) => {
    socketsRef.current?.room.emit("decline_join", { user_id: Number(userId) });
    setPendingUsers((prev) => prev.filter((p) => p.id !== userId));
  }, [setPendingUsers]);

  const assignRole = useCallback((targetUserId: string, role: string) => {
    socketsRef.current?.room.emit("assign_role", {
      target_user_id: Number(targetUserId),
      role,
    });
  }, []);

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

  const sendCameraShareSignal = useCallback((targetUserId: string, signal: unknown) => {
    socketsRef.current?.stream.emit("camera_share_signal", {
      room_code: roomId,
      target_user_id: targetUserId,
      signal,
    });
  }, [roomId]);

  const startCamera = useCallback(() => {
    socketsRef.current?.stream.emit("start_camera", { room_code: roomId });
  }, [roomId]);

  const stopCamera = useCallback(() => {
    socketsRef.current?.stream.emit("stop_camera", { room_code: roomId });
  }, [roomId]);

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

  const addReaction = useCallback((messageId: string, emoji: string) => {
    const chat = socketsRef.current?.chat;
    if (!chat?.connected) return;
    chat.emit("add_reaction", { message_id: Number(messageId), emoji });
  }, []);

  const leaveRoom = useCallback(() => {
    socketsRef.current?.room.emit("leave_room", { room_code: roomId });
  }, [roomId]);

  const sendLiveReaction = useCallback((emoji: string) => {
    const room = socketsRef.current?.room;
    if (!room?.connected) return;
    room.emit("live_reaction", { room_code: roomId, emoji });
    // Optimistic local update so user sees own reaction immediately
    const reaction: LiveReaction = {
      id: `lr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      emoji,
      userId: "self",
      username: "You",
      x: 5 + Math.random() * 25,
      createdAt: Date.now(),
    };
    setLiveReactions((prev) => [...prev.slice(-29), reaction]);
  }, [roomId, setLiveReactions]);

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
    removeFromPlaylist,
    playPlaylistItem,
    votePlaylistItem,
    skipTrack,
    playNext,
    approveJoin,
    declineJoin,
    assignRole,
    sendSignal,
    sendScreenShareSignal,
    getIceServers,
    emitSpeaking,
    startScreenShare,
    stopScreenShare,
    sendCameraShareSignal,
    startCamera,
    stopCamera,
    getStreamSocket,
    sendAnnouncement,
    dismissAnnouncement,
    addReaction,
    sendLiveReaction,
    leaveRoom,
  };
}
