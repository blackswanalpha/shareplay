"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "@phosphor-icons/react";
import gsap from "gsap";
import { WorldClock } from "./WorldClock";

interface DashboardHeroProps {
  username: string;
  onCreateRoom?: () => void;
  onJoinRoom?: (code: string) => void;
}

export function DashboardHero({ username, onCreateRoom, onJoinRoom }: DashboardHeroProps) {
  const [roomCode, setRoomCode] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headingRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5 }
    ).fromTo(
      actionsRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4 },
      "-=0.25"
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <section ref={sectionRef} style={{ marginBottom: 32 }}>
      <style>{`
        @media (max-width: 640px) {
          .dashboard-hero-row {
            justify-content: center !important;
            text-align: center;
          }
          .dashboard-hero-row h1 {
            width: 100%;
          }
        }
      `}</style>
      <div
        className="dashboard-hero-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1
          ref={headingRef}
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            color: "#f5f5f5",
            margin: 0,
            opacity: 0,
          }}
        >
          Welcome back,{" "}
          <span style={{ color: "#ff3b3b" }}>{username}</span>
        </h1>
        <WorldClock />
      </div>

      <div
        ref={actionsRef}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          opacity: 0,
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "#ff3b3b",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e63535";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,59,59,0.4)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ff3b3b";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={onCreateRoom}
        >
          <Plus size={18} weight="bold" />
          Create Room
        </button>

        <div
          style={{
            display: "flex",
            gap: 0,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Enter room code..."
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={8}
            style={{
              height: 44,
              padding: "0 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRight: "none",
              borderRadius: "10px 0 0 10px",
              color: "#f5f5f5",
              fontSize: 14,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              letterSpacing: "0.08em",
              outline: "none",
              transition: "border-color 0.2s ease",
              width: 180,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
          <button
            style={{
              height: 44,
              padding: "0 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0 10px 10px 0",
              color: "#f5f5f5",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onClick={() => {
              if (roomCode.trim()) onJoinRoom?.(roomCode.trim());
            }}
          >
            Join
          </button>
        </div>
      </div>
    </section>
  );
}
