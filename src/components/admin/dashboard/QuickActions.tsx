"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Users,
  Monitor,
  ShieldCheck,
  Megaphone,
  ChartLine,
  Gear,
} from "@phosphor-icons/react";

interface QuickActionsProps {
  delay?: number;
  pendingReports: number;
}

const actions = [
  { label: "Manage Users", icon: Users, href: "/admin/users", color: "#ff3b3b" },
  { label: "View Rooms", icon: Monitor, href: "/admin/rooms", color: "#60a5fa" },
  { label: "Moderation", icon: ShieldCheck, href: "/admin/moderation", color: "#facc15", badge: true },
  { label: "Broadcast", icon: Megaphone, href: "/admin/notifications", color: "#a78bfa" },
  { label: "Analytics", icon: ChartLine, href: "/admin/analytics", color: "#4ade80" },
  { label: "Settings", icon: Gear, href: "/admin/settings", color: "rgba(255,255,255,0.5)" },
];

export function QuickActions({ delay = 0, pendingReports }: QuickActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          delay: delay + 0.15,
          stagger: 0.04,
          ease: "back.out(1.4)",
        }
      );
    }
  }, [delay]);

  return (
    <div
      ref={containerRef}
      style={{
        padding: "22px 24px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
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
        Quick Actions
      </h3>

      <div
        ref={itemsRef}
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
      >
        {actions.map((action, i) => {
          const Icon = action.icon;
          const isHovered = hoveredIdx === i;
          return (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 10px",
                borderRadius: 10,
                border: `1px solid ${isHovered ? `${action.color}30` : "rgba(255,255,255,0.05)"}`,
                background: isHovered ? `${action.color}0A` : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHovered ? `0 4px 16px ${action.color}15` : "none",
                opacity: 0,
              }}
            >
              <Icon
                size={22}
                weight={isHovered ? "fill" : "regular"}
                color={isHovered ? action.color : "rgba(255,255,255,0.4)"}
                style={{ transition: "color 0.15s ease" }}
              />
              <span style={{
                fontSize: 11,
                color: isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)",
                fontWeight: 500,
                transition: "color 0.15s ease",
                fontFamily: "'Inter', sans-serif",
              }}>
                {action.label}
              </span>
              {action.badge && pendingReports > 0 && (
                <span style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#f87171",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 8px rgba(248,113,113,0.4)",
                }}>
                  {pendingReports > 9 ? "9+" : pendingReports}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
