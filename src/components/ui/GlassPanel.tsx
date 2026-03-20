"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  p?: string;
  borderRadius?: string;
  borderLeft?: string;
  hoverEffect?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  p = "24px",
  borderRadius = "14px",
  borderLeft,
  hoverEffect = true,
  style,
  onClick,
}: GlassPanelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverEffect ? () => setHovered(true) : undefined}
      onMouseLeave={hoverEffect ? () => setHovered(false) : undefined}
      style={{
        padding: p,
        borderRadius,
        background: hovered
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: borderLeft || "1px solid rgba(255,255,255,0.08)",
        boxShadow: hovered
          ? "0 0 40px rgba(255,59,59,0.12), 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 0 30px rgba(255,59,59,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
