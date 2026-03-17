"use client";

import { useState } from "react";
import { Copy, Monitor, MusicNote, CircleNotch, Clock, XCircle, CheckCircle } from "@phosphor-icons/react";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import type { Room } from "@/lib/types";
import type { LobbyStatus } from "./RoomLobby";

interface LobbyInfoProps {
  room: Room;
  onJoin: () => void;
  onRetry: () => void;
  lobbyStatus: LobbyStatus;
  requiresApproval: boolean;
}

export function LobbyInfo({ room, onJoin, onRetry, lobbyStatus, requiresApproval }: LobbyInfoProps) {
  const [codeCopied, setCodeCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(room.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const onlineCount = room.participants.filter((p) => p.is_online).length;
  const isJoining = lobbyStatus === "requesting";
  const isWaiting = lobbyStatus === "waiting";
  const isDeclined = lobbyStatus === "declined";
  const isApproved = lobbyStatus === "approved";

  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "24px 0",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 24,
          fontWeight: 600,
          color: "#f5f5f5",
        }}
      >
        {room.name}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 16,
            color: "#888",
            letterSpacing: "0.08em",
          }}
        >
          {room.code}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy room code"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            color: codeCopied ? "#22c55e" : "#555",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Copy size={14} />
        </button>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          width: "fit-content",
        }}
      >
        {room.type === "watch" ? (
          <Monitor size={14} style={{ color: "#888" }} />
        ) : (
          <MusicNote size={14} style={{ color: "#888" }} />
        )}
        <span
          style={{
            fontSize: 12,
            color: "#888",
            fontWeight: 500,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {room.type === "watch" ? "Watch Party" : "Music Session"}
        </span>
      </div>

      {/* Approval required badge */}
      {requiresApproval && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "rgba(234,179,8,0.1)",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: 20,
            width: "fit-content",
          }}
        >
          <Clock size={14} style={{ color: "#eab308" }} />
          <span
            style={{
              fontSize: 12,
              color: "#eab308",
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Host approval required
          </span>
        </div>
      )}

      {room.participants.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarGroup participants={room.participants} max={4} size={28} />
          <span
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {onlineCount}/{room.participants.length} online
          </span>
        </div>
      )}

      {/* Waiting for approval state */}
      {isWaiting && (
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(255,66,66,0.3)",
              borderTopColor: "#ff4242",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#f5f5f5",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            Waiting for host approval...
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              textAlign: "center",
            }}
          >
            The host has been notified of your request to join. Please wait.
          </p>
        </div>
      )}

      {/* Declined state */}
      {isDeclined && (
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255,66,66,0.05)",
            border: "1px solid rgba(255,66,66,0.15)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <XCircle size={40} style={{ color: "#ff4242" }} />
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#f5f5f5",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            Request declined
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              textAlign: "center",
            }}
          >
            The host declined your request or did not respond.
          </p>
          <button
            onClick={onRetry}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#f5f5f5",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Approved state */}
      {isApproved && (
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <CheckCircle size={40} weight="fill" style={{ color: "#22c55e" }} />
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#f5f5f5",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            Approved! Joining room...
          </p>
        </div>
      )}

      {/* Join button - visible when idle or requesting */}
      {(lobbyStatus === "idle" || lobbyStatus === "requesting") && (
        <button
          onClick={onJoin}
          disabled={isJoining}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 32px",
            background: isJoining ? "rgba(255,66,66,0.5)" : "#ff4242",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            borderRadius: 12,
            border: "none",
            cursor: isJoining ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            marginTop: 8,
            width: "fit-content",
            boxShadow: isJoining ? "none" : "0 0 20px rgba(255,66,66,0.2)",
          }}
          onMouseEnter={(e) => {
            if (!isJoining) {
              e.currentTarget.style.background = "#e63535";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(255,66,66,0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isJoining) {
              e.currentTarget.style.background = "#ff4242";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255,66,66,0.2)";
            }
          }}
        >
          {isJoining && (
            <CircleNotch
              size={18}
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
          {isJoining
            ? requiresApproval ? "Requesting..." : "Joining..."
            : requiresApproval ? "Request to Join" : "Join Room"
          }
        </button>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
