"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { GamificationSummary, UserXP, AchievementProgress } from "@/lib/types";
import {
  Fire,
  Trophy,
  Star,
  Lightning,
  Medal,
  CheckCircle,
  Crown,
  Ranking,
  Target,
  ArrowUp,
  Sparkle,
  Shield,
} from "@phosphor-icons/react";

interface GamificationPanelProps {
  data: GamificationSummary;
}

const tierColors: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

const tierGradients: Record<string, string> = {
  bronze: "linear-gradient(135deg, #cd7f32, #a0622a)",
  silver: "linear-gradient(135deg, #c0c0c0, #8a8a8a)",
  gold: "linear-gradient(135deg, #ffd700, #f0a500)",
};

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

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function GamificationPanel({ data }: GamificationPanelProps) {
  const { xp, achievements, active_challenges, streak, leaderboard_rank, leaderboard_top5 } = data;
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

  const earnedBadges = achievements.filter(a => a.earned_at);
  const goldBadges = earnedBadges.filter(a => a.tier === "gold").length;
  const silverBadges = earnedBadges.filter(a => a.tier === "silver").length;
  const bronzeBadges = earnedBadges.filter(a => a.tier === "bronze").length;
  const completedChallenges = active_challenges.filter(ch => ch.completed).length;

  return (
    <div ref={sectionRef} style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16, opacity: 0 }}>
      {/* ── Row 1: Rank/Position Card + XP & Level + Streak ── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr auto", gap: 16 }} className="gamification-top-row">
        <style>{`
          @media (max-width: 900px) {
            .gamification-top-row { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Rank / Position Card */}
        <div
          ref={rankCardRef}
          style={{
            padding: "24px 20px",
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
            gap: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: leaderboard_rank <= 3
              ? "radial-gradient(circle, rgba(255,215,0,0.15), transparent)"
              : "radial-gradient(circle, rgba(255,59,59,0.1), transparent)",
            pointerEvents: "none",
          }} />

          {/* Crown for top 3 */}
          {leaderboard_rank > 0 && leaderboard_rank <= 3 && (
            <Crown
              size={28}
              weight="fill"
              color={rankMedals[leaderboard_rank]}
              style={{ filter: `drop-shadow(0 0 8px ${rankMedals[leaderboard_rank]}80)` }}
            />
          )}

          {/* Rank number */}
          <div style={{
            fontSize: 48,
            fontWeight: 900,
            fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            lineHeight: 1,
            color: leaderboard_rank <= 3 ? "#ffd700" : "#ff3b3b",
            textShadow: leaderboard_rank <= 3
              ? "0 0 20px rgba(255,215,0,0.4)"
              : "0 0 20px rgba(255,59,59,0.3)",
          }}>
            {leaderboard_rank > 0 ? (
              <>#{leaderboard_rank}</>
            ) : (
              <Ranking size={42} weight="duotone" color="#ff6b6b" />
            )}
          </div>

          <div style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            fontWeight: 600,
          }}>
            {leaderboard_rank > 0 ? getRankTitle(leaderboard_rank) : "Unranked"}
          </div>

          {/* Position change hint */}
          {leaderboard_rank > 0 && xp.xp_to_next_level > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}>
              <ArrowUp size={10} weight="bold" color="#4ade80" />
              <span>{xp.xp_to_next_level} XP to level up</span>
            </div>
          )}
        </div>

        {/* XP & Level Card */}
        <GlassPanel style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {/* Level Circle */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff3b3b, #ff6b6b)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(255,59,59,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)",
              position: "relative",
            }}>
              {/* Ring */}
              <svg style={{ position: "absolute", top: -3, left: -3, width: 86, height: 86, transform: "rotate(-90deg)" }}>
                <circle cx="43" cy="43" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="43" cy="43" r="40" fill="none"
                  stroke="#facc15"
                  strokeWidth="3"
                  strokeDasharray={`${(xp.level_progress_pct / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <span style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                lineHeight: 1,
              }}>
                {xp.level}
              </span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Level
              </span>
            </div>

            {/* XP Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                }}>
                  <AnimatedNumber value={xp.total_xp} /> <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>XP</span>
                </span>
                <span style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-inter, 'Inter', sans-serif)",
                }}>
                  {xp.xp_to_next_level} to Lv{xp.level + 1}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{
                  height: "100%",
                  width: `${xp.level_progress_pct}%`,
                  borderRadius: 5,
                  background: "linear-gradient(90deg, #ff3b3b, #ff6b6b, #facc15)",
                  transition: "width 0.8s ease",
                  boxShadow: "0 0 8px rgba(255,59,59,0.3)",
                }} />
              </div>

              {/* Weekly XP */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
                  <Lightning size={12} weight="fill" color="#facc15" style={{ verticalAlign: "middle", marginRight: 3 }} />
                  {xp.weekly_xp} XP this week
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {Math.round(xp.level_progress_pct)}%
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Streak Card */}
        <div style={{
          padding: "20px 24px",
          borderRadius: 14,
          background: streak && streak.current_login_streak > 0
            ? "linear-gradient(145deg, rgba(250,204,21,0.08), rgba(255,150,50,0.04))"
            : "rgba(255,255,255,0.03)",
          border: streak && streak.current_login_streak > 0
            ? "1px solid rgba(250,204,21,0.15)"
            : "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minWidth: 130,
        }}>
          <Fire
            size={32}
            weight="fill"
            color={streak && streak.current_login_streak > 0 ? "#facc15" : "rgba(255,255,255,0.15)"}
            style={{
              filter: streak && streak.current_login_streak > 0 ? "drop-shadow(0 0 8px rgba(250,204,21,0.4))" : "none",
            }}
          />
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: streak && streak.current_login_streak > 0 ? "#facc15" : "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            lineHeight: 1,
          }}>
            {streak?.current_login_streak ?? 0}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Day Streak
          </div>
          {streak && streak.longest_login_streak > 0 && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Best: {streak.longest_login_streak}d
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Leaderboard + Active Challenges ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="gamification-mid-row">
        <style>{`
          @media (max-width: 768px) {
            .gamification-mid-row { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Full Leaderboard */}
        <GlassPanel hoverEffect={false} style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Trophy size={18} weight="duotone" color="#facc15" />
              Leaderboard
            </h3>
            {leaderboard_rank > 0 && (
              <span style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-inter, 'Inter', sans-serif)",
              }}>
                You&apos;re {getOrdinal(leaderboard_rank)}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {leaderboard_top5.map((entry, i) => (
              <LeaderboardRow key={entry.user_id} entry={entry} rank={i + 1} isCurrentUser={entry.user_id === xp.user_id} />
            ))}

            {leaderboard_top5.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                <Ranking size={28} weight="duotone" color="rgba(255,255,255,0.1)" style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                No leaderboard data yet
              </div>
            )}

            {/* User's own position if not in top 5 */}
            {leaderboard_rank > 5 && (
              <>
                <div style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.12)",
                  fontSize: 10,
                  padding: "4px 0",
                  letterSpacing: "0.2em",
                }}>
                  &bull;&bull;&bull;
                </div>
                <LeaderboardRow
                  entry={xp}
                  rank={leaderboard_rank}
                  isCurrentUser={true}
                  highlight
                />
              </>
            )}
          </div>
        </GlassPanel>

        {/* Active Challenges */}
        <GlassPanel hoverEffect={false} style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Target size={18} weight="duotone" color="#ff6b6b" />
              Active Challenges
            </h3>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 10,
              background: completedChallenges > 0 ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
              color: completedChallenges > 0 ? "#4ade80" : "rgba(255,255,255,0.3)",
              fontWeight: 600,
            }}>
              {completedChallenges}/{active_challenges.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {active_challenges.slice(0, 4).map((ch) => (
              <div key={ch.id} style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: ch.completed ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
                border: ch.completed ? "1px solid rgba(74,222,128,0.1)" : "1px solid rgba(255,255,255,0.04)",
                transition: "all 0.2s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {ch.completed ? (
                      <CheckCircle size={16} weight="fill" color="#4ade80" />
                    ) : (
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.15)",
                      }} />
                    )}
                    <span style={{
                      fontSize: 13,
                      color: ch.completed ? "rgba(255,255,255,0.5)" : "#fff",
                      fontWeight: 500,
                      textDecoration: ch.completed ? "line-through" : "none",
                    }}>
                      {ch.title}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: ch.completed ? "#4ade80" : "#ff6b6b",
                    fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: ch.completed ? "rgba(74,222,128,0.08)" : "rgba(255,59,59,0.06)",
                  }}>
                    +{ch.xp_reward}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.06)",
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
                  <span style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {ch.current_count}/{ch.target_count}
                  </span>
                </div>

                {/* Challenge type tag */}
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em",
                    color: ch.challenge_type === "daily" ? "#60a5fa" : "#a78bfa",
                    fontWeight: 600,
                  }}>
                    {ch.challenge_type}
                  </span>
                </div>
              </div>
            ))}

            {active_challenges.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                <Target size={28} weight="duotone" color="rgba(255,255,255,0.1)" style={{ display: "block", margin: "0 auto 8px" }} />
                No active challenges yet
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* ── Row 3: Badge Showcase ── */}
      <GlassPanel hoverEffect={false} style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Sparkle size={18} weight="duotone" color="#a78bfa" />
            Badge Collection
          </h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Tier counters */}
            {goldBadges > 0 && (
              <TierCounter color="#ffd700" count={goldBadges} />
            )}
            {silverBadges > 0 && (
              <TierCounter color="#c0c0c0" count={silverBadges} />
            )}
            {bronzeBadges > 0 && (
              <TierCounter color="#cd7f32" count={bronzeBadges} />
            )}
            <span style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
            }}>
              {earnedBadges.length} earned
            </span>
          </div>
        </div>

        {earnedBadges.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
          }}>
            {earnedBadges.slice(0, 8).map((a) => (
              <BadgeCard key={a.id} achievement={a} />
            ))}
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            <Shield size={32} weight="duotone" color="rgba(255,255,255,0.08)" style={{ display: "block", margin: "0 auto 10px" }} />
            Complete challenges and hit milestones to earn badges
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

/* ── Sub-components ── */

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  highlight,
}: {
  entry: UserXP;
  rank: number;
  isCurrentUser: boolean;
  highlight?: boolean;
}) {
  const isTop3 = rank <= 3;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      borderRadius: 10,
      background: highlight
        ? "rgba(255,59,59,0.06)"
        : isTop3
          ? `rgba(255,215,0,${0.06 - (rank - 1) * 0.015})`
          : "rgba(255,255,255,0.02)",
      border: highlight
        ? "1px solid rgba(255,59,59,0.12)"
        : isTop3
          ? "1px solid rgba(255,215,0,0.08)"
          : "1px solid rgba(255,255,255,0.03)",
      transition: "background 0.15s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Rank badge */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isTop3
            ? `${rankMedals[rank]}18`
            : "rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}>
          {rank === 1 ? (
            <Crown size={14} weight="fill" color="#ffd700" />
          ) : (
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: isTop3 ? rankMedals[rank] : "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
            }}>
              {rank}
            </span>
          )}
        </div>

        {/* Username */}
        <div>
          <span style={{
            fontSize: 13,
            color: isCurrentUser ? "#ff6b6b" : "#fff",
            fontWeight: isCurrentUser ? 600 : 500,
          }}>
            {isCurrentUser ? "You" : entry.username}
          </span>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
            Level {entry.level}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: isTop3 ? "#facc15" : "#ff6b6b",
          fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
        }}>
          {entry.total_xp.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>XP</div>
      </div>
    </div>
  );
}

function BadgeCard({ achievement }: { achievement: AchievementProgress }) {
  const tierColor = achievement.tier ? tierColors[achievement.tier] || "#ff6b6b" : "#ff6b6b";
  const hasTier = !!achievement.tier;

  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: 12,
      background: hasTier
        ? `${tierColor}08`
        : "rgba(255,255,255,0.02)",
      border: `1px solid ${hasTier ? `${tierColor}20` : "rgba(255,255,255,0.04)"}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      transition: "all 0.2s ease",
    }}>
      {/* Badge icon */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: hasTier
          ? tierGradients[achievement.tier!]
          : "linear-gradient(135deg, #ff3b3b, #ff6b6b)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${tierColor}30`,
      }}>
        <Medal size={18} weight="fill" color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          color: "#fff",
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {achievement.achievement_name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
          {hasTier && (
            <span style={{
              fontSize: 9,
              textTransform: "uppercase",
              fontWeight: 700,
              color: tierColor,
              letterSpacing: "0.06em",
            }}>
              {achievement.tier}
            </span>
          )}
          {achievement.description && (
            <span style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {hasTier ? " \u00b7 " : ""}{achievement.description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TierCounter({ color, count }: { color: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}60`,
      }} />
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color,
        fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
      }}>
        {count}
      </span>
    </div>
  );
}
