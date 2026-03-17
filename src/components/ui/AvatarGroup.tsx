"use client";

import type { Participant } from "@/lib/types";

interface AvatarGroupProps {
  participants: Participant[];
  max?: number;
  size?: number;
}

export function AvatarGroup({
  participants,
  max = 3,
  size = 28,
}: AvatarGroupProps) {
  const visible = participants.slice(0, max);
  const overflow = participants.length - max;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((p, i) => (
        <img
          key={p.id}
          src={p.avatar_url}
          alt={p.username}
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "2px solid #000",
            marginLeft: i > 0 ? -size * 0.3 : 0,
            position: "relative",
            zIndex: max - i,
            objectFit: "cover",
            background: "#222",
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "2px solid #000",
            marginLeft: -size * 0.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.38,
            fontWeight: 600,
            color: "#888",
            position: "relative",
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
