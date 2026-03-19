"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  index?: number;
}

export function KPICard({
  label,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "#ff3b3b",
  index = 0,
}: KPICardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === "number" ? 0 : value
  );

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setDisplayValue(value);
      if (cardRef.current) cardRef.current.style.opacity = "1";
      return;
    }

    // Card entrance animation
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: index * 0.06,
          ease: "power3.out",
        }
      );
    }

    // Animate number count-up
    if (typeof value === "number" && value > 0) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.2,
        delay: index * 0.06 + 0.3,
        ease: "expo.out",
        onUpdate() {
          setDisplayValue(Math.round(obj.val));
        },
      });
    } else {
      setDisplayValue(value);
    }
  }, [value, index]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "20px 22px",
        borderRadius: 14,
        background: hovered
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${accentColor}22` : "rgba(255,255,255,0.06)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 180,
        overflow: "hidden",
        opacity: 0,
        cursor: "default",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered
          ? `0 0 30px ${accentColor}18, 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
          : "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Accent glow orb */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          pointerEvents: "none",
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.3s ease",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              color: accentColor,
              opacity: hovered ? 0.9 : 0.5,
              transition: "opacity 0.2s ease",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <span
        ref={valueRef}
        style={{
          fontSize: 30,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {typeof displayValue === "number"
          ? displayValue.toLocaleString()
          : displayValue}
      </span>

      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          {trend && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: trend.value >= 0 ? "#4ade80" : "#f87171",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 10 }}>{trend.value >= 0 ? "\u25B2" : "\u25BC"}</span>
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
