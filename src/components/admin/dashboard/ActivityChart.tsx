"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

interface DataPoint {
  date: string;
  count: number;
}

interface ActivityChartProps {
  title: string;
  data: DataPoint[];
  gradient: [string, string];
  delay?: number;
}

export function ActivityChart({ title, data, gradient, delay = 0 }: ActivityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const max = Math.max(...data.map((p) => p.count), 1);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current || !barsRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: "power3.out" }
    );

    const bars = barsRef.current.children;
    gsap.fromTo(
      bars,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 0.6,
        delay: delay + 0.2,
        stagger: 0.03,
        ease: "power2.out",
        transformOrigin: "bottom",
      }
    );
  }, [delay, data]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredIndex(null); }}
      style={{
        padding: "22px 24px",
        borderRadius: 14,
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "background 0.25s ease, box-shadow 0.25s ease",
        opacity: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontFamily: "'Inter', sans-serif",
        }}>
          {title}
        </h3>
        <span style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          14 days
        </span>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 10,
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          <span style={{ color: gradient[0], fontWeight: 700 }}>{data[hoveredIndex].count}</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>on</span>
          <span>{formatDate(data[hoveredIndex].date)}</span>
        </div>
      )}

      {/* Bars */}
      <div
        ref={barsRef}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: data.length > 10 ? 3 : 5,
          height: 130,
          padding: "0 2px",
        }}
      >
        {data.map((point, i) => {
          const heightPct = (point.count / max) * 100;
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                height: `${heightPct}%`,
                minHeight: 3,
                background: `linear-gradient(to top, ${gradient[0]}, ${gradient[1]})`,
                borderRadius: "4px 4px 2px 2px",
                cursor: "pointer",
                opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                transition: "opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
                transform: isHovered ? "scaleY(1.08)" : "scaleY(1)",
                transformOrigin: "bottom",
                boxShadow: isHovered ? `0 0 12px ${gradient[0]}50` : "none",
                position: "relative",
              }}
            />
          );
        })}
      </div>

      {/* X-axis labels */}
      {data.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          paddingInline: 2,
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
            {formatDate(data[0].date)}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
            {formatDate(data[data.length - 1].date)}
          </span>
        </div>
      )}
    </div>
  );
}
