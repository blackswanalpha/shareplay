"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Heartbeat, Lightning, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

interface RetentionWidgetProps {
  avgScore: number;
  totalScoredUsers: number;
  riskDistribution: Record<string, number>;
  activeStreaks: number;
  delay?: number;
}

const riskColors: Record<string, string> = {
  healthy: "#4ade80",
  at_risk: "#facc15",
  churning: "#fb923c",
  churned: "#f87171",
};

export function RetentionWidget({
  avgScore,
  totalScoredUsers,
  riskDistribution,
  activeStreaks,
  delay = 0,
}: RetentionWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: "power3.out" }
    );
  }, [delay]);

  const totalUsers = Object.values(riskDistribution).reduce((a, b) => a + b, 0);

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
          Retention
        </h3>
        <Heartbeat size={16} color="#ff6b6b" weight="duotone" />
      </div>

      {/* Avg Engagement Score */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#fff",
          fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1,
        }}>
          {Math.round(avgScore)}
        </div>
        <div style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginTop: 4,
        }}>
          Avg Engagement ({totalScoredUsers} users)
        </div>
      </div>

      {/* Miniature Risk Distribution Bar */}
      <div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
          {(["healthy", "at_risk", "churning", "churned"] as const).map((level) => {
            const count = riskDistribution[level] || 0;
            const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={level}
                style={{
                  width: `${pct}%`,
                  background: riskColors[level],
                  opacity: 0.8,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {(["healthy", "churned"] as const).map((level) => (
            <span key={level} style={{
              fontSize: 10,
              color: riskColors[level],
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {riskDistribution[level] || 0} {level === "healthy" ? "healthy" : "churned"}
            </span>
          ))}
        </div>
      </div>

      {/* Active Streaks */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(250,204,21,0.06)",
        border: "1px solid rgba(250,204,21,0.1)",
      }}>
        <Lightning size={16} color="#facc15" weight="fill" />
        <span style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#facc15",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {activeStreaks}
        </span>
        <span style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          Active Streaks
        </span>
      </div>

      {/* View Details Link */}
      <Link
        href="/admin/retention"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "8px 0",
          fontSize: 12,
          color: "#ff6b6b",
          fontWeight: 600,
          textDecoration: "none",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 14,
        }}
      >
        View Details
        <ArrowRight size={14} weight="bold" />
      </Link>
    </div>
  );
}
