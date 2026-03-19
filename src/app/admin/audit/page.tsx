"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminAuditLogs, useAdminAuditStats } from "@/hooks/useAdminApi";

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const { data: logs, isLoading } = useAdminAuditLogs({
    action: actionFilter || undefined,
    entity_type: entityFilter || undefined,
    page,
  });
  const { data: stats } = useAdminAuditStats();

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "actor_username", label: "Actor", render: (l: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(l.actor_username)}</span>
    )},
    { key: "action", label: "Action", render: (l: Record<string, unknown>) => <StatusBadge status={String(l.action)} /> },
    { key: "entity_type", label: "Entity Type" },
    { key: "entity_id", label: "Entity ID", render: (l: Record<string, unknown>) => (
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>{String(l.entity_id || "—")}</span>
    )},
    { key: "ip_address", label: "IP", render: (l: Record<string, unknown>) => (
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{String(l.ip_address || "—")}</span>
    )},
    { key: "created_at", label: "Time", render: (l: Record<string, unknown>) => (
      <span style={{ fontSize: 12 }}>{new Date(String(l.created_at)).toLocaleString()}</span>
    )},
  ];

  const actionOptions = stats ? Object.keys(stats.by_action) : [];
  const entityOptions = stats ? Object.keys(stats.by_entity_type) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Audit Log</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <KPICard label="Total Entries" value={stats.total} />
          <KPICard label="Actions" value={Object.keys(stats.by_action).length} subtitle="distinct types" />
          <KPICard label="Actors" value={Object.keys(stats.by_actor).length} subtitle="admin users" />
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13 }}
        >
          <option value="">All Actions</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13 }}
        >
          <option value="">All Entity Types</option>
          {entityOptions.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading audit logs...</div>
      ) : (
        <DataTable columns={columns} data={(logs || []) as unknown as Record<string, unknown>[]} />
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Previous</button>
        <span style={{ padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={(logs?.length || 0) < 20} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Next</button>
      </div>
    </div>
  );
}
