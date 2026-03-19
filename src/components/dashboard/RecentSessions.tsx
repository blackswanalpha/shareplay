"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { ClockCounterClockwise, FilmStrip, MusicNote } from "@phosphor-icons/react";
import type { Session } from "@/lib/types";

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "< 1m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  return `${diffD}d ago`;
}

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <GlassPanel hoverEffect={false}>
      <h3
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#f5f5f5",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ClockCounterClockwise size={18} />
        Recent Sessions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessions.length === 0 && (
          <div
            style={{
              fontSize: 13,
              color: "#555",
              fontFamily: "var(--font-inter), sans-serif",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            No sessions yet. Join a room to get started!
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#f5f5f5",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {session.room_name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontFamily: "var(--font-inter), sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {session.type === "music" ? (
                  <MusicNote size={12} />
                ) : (
                  <FilmStrip size={12} />
                )}
                {formatDuration(session.duration_minutes)}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#555",
                fontFamily: "var(--font-inter), sans-serif",
                flexShrink: 0,
              }}
            >
              {relativeTime(session.ended_at)}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
