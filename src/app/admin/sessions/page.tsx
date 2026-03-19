"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminActiveSessions, useAdminSessionStats, useAdminSessionHistory, useAdminTerminateSession } from "@/hooks/useAdminApi";

export default function AdminSessionsPage() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [page, setPage] = useState(1);
  const { data: activeSessions } = useAdminActiveSessions(page);
  const { data: stats } = useAdminSessionStats();
  const { data: history } = useAdminSessionHistory({ page });
  const terminateSession = useAdminTerminateSession();

  const sessions = tab === "active" ? activeSessions : history;

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "username", label: "User", render: (s: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(s.username)}</span>
    )},
    { key: "room_name", label: "Room" },
    { key: "room_code", label: "Code", render: (s: Record<string, unknown>) => (
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>{String(s.room_code)}</span>
    )},
    { key: "joined_at", label: "Joined", render: (s: Record<string, unknown>) => (
      <span style={{ fontSize: 12 }}>{new Date(String(s.joined_at)).toLocaleString()}</span>
    )},
    { key: "duration", label: "Duration", render: (s: Record<string, unknown>) => {
      if (s.duration_seconds) return <span>{Math.round(Number(s.duration_seconds) / 60)}m</span>;
      const mins = Math.round((Date.now() - new Date(String(s.joined_at)).getTime()) / 60000);
      return <span style={{ color: "#4ade80" }}>{mins}m (active)</span>;
    }},
    ...(tab === "active" ? [{
      key: "actions", label: "", render: (s: Record<string, unknown>) => (
        <button
          onClick={(e) => { e.stopPropagation(); terminateSession.mutate(Number(s.id)); }}
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
        >
          Terminate
        </button>
      ),
    }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Session Monitoring</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <KPICard label="Active Sessions" value={stats.active_sessions} accentColor="#4ade80" />
          <KPICard label="Sessions Today" value={stats.sessions_today} />
          <KPICard label="Avg Duration" value={`${Math.round(stats.avg_duration_seconds / 60)}m`} />
          <KPICard label="Socket Connections" value={stats.total_socket_connections} accentColor="#60a5fa" />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {(["active", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
              border: tab === t ? "1px solid rgba(255,59,59,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: tab === t ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "#ff3b3b" : "rgba(255,255,255,0.5)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={(sessions || []) as unknown as Record<string, unknown>[]} />

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Previous</button>
        <span style={{ padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Next</button>
      </div>
    </div>
  );
}
