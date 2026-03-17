"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import type { FriendRequest } from "@/lib/types";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: () => void;
  onDecline?: () => void;
  onBlock?: () => void;
}

export function FriendRequestCard({ request, onAccept, onDecline, onBlock }: FriendRequestCardProps) {
  return (
    <GlassPanel>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={request.from_user.avatar_url}
          alt={request.from_user.username}
          width={40}
          height={40}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            background: "#222",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              color: "#f5f5f5",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            <strong>{request.from_user.username}</strong> wants to be your friend
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onAccept}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              border: "none",
              borderRadius: 8,
              background: "#22c55e",
              color: "#fff",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              color: "#f5f5f5",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            Decline
          </button>
          <button
            onClick={onBlock}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              border: "none",
              borderRadius: 8,
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Block
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
