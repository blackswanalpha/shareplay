"use client";

import { createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom, useAtomValue } from "jotai";
import { apiGetRoom } from "@/lib/api";
import { adaptRoom } from "@/lib/adapters";
import { useSocket } from "@/hooks/useSocket";
import { useScreenShare } from "@/hooks/useScreenShare";
import type { UseScreenShareReturn } from "@/hooks/useScreenShare";
import { useWebRTC } from "@/hooks/useWebRTC";
import {
  roomAtom,
  socketConnectedAtom,
  roomEndedAtom,
} from "@/store/roomAtoms";
import type { RoomEndedReason } from "@/store/roomAtoms";

export const ScreenShareContext = createContext<UseScreenShareReturn>({
  startSharing: async () => {},
  stopSharing: () => {},
  remoteStream: null,
  localStream: null,
  isLocalSharing: false,
});

export interface VoiceChatContextValue {
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  isInVoice: boolean;
}

export const VoiceChatContext = createContext<VoiceChatContextValue>({
  joinVoice: async () => {},
  leaveVoice: () => {},
  isInVoice: false,
});

const RoomHeader = dynamic(
  () => import("./RoomHeader").then((m) => m.RoomHeader),
  { ssr: false }
);

const RoomMainContent = dynamic(
  () => import("./RoomMainContent").then((m) => m.RoomMainContent),
  { ssr: false }
);

const RoomSidebar = dynamic(
  () => import("./RoomSidebar").then((m) => m.RoomSidebar),
  { ssr: false }
);

const VoiceBar = dynamic(
  () => import("./VoiceBar").then((m) => m.VoiceBar),
  { ssr: false }
);

const BroadcastBanner = dynamic(
  () => import("./BroadcastBanner").then((m) => m.BroadcastBanner),
  { ssr: false }
);

const ENDED_MESSAGES: Record<string, { title: string; description: string }> = {
  host_left: {
    title: "Room no longer exists",
    description: "The host has left and the room has been closed.",
  },
  host_disconnected: {
    title: "Room no longer exists",
    description: "The host disconnected and the room has been closed.",
  },
  room_ended: {
    title: "Room no longer exists",
    description: "This room session has ended.",
  },
  kicked: {
    title: "You were removed",
    description: "You have been removed from this room by the host.",
  },
  room_inactive: {
    title: "Room no longer exists",
    description: "This room is no longer active or could not be found.",
  },
};

function RoomEndedScreen({ reason, onBack }: { reason: RoomEndedReason; onBack: () => void }) {
  const info = ENDED_MESSAGES[reason || "room_ended"] || ENDED_MESSAGES.room_ended;

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
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 24,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>
          {info.title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 28px", lineHeight: 1.5 }}>
          {info.description}
        </p>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 28px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

interface RoomPageProps {
  roomId: string;
}

export function RoomPage({ roomId }: RoomPageProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const setRoom = useSetAtom(roomAtom);
  const room = useAtomValue(roomAtom);
  const socketConnected = useAtomValue(socketConnectedAtom);
  const roomEnded = useAtomValue(roomEndedAtom);
  const setRoomEnded = useSetAtom(roomEndedAtom);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Clear roomEnded on mount so navigating to a new room starts fresh
  useEffect(() => {
    setRoomEnded(null);
  }, [roomId, setRoomEnded]);

  // Initial room validation via REST
  const { isLoading: roomLoading, error: roomError, data: apiRoom } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => apiGetRoom(roomId),
  });

  // Set room from REST until socket takes over
  useEffect(() => {
    if (apiRoom && !socketConnected) {
      setRoom(adaptRoom(apiRoom));
    }
  }, [apiRoom, socketConnected, setRoom]);

  // Socket.IO connection — populates all atoms
  const actions = useSocket(roomId);
  const screenShareHook = useScreenShare(actions, user?.id ?? null);
  const { joinVoice, leaveVoice, isInVoice } = useWebRTC(actions);

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 16,
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  // Room ended mid-session (host left, kicked, etc.)
  if (roomEnded) {
    return <RoomEndedScreen reason={roomEnded} onBack={handleBack} />;
  }

  if (roomLoading) {
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
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}
      >
        Loading room...
      </div>
    );
  }

  if (roomError || !apiRoom) {
    return <RoomEndedScreen reason="room_inactive" onBack={handleBack} />;
  }

  return (
    <VoiceChatContext.Provider value={{ joinVoice, leaveVoice, isInVoice }}>
    <ScreenShareContext.Provider value={screenShareHook}>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0505",
          backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <RoomHeader
          onBack={() => router.push("/dashboard")}
          onLeave={handleBack}
          actions={actions}
        />

        <BroadcastBanner
          actions={actions}
          isHost={user?.id === apiRoom?.host_id?.toString()}
        />

        <div
          className="room-layout"
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <RoomMainContent
            actions={actions}
          />

          <RoomSidebar
            actions={actions}
          />
        </div>

        <VoiceBar
          userAvatar={user?.avatar_url ?? ""}
          actions={actions}
        />
      </div>
    </ScreenShareContext.Provider>
    </VoiceChatContext.Provider>
  );
}
