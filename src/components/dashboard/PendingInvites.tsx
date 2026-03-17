"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import type { Invite } from "@/lib/types";

interface PendingInvitesProps {
  invites: Invite[];
}

export function PendingInvites({ invites }: PendingInvitesProps) {
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
        Pending Invites
        {invites.length > 0 && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 12,
              fontWeight: 700,
              color: "#ff3b3b",
              background: "rgba(255,59,59,0.15)",
              padding: "2px 8px",
              borderRadius: 10,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {invites.length}
          </span>
        )}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {invites.map((invite) => (
          <div
            key={invite.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <img
              src={invite.inviter.avatar_url}
              alt={invite.inviter.username}
              width={32}
              height={32}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                background: "#222",
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "#f5f5f5",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                <strong>{invite.inviter.username}</strong> invited you to
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#888",
                  fontFamily: "var(--font-inter), sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {invite.room_name}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                style={{
                  padding: "6px 14px",
                  background: "#ff3b3b",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-inter), sans-serif",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e63535";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ff3b3b";
                }}
              >
                Accept
              </button>
              <button
                style={{
                  padding: "6px 14px",
                  background: "rgba(255,255,255,0.04)",
                  color: "#888",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-inter), sans-serif",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
