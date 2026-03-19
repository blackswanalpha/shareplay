"use client";

import { useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminUserGrowth, useAdminRoomTrends, useAdminEngagement, useAdminRetention } from "@/hooks/useAdminApi";
import { API_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data: userGrowth } = useAdminUserGrowth(period);
  const { data: roomTrends } = useAdminRoomTrends(period);
  const { data: engagement } = useAdminEngagement();
  const { data: retention } = useAdminRetention();

  const handleExport = async (type: string) => {
    const token = getAccessToken();
    const res = await fetch(`${API_URL}/admin/analytics/export?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Analytics & Reports</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["7d", "30d", "90d", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                border: period === p ? "1px solid rgba(255,59,59,0.4)" : "1px solid rgba(255,255,255,0.1)",
                background: period === p ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
                color: period === p ? "#ff3b3b" : "rgba(255,255,255,0.5)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement KPIs */}
      {engagement && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <KPICard label="DAU" value={engagement.dau} accentColor="#4ade80" />
          <KPICard label="WAU" value={engagement.wau} accentColor="#60a5fa" />
          <KPICard label="MAU" value={engagement.mau} accentColor="#a78bfa" />
          <KPICard label="Avg Session" value={`${engagement.avg_session_minutes}m`} />
          <KPICard label="Msgs/User" value={engagement.messages_per_user} />
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>User Growth</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
            {(userGrowth?.data || []).map((p, i) => {
              const max = Math.max(...(userGrowth?.data || []).map((d) => d.count), 1);
              return (
                <div key={i} title={`${p.date}: ${p.count}`} style={{ flex: 1, height: `${(p.count / max) * 100}%`, minHeight: 2, background: "linear-gradient(to top, #ff3b3b, #ff6b6b)", borderRadius: "3px 3px 0 0" }} />
              );
            })}
          </div>
        </div>
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>Room Trends</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
            {(roomTrends?.data || []).map((p, i) => {
              const max = Math.max(...(roomTrends?.data || []).map((d) => d.count), 1);
              return (
                <div key={i} title={`${p.date}: ${p.count}`} style={{ flex: 1, height: `${(p.count / max) * 100}%`, minHeight: 2, background: "linear-gradient(to top, #60a5fa, #93c5fd)", borderRadius: "3px 3px 0 0" }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* Retention Cohorts */}
      {retention && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>Retention Cohorts</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {(retention.cohorts as Array<Record<string, unknown>>).map((c, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{String(c.week)}</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: Number(c.retention_rate) > 50 ? "#4ade80" : Number(c.retention_rate) > 25 ? "#facc15" : "#f87171" }}>
                  {String(c.retention_rate)}%
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {String(c.returned_users)}/{String(c.total_users)} returned
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Export Data (CSV)</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["users", "rooms", "sessions", "messages"].map((type) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
