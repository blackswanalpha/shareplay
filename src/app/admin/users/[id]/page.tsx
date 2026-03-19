"use client";

import { use } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminUser, useAdminBanUser, useAdminUnbanUser, useAdminPromoteUser, useAdminResetPassword } from "@/hooks/useAdminApi";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = parseInt(id);
  const { data: user, isLoading } = useAdminUser(userId);
  const banUser = useAdminBanUser();
  const unbanUser = useAdminUnbanUser();
  const promoteUser = useAdminPromoteUser();
  const resetPassword = useAdminResetPassword();

  if (isLoading) return <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading...</div>;
  if (!user) return <div style={{ color: "#f87171", padding: 40 }}>User not found</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin/users" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>
          &larr; Users
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            {user.username}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <StatusBadge status={user.is_active ? "active" : "banned"} />
          {user.is_admin && <StatusBadge status="Admin" />}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <KPICard label="Sessions" value={user.total_sessions} />
        <KPICard label="Messages" value={user.total_messages} />
        <KPICard label="Rooms Hosted" value={user.total_rooms_hosted} />
        <KPICard label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
      </div>

      {/* Actions */}
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 8,
        }}
      >
        {user.is_active ? (
          <button
            onClick={() => banUser.mutate(userId)}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 13, cursor: "pointer" }}
          >
            Ban User
          </button>
        ) : (
          <button
            onClick={() => unbanUser.mutate(userId)}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 13, cursor: "pointer" }}
          >
            Unban User
          </button>
        )}
        {!user.is_admin && (
          <button
            onClick={() => promoteUser.mutate(userId)}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.1)", color: "#ff3b3b", fontSize: 13, cursor: "pointer" }}
          >
            Promote to Admin
          </button>
        )}
        <button
          onClick={() => resetPassword.mutate(userId)}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}
        >
          Reset Password
        </button>
      </div>

      {/* Recent Rooms */}
      {user.recent_rooms.length > 0 && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Recent Rooms</h3>
          {user.recent_rooms.map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <Link href={`/admin/rooms/${r.code}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 13 }}>{r.name}</Link>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{r.code}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Sessions */}
      {user.recent_sessions.length > 0 && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Recent Sessions</h3>
          {user.recent_sessions.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{new Date(s.joined_at).toLocaleString()}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>
                {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : "ongoing"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
