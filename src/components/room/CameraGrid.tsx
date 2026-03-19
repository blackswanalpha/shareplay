"use client";

import { useEffect, useRef } from "react";
import type { RoomParticipant } from "@/lib/types";

interface CameraGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isLocalSharing: boolean;
  participants: RoomParticipant[];
  currentUserId: string | null;
}

function VideoTile({
  stream,
  username,
  isMirrored,
}: {
  stream: MediaStream;
  username: string;
  isMirrored: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        background: "#111",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        aspectRatio: "4/3",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMirrored}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: isMirrored ? "scaleX(-1)" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          padding: "4px 10px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: "#f5f5f5",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {username}
      </div>
    </div>
  );
}

export function CameraGrid({
  localStream,
  remoteStreams,
  isLocalSharing,
  participants,
  currentUserId,
}: CameraGridProps) {
  const totalStreams = (isLocalSharing && localStream ? 1 : 0) + remoteStreams.size;
  if (totalStreams === 0) return null;

  const getUsername = (userId: string) =>
    participants.find((p) => p.id === userId)?.username ?? "Unknown";

  // Determine grid columns based on count
  const columns = totalStreams === 1 ? 1 : totalStreams <= 4 ? 2 : 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 8,
        marginBottom: 16,
        maxWidth: "25%",
      }}
    >
      {isLocalSharing && localStream && (
        <VideoTile
          stream={localStream}
          username={currentUserId ? `${getUsername(currentUserId)} (You)` : "You"}
          isMirrored
        />
      )}
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <VideoTile
          key={userId}
          stream={stream}
          username={getUsername(userId)}
          isMirrored={false}
        />
      ))}
    </div>
  );
}
