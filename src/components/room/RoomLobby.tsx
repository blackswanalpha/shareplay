"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { apiGetRoom, getAccessToken } from "@/lib/api";
import { adaptRoom } from "@/lib/adapters";
import { useUnreadCount } from "@/hooks/useApi";
import { Manager, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";

const LobbyPreview = dynamic(
  () => import("./LobbyPreview").then((m) => m.LobbyPreview),
  { ssr: false }
);

const LobbyInfo = dynamic(
  () => import("./LobbyInfo").then((m) => m.LobbyInfo),
  { ssr: false }
);

interface RoomLobbyProps {
  roomId: string;
}

export type LobbyStatus = "idle" | "requesting" | "waiting" | "approved" | "declined";

export function RoomLobby({ roomId }: RoomLobbyProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();
  const reducedMotion = useReducedMotion();
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>("idle");
  const socketRef = useRef<Socket | null>(null);

  const { data: apiRoom, isLoading, error } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => apiGetRoom(roomId),
  });

  const room = apiRoom ? adaptRoom(apiRoom) : null;
  const isHost = !!(apiRoom && user && String(apiRoom.host_id) === user.id);
  const requiresApproval = apiRoom?.settings?.require_approval === true && !isHost;

  // Connect a socket to listen for approval events
  useEffect(() => {
    if (!requiresApproval || lobbyStatus !== "waiting") return;

    const token = getAccessToken();
    if (!token) return;

    const manager = new Manager(API_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    const roomSocket = manager.socket("/room", { auth: { token } });
    socketRef.current = roomSocket;

    roomSocket.on("connect", () => {
      // Join room in "pending" state — listen for approval
      roomSocket.emit("join_room", { room_code: roomId, pending: true });
    });

    roomSocket.on("join_approved", () => {
      setLobbyStatus("approved");
      setTimeout(() => {
        router.push(`/room/${roomId}`);
      }, 600);
    });

    roomSocket.on("join_declined", () => {
      setLobbyStatus("declined");
    });

    // If the host doesn't respond within 60s, auto-decline
    const timeout = setTimeout(() => {
      if (lobbyStatus === "waiting") {
        setLobbyStatus("declined");
      }
    }, 60000);

    roomSocket.connect();

    return () => {
      clearTimeout(timeout);
      roomSocket.disconnect();
    };
  }, [requiresApproval, lobbyStatus, roomId, router]);

  const handleJoin = useCallback(() => {
    if (requiresApproval) {
      setLobbyStatus("requesting");
      // Short delay to show the requesting state before switching to waiting
      setTimeout(() => setLobbyStatus("waiting"), 400);
    } else {
      setLobbyStatus("requesting");
      setTimeout(() => {
        router.push(`/room/${roomId}`);
      }, 800);
    }
  }, [router, roomId, requiresApproval]);

  const handleRetry = useCallback(() => {
    setLobbyStatus("idle");
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0505",
          backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 16,
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error || !room || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0505",
          backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 16,
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Room not found
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0505",
        backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        onOpenCommandPalette={() => {}}
      />

      <motion.main
        initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? undefined : { duration: 0.4 }}
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <div
          className="lobby-layout"
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          <LobbyPreview
            micEnabled={micEnabled}
            camEnabled={camEnabled}
            onToggleMic={() => setMicEnabled((v) => !v)}
            onToggleCam={() => setCamEnabled((v) => !v)}
            userAvatar={user.avatar_url}
            username={user.username}
          />

          <LobbyInfo
            room={room}
            onJoin={handleJoin}
            onRetry={handleRetry}
            lobbyStatus={lobbyStatus}
            requiresApproval={requiresApproval}
          />
        </div>
      </motion.main>
    </div>
  );
}
