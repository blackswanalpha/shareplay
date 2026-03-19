"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminReports, useAdminResolveReport, useAdminDismissReport, useAdminModerationStats } from "@/hooks/useAdminApi";

export default function AdminModerationPage() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const { data: reports, isLoading } = useAdminReports({ status: statusFilter || undefined, page });
  const { data: stats } = useAdminModerationStats();
  const resolveReport = useAdminResolveReport();
  const dismissReport = useAdminDismissReport();

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "reporter_username", label: "Reporter" },
    { key: "reported_username", label: "Reported", render: (r: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#f87171" }}>{String(r.reported_username)}</span>
    )},
    { key: "reason", label: "Reason", render: (r: Record<string, unknown>) => <StatusBadge status={String(r.reason)} /> },
    { key: "status", label: "Status", render: (r: Record<string, unknown>) => <StatusBadge status={String(r.status)} /> },
    { key: "created_at", label: "Filed", render: (r: Record<string, unknown>) => (
      <span>{new Date(String(r.created_at)).toLocaleDateString()}</span>
    )},
    { key: "actions", label: "Actions", render: (r: Record<string, unknown>) => (
      r.status === "pending" ? (
        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => resolveReport.mutate({ id: Number(r.id), data: { resolution: "warn" } })}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(250,204,21,0.3)", background: "rgba(250,204,21,0.1)", color: "#facc15", fontSize: 11, cursor: "pointer" }}
          >
            Warn
          </button>
          <button
            onClick={() => resolveReport.mutate({ id: Number(r.id), data: { resolution: "ban" } })}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
          >
            Ban
          </button>
          <button
            onClick={() => dismissReport.mutate(Number(r.id))}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}
          >
            Dismiss
          </button>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{String(r.resolution || "—")}</span>
      )
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Content Moderation</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <KPICard label="Total Reports" value={stats.total} />
          <KPICard label="Pending" value={stats.pending} accentColor="#facc15" />
          <KPICard label="Resolved" value={stats.resolved} accentColor="#4ade80" />
          <KPICard label="Dismissed" value={stats.dismissed} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "resolved", "dismissed", ""].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: statusFilter === s ? "1px solid rgba(255,59,59,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: statusFilter === s ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
              color: statusFilter === s ? "#ff3b3b" : "rgba(255,255,255,0.5)",
            }}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading reports...</div>
      ) : (
        <DataTable columns={columns} data={(reports || []) as unknown as Record<string, unknown>[]} />
      )}
    </div>
  );
}
