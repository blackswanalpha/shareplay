"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { User } from "@/lib/types";

interface DashboardHeaderProps {
  user: User;
  unreadCount: number;
  onOpenCommandPalette: () => void;
}

export function DashboardHeader({
  user,
  unreadCount,
  onOpenCommandPalette,
}: DashboardHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <Link href="/dashboard" style={{ textDecoration: "none" }}>
        <Logo size="sm" />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onOpenCommandPalette}
          aria-label="Search (Cmd+K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            color: "#555",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "var(--font-inter), sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <MagnifyingGlass size={16} />
          <span style={{ marginRight: 16 }}>Search...</span>
          <kbd
            style={{
              padding: "2px 6px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 4,
              fontSize: 11,
              fontFamily: "var(--font-mono), monospace",
              color: "#666",
            }}
          >
            {"\u2318"}K
          </kbd>
        </button>
        <NotificationBell unreadCount={unreadCount} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
