"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Target,
  Ranking,
  Lightning,
  Fire,
  Shield,
  Star,
  Medal,
  Crown,
  CheckCircle,
  ArrowUp,
  Sparkle,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import type {
  BadgeCatalogEntry,
  GamificationChallenge,
  LeaderboardEntry,
  XPMultiplier,
  XPMilestone,
} from "@/lib/types";
import {
  useBadgeCatalog,
  useFullChallenges,
  useFullLeaderboard,
  useXPBreakdown,
} from "@/hooks/useApi";

type Tab = "badges" | "challenges" | "leaderboard" | "xp";

interface GamificationSideSheetProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

const tierColors: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

const categoryLabels: Record<string, string> = {
  rooms: "Rooms",
  messaging: "Messaging",
  reactions: "Reactions",
  playlists: "Playlists",
  social: "Social",
  hosting: "Hosting",
  streaks: "Streaks",
  special: "Special",
  milestone: "Milestones",
  content: "Content",
};

const categoryIcons: Record<string, typeof Trophy> = {
  rooms: Target,
  messaging: Lightning,
  reactions: Sparkle,
  playlists: Star,
  social: Shield,
  hosting: Crown,
  streaks: Fire,
  special: Medal,
  milestone: Trophy,
  content: Star,
};

const tabConfig: { key: Tab; label: string; Icon: typeof Trophy }[] = [
  { key: "badges", label: "Badges", Icon: Shield },
  { key: "challenges", label: "Challenges", Icon: Target },
  { key: "leaderboard", label: "Leaderboard", Icon: Ranking },
  { key: "xp", label: "XP Details", Icon: Lightning },
];

export function GamificationSideSheet({ open, onClose, initialTab = "badges" }: GamificationSideSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  // Fetch data based on active tab
  const { data: badgeCatalog } = useBadgeCatalog();
  const { data: challenges } = useFullChallenges();
  const { data: leaderboard } = useFullLeaderboard(leaderboardPage);
  const { data: xpBreakdown } = useXPBreakdown();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
          />

          {/* Side Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="gamification-side-sheet"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 420,
              maxWidth: "100vw",
              background: "rgba(10,10,10,0.98)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
            }}
          >
            <style>{`
              @media (max-width: 480px) {
                .gamification-side-sheet { width: 100vw !important; }
              }
            `}</style>

            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
                color: "#fff",
                margin: 0,
              }}>
                Gamification
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: 6,
                  cursor: "pointer",
                  display: "flex",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex",
              gap: 2,
              padding: "8px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              {tabConfig.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: "none",
                    background: activeTab === key ? "rgba(255,59,59,0.12)" : "transparent",
                    color: activeTab === key ? "#ff6b6b" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "var(--font-inter, 'Inter', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={16} weight={activeTab === key ? "fill" : "regular"} />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {activeTab === "badges" && badgeCatalog && <BadgesTab data={badgeCatalog} />}
              {activeTab === "challenges" && challenges && <ChallengesTab data={challenges} />}
              {activeTab === "leaderboard" && leaderboard && (
                <LeaderboardTab
                  data={leaderboard}
                  page={leaderboardPage}
                  onPageChange={setLeaderboardPage}
                />
              )}
              {activeTab === "xp" && xpBreakdown && <XPTab data={xpBreakdown} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Badges Tab ─────────────────────────────────────────────────────── */

function BadgesTab({ data }: { data: { categories: Record<string, BadgeCatalogEntry[]>; total_badges: number; earned_badges: number } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        padding: "12px 0",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ff6b6b", fontFamily: "var(--font-space-grotesk)" }}>
            {data.earned_badges}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Earned</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)" }}>
            {data.total_badges}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
        </div>
      </div>

      {/* Categories */}
      {Object.entries(data.categories).map(([cat, badges]) => {
        const CatIcon = categoryIcons[cat] || Trophy;
        const earned = badges.filter(b => b.earned).length;
        return (
          <div key={cat}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}>
              <CatIcon size={14} weight="fill" color="#ff6b6b" />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "var(--font-space-grotesk)",
              }}>
                {categoryLabels[cat] || cat}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
                {earned}/{badges.length}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165, 1fr))", gap: 8 }}>
              {badges.map(badge => (
                <BadgeCard key={badge.key} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeCatalogEntry }) {
  const progress = badge.progress_target > 0
    ? Math.min(100, (badge.progress_current / badge.progress_target) * 100)
    : 0;

  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 10,
      background: badge.earned
        ? "rgba(255,255,255,0.04)"
        : "rgba(255,255,255,0.015)",
      border: badge.earned
        ? `1px solid ${badge.tier ? tierColors[badge.tier] + "30" : "rgba(255,59,59,0.15)"}`
        : "1px solid rgba(255,255,255,0.04)",
      opacity: badge.earned ? 1 : 0.5,
      transition: "all 0.15s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: badge.earned
            ? (badge.tier ? tierColors[badge.tier] + "18" : "rgba(255,59,59,0.12)")
            : "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {badge.earned ? (
            <CheckCircle size={16} weight="fill" color={badge.tier ? tierColors[badge.tier] : "#ff6b6b"} />
          ) : (
            <Shield size={16} weight="regular" color="rgba(255,255,255,0.2)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: badge.earned ? "#fff" : "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {badge.name}
          </div>
          {badge.tier && (
            <div style={{
              fontSize: 9,
              color: tierColors[badge.tier],
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {badge.tier}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.3, marginBottom: 6 }}>
        {badge.description}
      </div>
      {!badge.earned && badge.progress_target > 0 && (
        <div>
          <div style={{
            height: 3,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
            {badge.progress_current}/{badge.progress_target}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Challenges Tab ─────────────────────────────────────────────────── */

function ChallengesTab({ data }: { data: { daily: GamificationChallenge[]; weekly: GamificationChallenge[]; total: number; completed: number } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        padding: "12px 0",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#4ade80", fontFamily: "var(--font-space-grotesk)" }}>
            {data.completed}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Completed</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)" }}>
            {data.total}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Active</div>
        </div>
      </div>

      {/* Daily */}
      {data.daily.length > 0 && (
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 10,
            fontFamily: "var(--font-space-grotesk)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <Fire size={14} weight="fill" color="#ff6b6b" />
            Daily Challenges
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.daily.map(ch => <ChallengeCard key={ch.id} challenge={ch} />)}
          </div>
        </div>
      )}

      {/* Weekly */}
      {data.weekly.length > 0 && (
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 10,
            fontFamily: "var(--font-space-grotesk)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <Target size={14} weight="fill" color="#6b8aff" />
            Weekly Challenges
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.weekly.map(ch => <ChallengeCard key={ch.id} challenge={ch} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge: ch }: { challenge: GamificationChallenge }) {
  const progress = ch.target_count > 0
    ? Math.min(100, (ch.current_count / ch.target_count) * 100)
    : 0;

  return (
    <div style={{
      padding: "12px 14px",
      borderRadius: 10,
      background: ch.completed ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.025)",
      border: ch.completed
        ? "1px solid rgba(74,222,128,0.15)"
        : "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: ch.completed ? "#4ade80" : "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            {ch.completed && <CheckCircle size={14} weight="fill" color="#4ade80" />}
            {ch.title}
          </div>
          {ch.description && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{ch.description}</div>
          )}
        </div>
        <div style={{
          padding: "3px 8px",
          borderRadius: 6,
          background: "rgba(255,59,59,0.1)",
          fontSize: 10,
          fontWeight: 700,
          color: "#ff6b6b",
          whiteSpace: "nowrap",
        }}>
          +{ch.xp_reward} XP
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          flex: 1,
          height: 4,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: ch.completed
              ? "linear-gradient(90deg, #4ade80, #22c55e)"
              : "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {ch.current_count}/{ch.target_count}
        </span>
      </div>
    </div>
  );
}

/* ─── Leaderboard Tab ────────────────────────────────────────────────── */

function LeaderboardTab({
  data,
  page,
  onPageChange,
}: {
  data: { entries: LeaderboardEntry[]; page: number; per_page: number; total_users: number; user_rank: LeaderboardEntry | null };
  page: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(data.total_users / data.per_page);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* User's own rank */}
      {data.user_rank && (
        <div style={{
          padding: "12px 14px",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,59,59,0.08), rgba(255,215,0,0.04))",
          border: "1px solid rgba(255,59,59,0.15)",
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Your Position
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#ff6b6b",
                fontFamily: "var(--font-space-grotesk)",
              }}>
                #{data.user_rank.rank}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{data.user_rank.username}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                  Level {data.user_rank.level} · {data.user_rank.total_xp.toLocaleString()} XP
                </div>
              </div>
            </div>
            {data.user_rank.percentile !== undefined && (
              <div style={{
                padding: "4px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
              }}>
                Top {(100 - data.user_rank.percentile).toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      {data.entries.map((entry, idx) => {
        const isTop3 = entry.rank <= 3;
        const medalColor = entry.rank === 1 ? "#ffd700" : entry.rank === 2 ? "#c0c0c0" : entry.rank === 3 ? "#cd7f32" : undefined;

        return (
          <div
            key={entry.user_id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: isTop3 ? "rgba(255,255,255,0.03)" : "transparent",
              border: isTop3 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            {/* Rank */}
            <div style={{
              width: 30,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 800,
              color: medalColor || "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-space-grotesk)",
            }}>
              {medalColor ? (
                <Medal size={18} weight="fill" color={medalColor} />
              ) : (
                `#${entry.rank}`
              )}
            </div>

            {/* User info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{entry.username}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                Level {entry.level}
              </div>
            </div>

            {/* XP */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b" }}>
                {entry.total_xp.toLocaleString()}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>XP</div>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          padding: "12px 0",
        }}>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: page <= 1 ? "default" : "pointer",
              color: page <= 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: page >= totalPages ? "default" : "pointer",
              color: page >= totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── XP Details Tab ─────────────────────────────────────────────────── */

function XPTab({ data }: { data: { total_xp: number; level: number; weekly_xp: number; xp_to_next_level: number; level_progress_pct: number; current_multiplier: number; active_multipliers: XPMultiplier[]; milestones: XPMilestone[] } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Multiplier Display */}
      <div style={{
        padding: "16px",
        borderRadius: 12,
        background: data.current_multiplier > 1
          ? "linear-gradient(135deg, rgba(255,59,59,0.08), rgba(255,215,0,0.06))"
          : "rgba(255,255,255,0.02)",
        border: data.current_multiplier > 1
          ? "1px solid rgba(255,59,59,0.15)"
          : "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: "var(--font-space-grotesk)",
          }}>
            XP Multiplier
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: data.current_multiplier > 1 ? "#ff6b6b" : "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-space-grotesk)",
          }}>
            {data.current_multiplier}x
          </div>
        </div>

        {data.active_multipliers.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.active_multipliers.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
              }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{m.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>+{((m.value - 1) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Build a 3+ day streak to earn XP multipliers!
          </div>
        )}
      </div>

      {/* XP Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{
          padding: 14,
          borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#ff6b6b", fontFamily: "var(--font-space-grotesk)" }}>
            {data.total_xp.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Total XP</div>
        </div>
        <div style={{
          padding: 14,
          borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#6b8aff", fontFamily: "var(--font-space-grotesk)" }}>
            {data.weekly_xp.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>This Week</div>
        </div>
      </div>

      {/* Level Progress */}
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
          fontFamily: "var(--font-space-grotesk)",
        }}>
          Level Progress
        </div>
        <div style={{
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Level {data.level}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {data.xp_to_next_level.toLocaleString()} XP to next
            </span>
          </div>
          <div style={{
            height: 6,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${data.level_progress_pct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ff3b3b, #ffd700)",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Level Milestones */}
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
          fontFamily: "var(--font-space-grotesk)",
        }}>
          Milestones (25 Levels)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {data.milestones.map(m => (
            <div
              key={m.level}
              style={{
                padding: "8px 4px",
                borderRadius: 6,
                background: m.reached ? "rgba(255,59,59,0.08)" : "rgba(255,255,255,0.02)",
                border: m.reached ? "1px solid rgba(255,59,59,0.15)" : "1px solid rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 800,
                color: m.reached ? "#ff6b6b" : "rgba(255,255,255,0.2)",
                fontFamily: "var(--font-space-grotesk)",
              }}>
                {m.level}
              </div>
              <div style={{ fontSize: 8, color: m.reached ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)" }}>
                {m.xp_required >= 1000 ? `${(m.xp_required / 1000).toFixed(0)}k` : m.xp_required}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
