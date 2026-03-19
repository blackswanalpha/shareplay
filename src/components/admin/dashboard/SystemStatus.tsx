"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Heartbeat, Database, WifiHigh, HardDrives } from "@phosphor-icons/react";

interface SystemStatusProps {
  activeRooms: number;
  activeUsers: number;
  delay?: number;
}

const services = [
  { label: "API Server", icon: Heartbeat, status: "operational" as const },
  { label: "Database", icon: Database, status: "operational" as const },
  { label: "WebSocket", icon: WifiHigh, status: "operational" as const },
  { label: "Storage", icon: HardDrives, status: "operational" as const },
];

const statusColor = {
  operational: "#4ade80",
  degraded: "#facc15",
  down: "#f87171",
};

export function SystemStatus({ activeRooms, activeUsers, delay = 0 }: SystemStatusProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: "power3.out" }
    );

    // Pulse animation on status dots
    const validDots = dotRefs.current.filter(Boolean);
    if (validDots.length > 0 && !prefersReduced) {
      gsap.to(validDots, {
        scale: 1.3,
        opacity: 0.6,
        duration: 1,
        stagger: 0.15,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }

    return () => {
      gsap.killTweensOf(validDots);
    };
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
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontFamily: "'Inter', sans-serif",
        }}>
          System Status
        </h3>
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "#4ade80",
          fontWeight: 600,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80",
          }} />
          All Systems Go
        </span>
      </div>

      {/* Service list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {services.map((svc, i) => {
          const Icon = svc.icon;
          const color = statusColor[svc.status];
          return (
            <div
              key={svc.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={16} color="rgba(255,255,255,0.35)" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'Inter', sans-serif" }}>
                  {svc.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color, textTransform: "capitalize" }}>{svc.status}</span>
                <span
                  ref={(el) => { dotRefs.current[i] = el; }}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}80`,
                    display: "inline-block",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live counters */}
      <div style={{
        display: "flex",
        gap: 12,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(74,222,128,0.06)",
          border: "1px solid rgba(74,222,128,0.1)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#4ade80", fontFamily: "'Space Grotesk', sans-serif" }}>
            {activeUsers}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Online Now
          </div>
        </div>
        <div style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.1)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa", fontFamily: "'Space Grotesk', sans-serif" }}>
            {activeRooms}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Live Rooms
          </div>
        </div>
      </div>
    </div>
  );
}
