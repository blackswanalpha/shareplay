"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminAlertRules, useAdminCreateAlertRule, useAdminDeleteAlertRule, useAdminUpdateAlertRule } from "@/hooks/useAdminApi";

export default function AdminAlertRulesPage() {
  const { data: rules, isLoading } = useAdminAlertRules();
  const createRule = useAdminCreateAlertRule();
  const deleteRule = useAdminDeleteAlertRule();
  const updateRule = useAdminUpdateAlertRule();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("system");
  const [conditionType, setConditionType] = useState("");
  const [priority, setPriority] = useState("normal");

  const handleCreate = () => {
    createRule.mutate({
      name,
      category,
      condition_type: conditionType,
      priority,
      condition_config: {},
    });
    setShowForm(false);
    setName("");
    setConditionType("");
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Name", render: (r: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(r.name)}</span>
    )},
    { key: "category", label: "Category", render: (r: Record<string, unknown>) => <StatusBadge status={String(r.category)} /> },
    { key: "priority", label: "Priority", render: (r: Record<string, unknown>) => <StatusBadge status={String(r.priority)} /> },
    { key: "is_enabled", label: "Status", render: (r: Record<string, unknown>) => (
      <StatusBadge status={r.is_enabled ? "enabled" : "inactive"} />
    )},
    { key: "condition_type", label: "Condition" },
    { key: "actions", label: "", render: (r: Record<string, unknown>) => (
      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => updateRule.mutate({ id: Number(r.id), data: { is_enabled: !r.is_enabled } })}
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}
        >
          {r.is_enabled ? "Disable" : "Enable"}
        </button>
        <button
          onClick={() => deleteRule.mutate(Number(r.id))}
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
        >
          Delete
        </button>
      </div>
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/alerts" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>&larr; Alerts</Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Alert Rules</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.1)", color: "#ff3b3b", fontSize: 13, cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "New Rule"}
        </button>
      </div>

      {showForm && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Rule Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, flex: 1 }}>
              <option value="system">System</option>
              <option value="room">Room</option>
              <option value="user">User</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, flex: 1 }}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <input placeholder="Condition Type" value={conditionType} onChange={(e) => setConditionType(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none" }} />
          <button onClick={handleCreate} disabled={!name || !conditionType} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#ff3b3b", color: "#fff", fontSize: 13, cursor: "pointer", alignSelf: "flex-start" }}>
            Create Rule
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading rules...</div>
      ) : (
        <DataTable columns={columns} data={(rules || []) as unknown as Record<string, unknown>[]} />
      )}
    </div>
  );
}
