"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminRooms, useAdminCloseRoom } from "@/hooks/useAdminApi";

export default function AdminRoomsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const { data: rooms, isLoading } = useAdminRooms({ search: search || undefined, is_active: filterActive, page });
  const closeRoom = useAdminCloseRoom();

  const columns = [
    { key: "code", label: "Code", render: (r: Record<string, unknown>) => (
      <span style={{ fontFamily: "monospace", color: "#60a5fa", fontSize: 12 }}>{String(r.code)}</span>
    )},
    { key: "name", label: "Name", render: (r: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(r.name)}</span>
    )},
    { key: "host_username", label: "Host" },
    { key: "status", label: "Status", render: (r: Record<string, unknown>) => (
      <StatusBadge status={r.is_active ? "active" : "closed"} />
    )},
    { key: "participant_count", label: "Participants" },
    { key: "message_count", label: "Messages" },
    { key: "created_at", label: "Created", render: (r: Record<string, unknown>) => (
      <span>{new Date(String(r.created_at)).toLocaleDateString()}</span>
    )},
    { key: "actions", label: "", render: (r: Record<string, unknown>) => (
      r.is_active ? (
        <button
          onClick={(e) => { e.stopPropagation(); closeRoom.mutate(String(r.code)); }}
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
        >
          Close
        </button>
      ) : null
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Room Management</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, width: 300, outline: "none" }}
        />
        <select
          value={filterActive === undefined ? "all" : filterActive ? "active" : "closed"}
          onChange={(e) => { setFilterActive(e.target.value === "all" ? undefined : e.target.value === "active"); setPage(1); }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13 }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading rooms...</div>
      ) : (
        <DataTable
          columns={columns}
          data={(rooms || []) as unknown as Record<string, unknown>[]}
          onRowClick={(r) => router.push(`/admin/rooms/${r.code}`)}
        />
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Previous</button>
        <span style={{ padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={(rooms?.length || 0) < 20} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Next</button>
      </div>
    </div>
  );
}
