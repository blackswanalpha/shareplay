"use client";

import { use } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KPICard } from "@/components/admin/KPICard";
import { useAdminRoom, useAdminCloseRoom } from "@/hooks/useAdminApi";

export default function AdminRoomDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { data: room, isLoading } = useAdminRoom(code);
  const closeRoom = useAdminCloseRoom();

  if (isLoading) return <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading...</div>;
  if (!room) return <div style={{ color: "#f87171", padding: 40 }}>Room not found</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Link href="/admin/rooms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>&larr; Rooms</Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>{room.name}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", fontFamily: "monospace" }}>{room.code}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusBadge status={room.is_active ? "active" : "closed"} />
          {room.is_active && (
            <button
              onClick={() => closeRoom.mutate(code)}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 13, cursor: "pointer" }}
            >
              Close Room
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <KPICard label="Participants" value={room.participant_count} />
        <KPICard label="Messages" value={room.message_count} />
        <KPICard label="Max Size" value={room.max_participants} />
        <KPICard label="Host" value={room.host_username} />
      </div>

      {/* Participants */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Participants ({room.participants.length})</h3>
        {room.participants.map((p) => (
          <div key={p.user_id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
            <Link href={`/admin/users/${p.user_id}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{p.username}</Link>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{p.role}</span>
              <StatusBadge status={p.is_active ? "online" : "inactive"} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Messages */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>Recent Messages</h3>
        {room.recent_messages.slice(0, 20).map((m) => (
          <div key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{m.username}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)" }}>{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
