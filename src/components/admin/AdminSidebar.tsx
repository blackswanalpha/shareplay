"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Users,
  Monitor,
  ShieldCheck,
  ChartLine,
  Bell,
  Gear,
  Pulse,
  Megaphone,
  ClockCounterClockwise,
  Heartbeat,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: ChartBar },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/rooms", label: "Rooms", icon: Monitor },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/admin/analytics", label: "Analytics", icon: ChartLine },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Gear },
  { href: "/admin/sessions", label: "Sessions", icon: Pulse },
  { href: "/admin/notifications", label: "Notifications", icon: Megaphone },
  { href: "/admin/audit", label: "Audit Log", icon: ClockCounterClockwise },
  { href: "/admin/retention", label: "Retention", icon: Heartbeat },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div
        style={{
          padding: "0 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 8,
        }}
      >
        <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#ff3b3b",
              letterSpacing: "-0.02em",
            }}
          >
            SharePlay
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginLeft: 8,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Admin
          </span>
        </Link>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(255,59,59,0.12)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} color={isActive ? "#ff3b3b" : "rgba(255,255,255,0.4)"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
