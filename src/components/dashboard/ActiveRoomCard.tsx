"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { StatusDot } from "@/components/ui/StatusDot";
import type { Room } from "@/lib/types";

interface ActiveRoomCardProps {
  room: Room;
  onOpen?: (roomId: string) => void;
}

export function ActiveRoomCard({ room, onOpen }: ActiveRoomCardProps) {
  const onlineCount = room.participants.filter((p) => p.is_online).length;

  return (
    <GlassPanel
      borderLeft={room.is_live ? "3px solid #ff3b3b" : undefined}
      style={{ minWidth: 280, flexShrink: 0 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: "#f5f5f5",
            }}
          >
            {room.name}
          </h3>
          {room.is_live && <StatusDot status="online" size={8} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AvatarGroup participants={room.participants} />
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

        <div style={{ marginTop: "auto" }}>
          <button
            style={{
              width: "100%",
              padding: "8px 16px",
              background: room.is_live ? "#ff3b3b" : "rgba(255,255,255,0.04)",
              color: room.is_live ? "#fff" : "#f5f5f5",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              borderRadius: 8,
              border: room.is_live
                ? "none"
                : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (room.is_live) {
                e.currentTarget.style.background = "#e63535";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255,59,59,0.3)";
              } else {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (room.is_live) {
                e.currentTarget.style.background = "#ff3b3b";
                e.currentTarget.style.boxShadow = "none";
              } else {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
            onClick={() => onOpen?.(room.code)}
          >
            {room.is_live ? "Rejoin" : "Open"}
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
