"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Users, Monitor, ChatCircle, ShieldWarning } from "@phosphor-icons/react";

interface ActivityItem {
  type: "user" | "room" | "message" | "report";
  label: string;
  count: number;
}

interface RecentActivityProps {
  usersToday: number;
  roomsToday: number;
  messagesToday: number;
  pendingReports: number;
  delay?: number;
}

const iconMap = {
  user: Users,
  room: Monitor,
  message: ChatCircle,
  report: ShieldWarning,
};

const colorMap = {
  user: "#ff3b3b",
  room: "#60a5fa",
  message: "#a78bfa",
  report: "#facc15",
};

export function RecentActivity({
  usersToday,
  roomsToday,
  messagesToday,
  pendingReports,
  delay = 0,
}: RecentActivityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const items: ActivityItem[] = [
    { type: "user", label: "New users today", count: usersToday },
    { type: "room", label: "Rooms created today", count: roomsToday },
    { type: "message", label: "Messages today", count: messagesToday },
    { type: "report", label: "Pending reports", count: pendingReports },
  ];

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: "power3.out" }
    );

    if (itemsRef.current) {
      gsap.fromTo(
        itemsRef.current.children,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: delay + 0.15,
          stagger: 0.06,
          ease: "power2.out",
        }
      );
    }
  }, [delay]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "22px 24px",
        borderRadius: 14,
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "background 0.25s ease",
        opacity: 0,
      }}
    >
      <h3 style={{
        fontSize: 13,
        fontWeight: 600,
        color: "rgba(255,255,255,0.5)",
        margin: "0 0 16px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        fontFamily: "'Inter', sans-serif",
      }}>
        Today&apos;s Activity
      </h3>

      <div ref={itemsRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const Icon = iconMap[item.type];
          const color = colorMap[item.type];
          return (
            <div
              key={item.type}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.03)",
                opacity: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${color}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={16} color={color} weight="fill" />
                </div>
                <span style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {item.label}
                </span>
              </div>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
