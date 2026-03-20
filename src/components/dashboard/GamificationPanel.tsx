"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { GamificationSummary } from "@/lib/types";
import {
  Fire,
  Lightning,
  Crown,
  Ranking,
  ArrowUp,
  Shield,
  Target,
  ArrowRight,
} from "@phosphor-icons/react";

interface GamificationPanelProps {
  data: GamificationSummary;
  onOpenSideSheet?: (tab?: "badges" | "challenges" | "leaderboard" | "xp") => void;
}

const rankMedals = ["", "#ffd700", "#c0c0c0", "#cd7f32"];

function getRankTitle(rank: number): string {
  if (rank === 1) return "Champion";
  if (rank === 2) return "Runner-up";
  if (rank === 3) return "Bronze";
  if (rank <= 10) return "Top 10";
  if (rank <= 25) return "Rising Star";
  if (rank <= 50) return "Contender";
  return "Player";
}

export function GamificationPanel({ data, onOpenSideSheet }: GamificationPanelProps) {
  const {
    xp, achievements, active_challenges, streak, leaderboard_rank,
    earned_badges = 0, total_badges = 0, current_xp_multiplier = 1,
    leaderboard_total_users = 0, leaderboard_percentile = 0,
  } = data;
  const sectionRef = useRef<HTMLDivElement>(null);
  const rankCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (sectionRef.current) {
      tl.fromTo(sectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }
    if (rankCardRef.current) {
      tl.fromTo(rankCardRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 }, "-=0.25");
    }
    return () => { tl.kill(); };
  }, []);

  const completedChallenges = active_challenges.filter(ch => ch.completed).length;

  const handleClick = (tab?: "badges" | "challenges" | "leaderboard" | "xp") => {
    onOpenSideSheet?.(tab);
  };

  return (
    <div ref={sectionRef} style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16, opacity: 0 }}>
      {/* ── Row 1: Rank + XP Level + Streak (all clickable) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr auto", gap: 16 }} className="gamification-top-row">
        <style>{`
          @media (max-width: 900px) {
            .gamification-top-row { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Rank Card (clickable → leaderboard) */}
        <div
          ref={rankCardRef}
          onClick={() => handleClick("leaderboard")}
          style={{
            padding: "20px 16px",
            borderRadius: 16,
            background: leaderboard_rank <= 3
              ? "linear-gradient(145deg, rgba(255,215,0,0.08), rgba(255,59,59,0.04))"
              : "linear-gradient(145deg, rgba(255,59,59,0.06), rgba(255,255,255,0.03))",
            border: leaderboard_rank <= 3
              ? "1px solid rgba(255,215,0,0.15)"
              : "1px solid rgba(255,59,59,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.15s ease",
          }}
        >
          {/* Glow */}
          <div style={{
            position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
            width: 120, height: 120, borderRadius: "50%",
            background: leaderboard_rank <= 3
              ? "radial-gradient(circle, rgba(255,215,0,0.15), transparent)"
              : "radial-gradient(circle, rgba(255,59,59,0.1), transparent)",
            pointerEvents: "none",
          }} />

          {leaderboard_rank > 0 && leaderboard_rank <= 3 && (
            <Crown size={24} weight="fill" color={rankMedals[leaderboard_rank]} style={{ filter: `drop-shadow(0 0 8px ${rankMedals[leaderboard_rank]}80)` }} />
          )}

          <div style={{
            fontSize: 42, fontWeight: 900,
            fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            lineHeight: 1,
            color: leaderboard_rank <= 3 ? "#ffd700" : "#ff3b3b",
            textShadow: leaderboard_rank <= 3 ? "0 0 20px rgba(255,215,0,0.4)" : "0 0 20px rgba(255,59,59,0.3)",
          }}>
            {leaderboard_rank > 0 ? `#${leaderboard_rank}` : <Ranking size={38} weight="duotone" color="#ff6b6b" />}
          </div>

          <div style={{
            fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 600,
          }}>
            {leaderboard_rank > 0 ? getRankTitle(leaderboard_rank) : "Unranked"}
          </div>

          {leaderboard_rank > 0 && leaderboard_percentile > 0 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
              Top {(100 - leaderboard_percentile).toFixed(0)}% of {leaderboard_total_users} users
            </div>
          )}
        </div>

        {/* XP & Level Card (clickable → xp) */}
        <GlassPanel
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, cursor: "pointer" }}
          onClick={() => handleClick("xp")}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Level Circle */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #ff3b3b, #ff6b6b)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(255,59,59,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)",
              position: "relative",
            }}>
              <svg style={{ position: "absolute", top: -3, left: -3, width: 78, height: 78, transform: "rotate(-90deg)" }}>
                <circle cx="39" cy="39" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="39" cy="39" r="36" fill="none" stroke="#facc15" strokeWidth="3"
                  strokeDasharray={`${(xp.level_progress_pct / 100) * 226.2} 226.2`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
              </svg>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "var(--font-space-grotesk)", lineHeight: 1 }}>
                {xp.level}
              </span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Level</span>
            </div>

            {/* XP Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-space-grotesk)" }}>
                  <AnimatedNumber value={xp.total_xp} /> <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>XP</span>
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {xp.xp_to_next_level} to Lv{xp.level + 1}
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${xp.level_progress_pct}%`, borderRadius: 4,
                  background: "linear-gradient(90deg, #ff3b3b, #ff6b6b, #facc15)",
                  transition: "width 0.8s ease", boxShadow: "0 0 8px rgba(255,59,59,0.3)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  <Lightning size={11} weight="fill" color="#facc15" style={{ verticalAlign: "middle", marginRight: 2 }} />
                  {xp.weekly_xp} XP this week
                </span>
                {current_xp_multiplier > 1 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                    {current_xp_multiplier}x
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Streak Card (clickable → xp) */}
        <div
          onClick={() => handleClick("xp")}
          style={{
            padding: "16px 20px", borderRadius: 14, cursor: "pointer",
            background: streak && streak.current_login_streak > 0
              ? "linear-gradient(145deg, rgba(250,204,21,0.08), rgba(255,150,50,0.04))"
              : "rgba(255,255,255,0.03)",
            border: streak && streak.current_login_streak > 0
              ? "1px solid rgba(250,204,21,0.15)"
              : "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6, minWidth: 120,
            transition: "transform 0.15s ease",
          }}
        >
          <Fire size={28} weight="fill"
            color={streak && streak.current_login_streak > 0 ? "#facc15" : "rgba(255,255,255,0.15)"}
            style={{ filter: streak && streak.current_login_streak > 0 ? "drop-shadow(0 0 8px rgba(250,204,21,0.4))" : "none" }}
          />
          <div style={{
            fontSize: 28, fontWeight: 800, lineHeight: 1,
            color: streak && streak.current_login_streak > 0 ? "#facc15" : "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-space-grotesk)",
          }}>
            {streak?.current_login_streak ?? 0}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Day Streak
          </div>
        </div>
      </div>

      {/* ── Row 2: Compact Stats + View All ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Stats pills */}
        <button
          onClick={() => handleClick("badges")}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 10, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
            color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500,
          }}
        >
          <Shield size={14} weight="duotone" color="#a78bfa" />
          <span style={{ fontWeight: 700, color: "#a78bfa" }}>{earned_badges}</span>
          <span>/ {total_badges} badges</span>
        </button>

        <button
          onClick={() => handleClick("challenges")}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 10, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
            color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500,
          }}
        >
          <Target size={14} weight="duotone" color="#ff6b6b" />
          <span style={{ fontWeight: 700, color: "#4ade80" }}>{completedChallenges}</span>
          <span>/ {active_challenges.length} challenges</span>
        </button>

        {current_xp_multiplier > 1 && (
          <button
            onClick={() => handleClick("xp")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 10, background: "rgba(255,59,59,0.05)",
              border: "1px solid rgba(255,59,59,0.12)", cursor: "pointer",
              color: "#ff6b6b", fontSize: 12, fontWeight: 700,
            }}
          >
            <Lightning size={14} weight="fill" color="#ff6b6b" />
            {current_xp_multiplier}x Multiplier
          </button>
        )}

        {/* View All button */}
        <button
          onClick={() => handleClick()}
          style={{
            marginLeft: "auto",
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            background: "rgba(255,59,59,0.08)",
            border: "1px solid rgba(255,59,59,0.15)",
            cursor: "pointer",
            color: "#ff6b6b",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          View All
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
