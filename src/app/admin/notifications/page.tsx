"use client";

import { useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminSendNotification,
  useAdminBroadcastNotification,
  useAdminNotificationStats,
  useAdminTemplates,
  useAdminCreateTemplate,
  useAdminDeleteTemplate,
} from "@/hooks/useAdminApi";

export default function AdminNotificationsPage() {
  const { data: stats } = useAdminNotificationStats();
  const { data: templates } = useAdminTemplates();
  const sendNotification = useAdminSendNotification();
  const broadcastNotification = useAdminBroadcastNotification();
  const createTemplate = useAdminCreateTemplate();
  const deleteTemplate = useAdminDeleteTemplate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplType, setTplType] = useState("system");
  const [tplTitle, setTplTitle] = useState("");
  const [tplBody, setTplBody] = useState("");

  const handleBroadcast = () => {
    broadcastNotification.mutate({ title, body });
    setTitle("");
    setBody("");
  };

  const handleCreateTemplate = () => {
    createTemplate.mutate({ name: tplName, type: tplType, title_template: tplTitle, body_template: tplBody });
    setShowTemplateForm(false);
    setTplName(""); setTplTitle(""); setTplBody("");
  };

  const templateColumns = [
    { key: "name", label: "Name", render: (t: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(t.name)}</span>
    )},
    { key: "type", label: "Type", render: (t: Record<string, unknown>) => <StatusBadge status={String(t.type)} /> },
    { key: "title_template", label: "Title Template" },
    { key: "actions", label: "", render: (t: Record<string, unknown>) => (
      <button
        onClick={(e) => { e.stopPropagation(); deleteTemplate.mutate(Number(t.id)); }}
        style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
      >
        Delete
      </button>
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Notification Management</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <KPICard label="Total Sent" value={stats.total} />
          <KPICard label="Read" value={stats.read} accentColor="#4ade80" />
          <KPICard label="Unread" value={stats.unread} accentColor="#facc15" />
          <KPICard label="Delivery Rate" value={`${stats.delivery_rate}%`} accentColor="#60a5fa" />
        </div>
      )}

      {/* Send Notification */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Broadcast Notification</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none" }}
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }}
          />
          <button
            onClick={handleBroadcast}
            disabled={!title || !body}
            style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#ff3b3b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start", opacity: !title || !body ? 0.5 : 1 }}
          >
            Send to All Users
          </button>
        </div>
      </div>

      {/* Templates */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Templates</h2>
        <button
          onClick={() => setShowTemplateForm(!showTemplateForm)}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.1)", color: "#ff3b3b", fontSize: 13, cursor: "pointer" }}
        >
          {showTemplateForm ? "Cancel" : "New Template"}
        </button>
      </div>

      {showTemplateForm && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Template Name" value={tplName} onChange={(e) => setTplName(e.target.value)} style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none" }} />
            <select value={tplType} onChange={(e) => setTplType(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13 }}>
              <option value="system">System</option>
              <option value="alert">Alert</option>
              <option value="announcement">Announcement</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <input placeholder="Title Template" value={tplTitle} onChange={(e) => setTplTitle(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none" }} />
          <textarea placeholder="Body Template" value={tplBody} onChange={(e) => setTplBody(e.target.value)} rows={3} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }} />
          <button onClick={handleCreateTemplate} disabled={!tplName || !tplTitle || !tplBody} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#ff3b3b", color: "#fff", fontSize: 13, cursor: "pointer", alignSelf: "flex-start" }}>Create</button>
        </div>
      )}

      <DataTable columns={templateColumns} data={(templates || []) as unknown as Record<string, unknown>[]} />
    </div>
  );
}
