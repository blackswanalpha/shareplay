"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import AdminRetentionLoading from "./loading";
import { KPICard } from "@/components/admin/KPICard";
import {
  useAdminRetentionDashboard,
  useAdminRetentionScores,
  useAdminRetentionLeaderboard,
  useAdminTriggerCampaign,
  useAdminUpdateRetentionSettings,
  useAdminCampaignTemplates,
  useAdminCreateCampaignTemplate,
  useAdminDeleteCampaignTemplate,
  useAdminTriggerCustomCampaign,
  useAdminCampaignAnalytics,
} from "@/hooks/useAdminApi";
import {
  Heartbeat,
  Users,
  Trophy,
  Lightning,
  Medal,
  ArrowClockwise,
  Power,
  PaperPlaneRight,
  Plus,
  Trash,
  ChartBar,
} from "@phosphor-icons/react";

const riskColors: Record<string, string> = {
  healthy: "#4ade80",
  at_risk: "#facc15",
  churning: "#fb923c",
  churned: "#f87171",
};

const riskLabels: Record<string, string> = {
  healthy: "Healthy",
  at_risk: "At Risk",
  churning: "Churning",
  churned: "Churned",
};

export default function RetentionPage() {
  const { data: dashboard, isLoading } = useAdminRetentionDashboard();
  const { data: scores } = useAdminRetentionScores({ per_page: 10 });
  const { data: leaderboard } = useAdminRetentionLeaderboard({ limit: 10 });
  const triggerCampaign = useAdminTriggerCampaign();
  const toggleEngine = useAdminUpdateRetentionSettings();
  const { data: templates } = useAdminCampaignTemplates();
  const createTemplate = useAdminCreateCampaignTemplate();
  const deleteTemplate = useAdminDeleteCampaignTemplate();
  const triggerCustom = useAdminTriggerCustomCampaign();
  const { data: analytics } = useAdminCampaignAnalytics();

  const headerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [campaignStatus, setCampaignStatus] = useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    body_template: "",
    channel: "notification",
    target_filter: {} as Record<string, unknown>,
  });

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (headerRef.current) {
      tl.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45 });
    }
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 }, "-=0.2");
    }
    if (dividerRef.current) {
      tl.fromTo(dividerRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, "-=0.15");
    }
    return () => { tl.kill(); };
  }, []);

  if (isLoading || !dashboard) {
    return <AdminRetentionLoading />;
  }

  const d = dashboard;
  const totalUsers = Object.values(d.risk_distribution).reduce((a, b) => a + b, 0);

  const handleTriggerCampaign = async (type: string) => {
    setCampaignStatus(`Sending ${type}...`);
    try {
      const result = await triggerCampaign.mutateAsync({ campaign_type: type });
      setCampaignStatus(`${type}: ${result.sent} sent, ${result.skipped} skipped`);
    } catch {
      setCampaignStatus(`Failed to trigger ${type}`);
    }
    setTimeout(() => setCampaignStatus(null), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1280 }}>
      {/* Header */}
      <div>
        <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", opacity: 0 }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              margin: 0, color: "#f5f5f5", letterSpacing: "-0.02em",
            }}>
              Retention Engine
            </h1>
            <p ref={subtitleRef} style={{
              fontSize: 14, color: "rgba(255,255,255,0.35)",
              margin: "6px 0 0", fontFamily: "'Inter', sans-serif", opacity: 0,
            }}>
              Monitor engagement, streaks, achievements, and re-engagement campaigns.
            </p>
          </div>
          <button
            onClick={() => toggleEngine.mutate({ enabled: true })}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.15)",
              color: "#4ade80", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Power size={14} weight="bold" />
            ENGINE ON
          </button>
        </div>
        <div ref={dividerRef} style={{
          height: 1, marginTop: 20,
          background: "linear-gradient(to right, rgba(255,59,59,0.3), rgba(255,255,255,0.06), transparent)",
          transformOrigin: "left",
        }} />
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <KPICard
          label="Avg Score"
          value={Math.round(d.avg_score)}
          subtitle={`of ${d.total_scored_users} users`}
          icon={<Heartbeat size={20} weight="duotone" />}
          index={0}
        />
        <KPICard
          label="Healthy Users"
          value={d.risk_distribution.healthy || 0}
          icon={<Users size={20} weight="duotone" />}
          accentColor="#4ade80"
          index={1}
        />
        <KPICard
          label="At-Risk Users"
          value={(d.risk_distribution.at_risk || 0) + (d.risk_distribution.churning || 0)}
          icon={<Users size={20} weight="duotone" />}
          accentColor="#fb923c"
          index={2}
        />
        <KPICard
          label="Active Streaks"
          value={d.active_streaks}
          icon={<Lightning size={20} weight="duotone" />}
          accentColor="#facc15"
          index={3}
        />
        <KPICard
          label="Badges Earned"
          value={d.total_achievements}
          icon={<Medal size={20} weight="duotone" />}
          accentColor="#a78bfa"
          index={4}
        />
      </div>

      {/* Risk Distribution Bar */}
      <div style={{
        padding: "24px 28px", borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase", letterSpacing: "0.06em",
          fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
        }}>
          Risk Distribution
        </h3>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", gap: 2 }}>
          {(["healthy", "at_risk", "churning", "churned"] as const).map((level) => {
            const count = d.risk_distribution[level] || 0;
            const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={level}
                title={`${riskLabels[level]}: ${count} (${pct.toFixed(1)}%)`}
                style={{
                  width: `${pct}%`,
                  background: riskColors[level],
                  opacity: 0.8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#000",
                  fontFamily: "'JetBrains Mono', monospace",
                  minWidth: pct > 5 ? "auto" : 0,
                }}
              >
                {pct > 8 ? `${Math.round(pct)}%` : ""}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
          {(["healthy", "at_risk", "churning", "churned"] as const).map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: riskColors[level], opacity: 0.8 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
                {riskLabels[level]}: {d.risk_distribution[level] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Trend */}
      {d.score_trend.length > 0 && (
        <div style={{
          padding: "24px 28px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
          }}>
            Score Trend (7 Days)
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {d.score_trend.map((point, i) => {
              const maxScore = Math.max(...d.score_trend.map((p) => p.avg_score), 1);
              const height = (point.avg_score / maxScore) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {point.avg_score}
                  </span>
                  <div
                    style={{
                      width: "100%", maxWidth: 60,
                      height: `${Math.max(height, 4)}%`,
                      borderRadius: "6px 6px 2px 2px",
                      background: `linear-gradient(to top, #ff3b3b, #ff6b6b)`,
                      opacity: 0.8,
                    }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {point.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-Column: Scores + Leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Top Engagement Scores */}
        <div style={{
          padding: "24px 28px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
          }}>
            Top Engagement Scores
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(scores || []).map((s, i) => (
              <div key={s.user_id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                    fontFamily: "'JetBrains Mono', monospace", width: 20,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>
                    {s.username}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 12, padding: "2px 8px", borderRadius: 4,
                    background: `${riskColors[s.risk_level] || "#888"}18`,
                    color: riskColors[s.risk_level] || "#888",
                    fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {s.risk_level}
                  </span>
                  <span style={{
                    fontSize: 16, fontWeight: 700, color: "#fff",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {Math.round(s.score)}
                  </span>
                </div>
              </div>
            ))}
            {(!scores || scores.length === 0) && (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                No scores computed yet. Wait for the scoring loop to run.
              </div>
            )}
          </div>
        </div>

        {/* Reaction Leaderboard */}
        <div style={{
          padding: "24px 28px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
          }}>
            <Trophy size={16} weight="duotone" style={{ marginRight: 6, verticalAlign: "middle" }} />
            Reaction Leaderboard
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(leaderboard || []).map((entry) => (
              <div key={entry.user_id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: entry.rank <= 3 ? "#facc15" : "rgba(255,255,255,0.3)",
                    fontFamily: "'JetBrains Mono', monospace", width: 24,
                  }}>
                    #{entry.rank}
                  </span>
                  <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>
                    {entry.username}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {entry.weekly_reactions} /wk
                  </span>
                  <span style={{
                    fontSize: 16, fontWeight: 700, color: "#ff3b3b",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {entry.total_reactions}
                  </span>
                </div>
              </div>
            ))}
            {(!leaderboard || leaderboard.length === 0) && (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                No reaction data yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Controls */}
      <div style={{
        padding: "24px 28px", borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase", letterSpacing: "0.06em",
          fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
        }}>
          Re-engagement Campaigns
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {([
            { type: "we_miss_you", label: "We Miss You", desc: "Target churning/churned users", count: d.campaign_stats.we_miss_you || 0, color: "#f87171" },
            { type: "friends_watching", label: "Friends Watching", desc: "Notify users with active friends", count: d.campaign_stats.friends_watching || 0, color: "#60a5fa" },
            { type: "weekly_digest", label: "Weekly Digest", desc: "Send weekly stats to active users", count: d.campaign_stats.weekly_digest || 0, color: "#a78bfa" },
          ] as const).map((campaign) => (
            <div key={campaign.type} style={{
              padding: "18px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{campaign.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{campaign.desc}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: campaign.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {campaign.count}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>total sent</div>
              <button
                onClick={() => handleTriggerCampaign(campaign.type)}
                disabled={triggerCampaign.isPending}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 6, marginTop: "auto",
                  background: `${campaign.color}18`, border: `1px solid ${campaign.color}30`,
                  color: campaign.color, cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  opacity: triggerCampaign.isPending ? 0.5 : 1,
                }}
              >
                <PaperPlaneRight size={14} weight="bold" />
                Trigger Now
              </button>
            </div>
          ))}
        </div>
        {campaignStatus && (
          <div style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            fontSize: 12, color: "rgba(255,255,255,0.6)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {campaignStatus}
          </div>
        )}
      </div>

      {/* Campaign Template Builder */}
      <div style={{
        padding: "24px 28px", borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif", margin: 0,
          }}>
            Campaign Templates
          </h3>
          <button
            onClick={() => setShowTemplateForm(!showTemplateForm)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6,
              background: "rgba(255,59,59,0.08)",
              border: "1px solid rgba(255,59,59,0.15)",
              color: "#ff6b6b", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
            }}
          >
            <Plus size={14} weight="bold" />
            {showTemplateForm ? "Cancel" : "Create Template"}
          </button>
        </div>

        {/* Inline Create Form */}
        {showTemplateForm && (
          <div style={{
            padding: 20, borderRadius: 10, marginBottom: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <input
              placeholder="Template name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              style={{
                padding: "8px 12px", borderRadius: 6, fontSize: 13,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none",
              }}
            />
            <input
              placeholder="Email subject"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              style={{
                padding: "8px 12px", borderRadius: 6, fontSize: 13,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none",
              }}
            />
            <textarea
              placeholder="Body template (use {username}, {dashboard_url} as placeholders)"
              value={templateForm.body_template}
              onChange={(e) => setTemplateForm({ ...templateForm, body_template: e.target.value })}
              rows={4}
              style={{
                padding: "8px 12px", borderRadius: 6, fontSize: 13,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none", resize: "vertical",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Channel:</span>
              {(["notification", "email", "both"] as const).map((ch) => (
                <label key={ch} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="channel"
                    checked={templateForm.channel === ch}
                    onChange={() => setTemplateForm({ ...templateForm, channel: ch })}
                  />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>{ch}</span>
                </label>
              ))}
            </div>
            <button
              onClick={async () => {
                await createTemplate.mutateAsync({
                  name: templateForm.name,
                  subject: templateForm.subject,
                  body_template: templateForm.body_template,
                  channel: templateForm.channel,
                  target_filter: templateForm.target_filter,
                  is_active: true,
                });
                setTemplateForm({ name: "", subject: "", body_template: "", channel: "notification", target_filter: {} });
                setShowTemplateForm(false);
              }}
              disabled={!templateForm.name || !templateForm.body_template || createTemplate.isPending}
              style={{
                padding: "8px 16px", borderRadius: 6, alignSelf: "flex-start",
                background: "#ff3b3b", border: "none", color: "#fff",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                opacity: (!templateForm.name || !templateForm.body_template || createTemplate.isPending) ? 0.5 : 1,
              }}
            >
              {createTemplate.isPending ? "Creating..." : "Create Template"}
            </button>
          </div>
        )}

        {/* Templates List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(templates || []).map((tmpl) => (
            <div key={tmpl.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{tmpl.name}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 4,
                    background: tmpl.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
                    color: tmpl.is_active ? "#4ade80" : "rgba(255,255,255,0.35)",
                    fontWeight: 600, textTransform: "uppercase",
                  }}>
                    {tmpl.is_active ? "Active" : "Inactive"}
                  </span>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 4,
                    background: "rgba(96,165,250,0.1)",
                    color: "#60a5fa", fontWeight: 600, textTransform: "capitalize",
                  }}>
                    {tmpl.channel}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {tmpl.send_count} sent
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => triggerCustom.mutate({ templateId: tmpl.id })}
                  disabled={triggerCustom.isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 12px", borderRadius: 6,
                    background: "rgba(96,165,250,0.08)",
                    border: "1px solid rgba(96,165,250,0.15)",
                    color: "#60a5fa", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  <PaperPlaneRight size={12} weight="bold" />
                  Trigger
                </button>
                <button
                  onClick={() => deleteTemplate.mutate(tmpl.id)}
                  disabled={deleteTemplate.isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 10px", borderRadius: 6,
                    background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.12)",
                    color: "#f87171", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  <Trash size={12} weight="bold" />
                </button>
              </div>
            </div>
          ))}
          {(!templates || templates.length === 0) && (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
              No campaign templates yet. Create one above.
            </div>
          )}
        </div>
      </div>

      {/* Campaign Analytics */}
      {analytics && analytics.length > 0 && (
        <div style={{
          padding: "24px 28px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            fontFamily: "'Inter', sans-serif", margin: "0 0 16px",
          }}>
            <ChartBar size={16} weight="duotone" style={{ marginRight: 6, verticalAlign: "middle" }} />
            Campaign Analytics
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analytics.map((a) => (
              <div key={a.template_id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 12,
                alignItems: "center", padding: "12px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{a.name}</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#ff6b6b", fontFamily: "'Space Grotesk', sans-serif" }}>{a.send_count}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Sent</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa", fontFamily: "'Space Grotesk', sans-serif" }}>{a.open_count}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Opens</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", fontFamily: "'Space Grotesk', sans-serif" }}>{a.click_count}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Clicks</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)",
                    overflow: "hidden", marginBottom: 4,
                  }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, a.open_rate)}%`,
                      borderRadius: 3, background: "#60a5fa",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a.open_rate.toFixed(1)}% open</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)",
                    overflow: "hidden", marginBottom: 4,
                  }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, a.click_rate)}%`,
                      borderRadius: 3, background: "#4ade80",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a.click_rate.toFixed(1)}% click</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer timestamp */}
      <div style={{
        textAlign: "center", padding: "8px 0 4px",
        fontSize: 11, color: "rgba(255,255,255,0.15)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Auto-refreshes every 30s &middot; Last updated {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
