"use client";

import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusDot } from "@/components/ui/StatusDot";
import type { Friend } from "@/lib/types";

interface FriendsOnlineProps {
  friends: Friend[];
}

export function FriendsOnline({ friends }: FriendsOnlineProps) {
  const activeFriends = friends
    .filter((f) => f.status !== "offline")
    .slice(0, 5);

  return (
    <GlassPanel hoverEffect={false}>
      <h3
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#f5f5f5",
          marginBottom: 16,
        }}
      >
        Friends Online
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activeFriends.map((friend) => (
          <div
            key={friend.id}
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
                width={32}
                height={32}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#222",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                }}
              >
                <StatusDot status={friend.status} size={8} />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#f5f5f5",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {friend.username}
              </div>
              {friend.activity && (
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
                  {friend.activity}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/friends"
        style={{
          display: "block",
          width: "100%",
          marginTop: 16,
          padding: "8px 0",
          background: "transparent",
          border: "none",
          color: "#ff3b3b",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "var(--font-inter), sans-serif",
          cursor: "pointer",
          textAlign: "center",
          transition: "opacity 0.2s ease",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        See All Friends
      </Link>
    </GlassPanel>
  );
}
