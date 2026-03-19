"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminUsers, useAdminBanUser, useAdminUnbanUser, useAdminPromoteUser } from "@/hooks/useAdminApi";

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const { data: users, isLoading } = useAdminUsers({ search: search || undefined, is_active: filterActive, page });
  const banUser = useAdminBanUser();
  const unbanUser = useAdminUnbanUser();
  const promoteUser = useAdminPromoteUser();

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "username", label: "Username", render: (u: Record<string, unknown>) => (
      <span style={{ fontWeight: 600, color: "#fff" }}>{String(u.username)}</span>
    )},
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (u: Record<string, unknown>) => (
      <StatusBadge status={u.is_active ? "active" : "banned"} />
    )},
    { key: "is_admin", label: "Role", render: (u: Record<string, unknown>) => (
      <span style={{ fontSize: 12, color: u.is_admin ? "#ff3b3b" : "rgba(255,255,255,0.4)" }}>
        {u.is_admin ? "Admin" : "User"}
      </span>
    )},
    { key: "total_messages", label: "Messages" },
    { key: "total_rooms_hosted", label: "Rooms" },
    { key: "created_at", label: "Joined", render: (u: Record<string, unknown>) => (
      <span>{new Date(String(u.created_at)).toLocaleDateString()}</span>
    )},
    { key: "actions", label: "Actions", render: (u: Record<string, unknown>) => (
      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
        {u.is_active ? (
          <button
            onClick={() => banUser.mutate(Number(u.id))}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, cursor: "pointer" }}
          >
            Ban
          </button>
        ) : (
          <button
            onClick={() => unbanUser.mutate(Number(u.id))}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 11, cursor: "pointer" }}
          >
            Unban
          </button>
        )}
        {!u.is_admin && (
          <button
            onClick={() => promoteUser.mutate(Number(u.id))}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.1)", color: "#ff3b3b", fontSize: 11, cursor: "pointer" }}
          >
            Promote
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
        User Management
      </h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 13,
            width: 300,
            outline: "none",
          }}
        />
        <select
          value={filterActive === undefined ? "all" : filterActive ? "active" : "banned"}
          onChange={(e) => {
            const v = e.target.value;
            setFilterActive(v === "all" ? undefined : v === "active");
            setPage(1);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 13,
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading users...</div>
      ) : (
        <DataTable
          columns={columns}
          data={(users || []) as unknown as Record<string, unknown>[]}
          onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
        />
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
        >
          Previous
        </button>
        <span style={{ padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={(users?.length || 0) < 20}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
