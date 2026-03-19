"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { GamificationSummary } from "@/lib/types";
import {
  Fire,
  Trophy,
  Star,
  Lightning,
  Medal,
  CheckCircle,
} from "@phosphor-icons/react";

interface GamificationPanelProps {
  data: GamificationSummary;
}

const tierColors: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

export function GamificationPanel({ data }: GamificationPanelProps) {
  const { xp, achievements, active_challenges, streak, leaderboard_rank, leaderboard_top5 } = data;

  return (
    <GlassPanel style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            letterSpacing: "-0.02em",
          }}>
            <Lightning size={20} weight="duotone" color="#facc15" style={{ marginRight: 8, verticalAlign: "middle" }} />
            Your Progress
          </h2>
          {leaderboard_rank > 0 && (
            <span style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            }}>
              <Trophy size={14} weight="duotone" color="#facc15" style={{ marginRight: 4, verticalAlign: "middle" }} />
              Rank #{leaderboard_rank}
            </span>
          )}
        </div>

        {/* XP & Level Bar + Streak */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {/* Level circle */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff3b3b, #ff6b6b)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
              lineHeight: 1,
            }}>
              {xp.level}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Level
            </span>
          </div>

          {/* XP Progress */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)" }}>
                <AnimatedNumber value={xp.total_xp} /> XP
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {xp.xp_to_next_level} to next level
              </span>
            </div>
            <div style={{
              height: 10,
              borderRadius: 5,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${xp.level_progress_pct}%`,
                borderRadius: 5,
                background: "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
                transition: "width 0.8s ease",
              }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              {xp.weekly_xp} XP this week
            </div>
          </div>

          {/* Streak */}
          {streak && streak.current_login_streak > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              background: "rgba(250,204,21,0.08)",
              border: "1px solid rgba(250,204,21,0.15)",
            }}>
              <Fire size={22} weight="fill" color="#facc15" />
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#facc15",
                  fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                  lineHeight: 1,
                }}>
                  {streak.current_login_streak}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  day streak
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Challenges + Recent Badges + Mini Leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Active Challenges */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 10px",
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            }}>
              Active Challenges
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {active_challenges.slice(0, 3).map((ch) => (
                <div key={ch.id} style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: ch.completed ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
                  border: ch.completed ? "1px solid rgba(74,222,128,0.12)" : "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                      {ch.completed && <CheckCircle size={14} weight="fill" color="#4ade80" style={{ marginRight: 4, verticalAlign: "middle" }} />}
                      {ch.title}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: "#ff6b6b",
                      fontWeight: 600,
                      fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    }}>
                      +{ch.xp_reward} XP
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, (ch.current_count / ch.target_count) * 100)}%`,
                      borderRadius: 3,
                      background: ch.completed ? "#4ade80" : "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    {ch.current_count}/{ch.target_count}
                  </div>
                </div>
              ))}
              {active_challenges.length === 0 && (
                <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  No active challenges yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Badges */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 10px",
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            }}>
              Recent Badges
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {achievements.slice(0, 3).map((a) => (
                <div key={a.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <Medal size={20} weight="duotone" color={a.tier ? tierColors[a.tier] || "#888" : "#ff6b6b"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                      {a.achievement_name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {a.description}
                      </span>
                      {a.tier && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: tierColors[a.tier] || "#888",
                          display: "inline-block",
                          boxShadow: `0 0 6px ${tierColors[a.tier] || "#888"}80`,
                        }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  No badges earned yet
                </div>
              )}
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 10px",
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            }}>
              <Star size={14} weight="duotone" color="#facc15" style={{ marginRight: 4, verticalAlign: "middle" }} />
              Top Players
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {leaderboard_top5.map((entry, i) => (
                <div key={entry.user_id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: i === 0 ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)",
                  border: i === 0 ? "1px solid rgba(255,215,0,0.1)" : "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: i < 3 ? "#facc15" : "rgba(255,255,255,0.3)",
                      width: 18,
                      fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                      {entry.username}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      Lv{entry.level}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#ff6b6b",
                      fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    }}>
                      {entry.total_xp}
                    </span>
                  </div>
                </div>
              ))}
              {leaderboard_top5.length === 0 && (
                <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  No leaderboard data yet
                </div>
              )}
              {/* Show user's own rank if > 5 */}
              {leaderboard_rank > 5 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(255,59,59,0.06)",
                  border: "1px solid rgba(255,59,59,0.12)",
                  marginTop: 4,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ff6b6b",
                      width: 18,
                      fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    }}>
                      {leaderboard_rank}
                    </span>
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                      You
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      Lv{xp.level}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#ff6b6b",
                      fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    }}>
                      {xp.total_xp}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
