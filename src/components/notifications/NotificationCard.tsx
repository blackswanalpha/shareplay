"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Envelope,
  Star,
  At,
  Users,
  Warning,
} from "@phosphor-icons/react";
import type { Notification, NotificationType } from "@/lib/types";

const iconColors: Record<NotificationType, string> = {
  invite: "#ff3b3b",
  role: "#eab308",
  mention: "#3b82f6",
  friend: "#22c55e",
  system: "#888",
};

const iconMap: Record<NotificationType, React.ReactNode> = {
  invite: <Envelope size={18} weight="fill" />,
  role: <Star size={18} weight="fill" />,
  mention: <At size={18} weight="bold" />,
  friend: <Users size={18} weight="fill" />,
  system: <Warning size={18} weight="fill" />,
};

function formatTime(dateStr: string): string {
  const now = new Date("2026-03-17T20:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  return `${diffD}d ago`;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const color = iconColors[notification.type];
  const isUnread = !notification.is_read;

  return (
    <div
      onClick={() => isUnread && onMarkRead(notification.id)}
      style={{ cursor: isUnread ? "pointer" : "default" }}
    >
      <GlassPanel
        borderLeft={isUnread ? `3px solid #ff3b3b` : undefined}
        hoverEffect={isUnread}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              flexShrink: 0,
            }}
          >
            {iconMap[notification.type]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isUnread ? 600 : 400,
                  color: isUnread ? "#f5f5f5" : "#888",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {notification.title}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#555",
                  fontFamily: "var(--font-inter), sans-serif",
                  flexShrink: 0,
                }}
              >
                {formatTime(notification.created_at)}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: isUnread ? "#aaa" : "#666",
                fontFamily: "var(--font-inter), sans-serif",
                lineHeight: 1.4,
              }}
            >
              {notification.body}
            </div>

            {notification.type === "invite" && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  style={{
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), sans-serif",
                    border: "none",
                    borderRadius: 6,
                    background: "#ff3b3b",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Accept
                </button>
                <button
                  style={{
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), sans-serif",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    background: "transparent",
                    color: "#f5f5f5",
                    cursor: "pointer",
                  }}
                >
                  Decline
                </button>
              </div>
            )}

            {notification.type === "mention" && notification.action_url && (
              <button
                style={{
                  marginTop: 10,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "var(--font-inter), sans-serif",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                Go to Room
              </button>
            )}

            {notification.type === "friend" && (
              <button
                style={{
                  marginTop: 10,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "var(--font-inter), sans-serif",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                View
              </button>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
