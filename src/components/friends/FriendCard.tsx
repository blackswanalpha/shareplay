"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusDot } from "@/components/ui/StatusDot";
import { MoreMenu } from "@/components/ui/MoreMenu";
import { User, Prohibit, Eye } from "@phosphor-icons/react";
import type { Friend } from "@/lib/types";

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  const isOnline = friend.status === "online" || friend.status === "away";

  return (
    <GlassPanel>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={friend.avatar_url}
            alt={friend.username}
            width={40}
            height={40}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
              background: "#222",
            }}
          />
          <div style={{ position: "absolute", bottom: -1, right: -1 }}>
            <StatusDot status={friend.status} size={10} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#f5f5f5",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {friend.username}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              fontFamily: "var(--font-inter), sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isOnline
              ? friend.activity || (friend.status === "away" ? "Away" : "Online")
              : "Last seen 3h ago"}
          </div>
        </div>

        {isOnline && (
          <div
            className="friend-card-actions"
            style={{ display: "flex", gap: 8, flexShrink: 0 }}
          >
            <button
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
              Spectate
            </button>
            <button
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-inter), sans-serif",
                border: "none",
                borderRadius: 8,
                background: "#ff3b3b",
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
              Invite
            </button>
          </div>
        )}

        <MoreMenu
          items={[
            { label: "View Profile", icon: <User size={14} />, onClick: () => {} },
            { label: "Remove Friend", icon: <Prohibit size={14} />, danger: true, onClick: () => {} },
            { label: "Block", icon: <Prohibit size={14} />, danger: true, onClick: () => {} },
          ]}
        />
      </div>
    </GlassPanel>
  );
}
