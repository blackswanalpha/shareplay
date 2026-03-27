"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { useAtomValue } from "jotai";
import { roomAtom, playerStateAtom, participantsAtom, screenShareAtom, cameraShareAtom } from "@/store/roomAtoms";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import type { SocketActions } from "@/hooks/useSocket";
import { ScreenShareContext, CameraShareContext } from "./RoomPage";
import { ScreenShareViewer } from "./ScreenShareViewer";
import { CameraGrid } from "./CameraGrid";
import { useAuth } from "@/providers/AuthProvider";

const VideoPlayer = dynamic(
  () => import("./VideoPlayer").then((m) => m.VideoPlayer),
  { ssr: false }
);

const MusicPlayer = dynamic(
  () => import("./MusicPlayer").then((m) => m.MusicPlayer),
  { ssr: false }
);

const YouTubeUrlBar = dynamic(
  () => import("./YouTubeUrlBar").then((m) => m.YouTubeUrlBar),
  { ssr: false }
);

interface RoomMainContentProps {
  actions: SocketActions;
}

export function RoomMainContent({ actions }: RoomMainContentProps) {
  const room = useAtomValue(roomAtom);
  const playerState = useAtomValue(playerStateAtom);
  const participants = useAtomValue(participantsAtom);
  const screenShare = useAtomValue(screenShareAtom);
  const cameraShare = useAtomValue(cameraShareAtom);
  const { remoteStream, localStream, isLocalSharing, stopSharing } = useContext(ScreenShareContext);
  const {
    localStream: cameraLocalStream,
    remoteStreams: cameraRemoteStreams,
    isLocalSharing: isCameraSharing,
  } = useContext(CameraShareContext);
  const { canSubmitMedia } = useCurrentRole();
  const { user } = useAuth();

  const playerMode = room?.type ?? "watch";
  const onlineParticipants = participants.filter((p) => p.is_online);

  // Determine screen share display stream and sharer info
  const screenShareStream = isLocalSharing ? localStream : remoteStream;
  const sharerUsername = screenShare.sharerUserId
    ? participants.find((p) => p.id === screenShare.sharerUserId)?.username ?? "Someone"
    : "Someone";
  const isScreenShareActive = screenShare.isSharing && !!screenShareStream;

  const handlePlayNow = (url: string, title: string) => {
    actions.emitChangeMedia(url, title);
  };

  const handleAddToQueue = (url: string, meta?: { title?: string; thumbnail_url?: string; duration_seconds?: number }) => {
    actions.addToPlaylist(url, meta);
  };

  return (
    <div className="room-main" style={{ flex: 1, minWidth: 0, padding: 24, overflowY: "auto" }}>
      {/* YouTube URL Bar */}
      {canSubmitMedia && (
        <YouTubeUrlBar
          onPlayNow={handlePlayNow}
          onAddToQueue={handleAddToQueue}
        />
      )}

      {/* Camera Grid */}
      {(isCameraSharing || cameraRemoteStreams.size > 0) && (
        <CameraGrid
          localStream={cameraLocalStream}
          remoteStreams={cameraRemoteStreams}
          isLocalSharing={isCameraSharing}
          participants={participants}
          currentUserId={user?.id ?? null}
        />
      )}

      {/* Screen Share Viewer */}
      {isScreenShareActive && screenShareStream && (
        <div style={{ marginBottom: 16 }}>
          <ScreenShareViewer
            stream={screenShareStream}
            sharerUsername={sharerUsername}
            isSharer={isLocalSharing}
            onStop={stopSharing}
          />
        </div>
      )}

      {/* Player — shrinks to PiP overlay when screen sharing */}
      <div
        style={isScreenShareActive ? {
          position: "fixed",
          bottom: 96,
          right: 24,
          width: "25%",
          minWidth: 280,
          maxWidth: 420,
          zIndex: 40,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        } : undefined}
      >
        {playerMode === "watch" ? (
          <VideoPlayer actions={actions} />
        ) : (
          <MusicPlayer actions={actions} />
        )}
      </div>

      {/* Now Playing Info Bar */}
      {playerState.videoUrl && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
              }}
            >
              {playerState.title}
            </span>
            <span
              style={{
                padding: "2px 8px",
                background: "rgba(255,66,66,0.15)",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: "#ff4242",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {playerMode === "watch" ? "Watch Party" : "Music Session"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AvatarGroup participants={onlineParticipants} max={4} size={24} />
            <span
              style={{
                fontSize: 12,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {onlineParticipants.length} people in sync
            </span>
          </div>
        </div>
      )}

      {/* Ad Banner */}
      <div
        style={{
          marginTop: 16,
          padding: "16px 20px",
          background:
            "linear-gradient(135deg, rgba(255,66,66,0.08) 0%, rgba(255,120,50,0.06) 50%, rgba(255,66,66,0.04) 100%)",
          border: "1px solid rgba(255,66,66,0.12)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,66,66,0.06)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#555",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              AD
            </span>
            <span
              style={{
                width: 1,
                height: 10,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "#555",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Sponsored
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#f5f5f5",
              marginBottom: 4,
            }}
          >
            Upgrade to SharePlay Pro
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              lineHeight: 1.4,
            }}
          >
            Ad-free rooms, HD streaming, priority sync &amp; unlimited queue.
          </p>
        </div>
        <button
          style={{
            padding: "8px 18px",
            background: "#ff4242",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e63535";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,66,66,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ff4242";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
