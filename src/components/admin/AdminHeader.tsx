"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  rooms: "Rooms",
  moderation: "Moderation",
  analytics: "Analytics",
  alerts: "Alerts",
  settings: "Settings",
  sessions: "Sessions",
  notifications: "Notifications",
  audit: "Audit Log",
  rules: "Rules",
};

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.slice(1); // Remove "admin" prefix

  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>}
            <Link
              href={`/admin/${crumbs.slice(0, i + 1).join("/")}`}
              style={{
                color: i === crumbs.length - 1 ? "#fff" : "rgba(255,255,255,0.4)",
                textDecoration: "none",
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
              }}
            >
              {breadcrumbMap[crumb] || crumb}
            </Link>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
          }}
        >
          Back to App
        </Link>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          {user?.username}
        </span>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
