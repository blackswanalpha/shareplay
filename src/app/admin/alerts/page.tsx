"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminAlerts, useAdminAcknowledgeAlert, useAdminResolveAlert, useAdminAlertStats } from "@/hooks/useAdminApi";

export default function AdminAlertsPage() {
  const [tab, setTab] = useState("active");
  const { data: alerts, isLoading } = useAdminAlerts({ status: tab || undefined });
  const { data: stats } = useAdminAlertStats();
  const ackAlert = useAdminAcknowledgeAlert();
  const resolveAlert = useAdminResolveAlert();

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "title", label: "Title", render: (a: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(a.title)}</span>
    )},
    { key: "category", label: "Category", render: (a: Record<string, unknown>) => <StatusBadge status={String(a.category)} /> },
    { key: "priority", label: "Priority", render: (a: Record<string, unknown>) => <StatusBadge status={String(a.priority)} /> },
    { key: "status", label: "Status", render: (a: Record<string, unknown>) => <StatusBadge status={String(a.status)} /> },
    { key: "created_at", label: "Created", render: (a: Record<string, unknown>) => (
      <span style={{ fontSize: 12 }}>{new Date(String(a.created_at)).toLocaleString()}</span>
    )},
    { key: "actions", label: "", render: (a: Record<string, unknown>) => (
      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
        {a.status === "active" && (
          <button onClick={() => ackAlert.mutate({ id: Number(a.id) })} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.1)", color: "#60a5fa", fontSize: 11, cursor: "pointer" }}>
            Acknowledge
          </button>
        )}
        {(a.status === "active" || a.status === "acknowledged") && (
          <button onClick={() => resolveAlert.mutate({ id: Number(a.id) })} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 11, cursor: "pointer" }}>
            Resolve
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Alert Management</h1>
        <Link
          href="/admin/alerts/rules"
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.1)", color: "#ff3b3b", fontSize: 13, textDecoration: "none" }}
        >
          Manage Rules
        </Link>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <KPICard label="Total Alerts" value={stats.total} />
          <KPICard label="Active" value={stats.by_status?.active || 0} accentColor="#f87171" />
          <KPICard label="Acknowledged" value={stats.by_status?.acknowledged || 0} accentColor="#60a5fa" />
          <KPICard label="Resolved" value={stats.by_status?.resolved || 0} accentColor="#4ade80" />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {["active", "acknowledged", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
              border: tab === s ? "1px solid rgba(255,59,59,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: tab === s ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
              color: tab === s ? "#ff3b3b" : "rgba(255,255,255,0.5)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading alerts...</div>
      ) : (
        <DataTable columns={columns} data={(alerts || []) as unknown as Record<string, unknown>[]} />
      )}
    </div>
  );
}
