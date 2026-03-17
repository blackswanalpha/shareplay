"use client";

import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
} from "@phosphor-icons/react";

interface LobbyPreviewProps {
  micEnabled: boolean;
  camEnabled: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  userAvatar: string;
  username: string;
}

export function LobbyPreview({
  micEnabled,
  camEnabled,
  onToggleMic,
  onToggleCam,
  userAvatar,
  username,
}: LobbyPreviewProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background: "#111",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {!camEnabled && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={userAvatar}
              alt={username}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#222",
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Camera off
            </span>
          </div>
        )}
        {camEnabled && (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #1a1a1a, #111)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={userAvatar}
              alt={username}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#222",
                opacity: 0.6,
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          padding: "16px 0",
        }}
      >
        <button
          onClick={onToggleMic}
          aria-label={micEnabled ? "Disable microphone" : "Enable microphone"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: micEnabled
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,59,59,0.15)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            color: micEnabled ? "#f5f5f5" : "#ff3b3b",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {micEnabled ? (
            <Microphone size={22} />
          ) : (
            <MicrophoneSlash size={22} />
          )}
        </button>

        <button
          onClick={onToggleCam}
          aria-label={camEnabled ? "Disable camera" : "Enable camera"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: camEnabled
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,59,59,0.15)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            color: camEnabled ? "#f5f5f5" : "#ff3b3b",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {camEnabled ? (
            <VideoCamera size={22} />
          ) : (
            <VideoCameraSlash size={22} />
          )}
        </button>
      </div>
    </div>
  );
}
