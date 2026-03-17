"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import {
  useNotifications,
  useUnreadCount,
  useRooms,
  useFriends,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useApi";
import type { Notification } from "@/lib/types";

const DashboardHeader = dynamic(
  () => import("@/components/dashboard/DashboardHeader").then((m) => m.DashboardHeader),
  { ssr: false }
);

const CommandPalette = dynamic(
  () => import("@/components/ui/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

const NotificationCard = dynamic(
  () => import("./NotificationCard").then((m) => m.NotificationCard),
  { ssr: false }
);

interface NotificationGroup {
  label: string;
  items: Notification[];
}

function groupByDay(notifications: Notification[]): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: Record<string, Notification[]> = {};
  const order: string[] = [];

  for (const n of notifications) {
    const d = new Date(n.created_at);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;

    if (day.getTime() === today.getTime()) {
      label = "Today";
    } else if (day.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      const diff = Math.floor((today.getTime() - day.getTime()) / 86400000);
      label = `${diff} days ago`;
    }

    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(n);
  }

  return order.map((label) => ({ label, items: groups[label] }));
}

export function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: rooms = [] } = useRooms();
  const { data: friends = [] } = useFriends();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [cmdkOpen, setCmdkOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleOpenCmdk = useCallback(() => setCmdkOpen(true), []);
  const handleCloseCmdk = useCallback(() => setCmdkOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
      if (e.key === "Escape" && cmdkOpen) {
        setCmdkOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cmdkOpen]);

  const localUnread = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const grouped = useMemo(() => groupByDay(notifications), [notifications]);

  function handleMarkRead(id: string) {
    markRead.mutate(Number(id));
  }

  function handleMarkAllRead() {
    markAllRead.mutate();
  }

  let animIndex = 0;

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        onOpenCommandPalette={handleOpenCmdk}
      />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#f5f5f5",
            }}
          >
            Notifications
            {localUnread > 0 && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#888",
                  marginLeft: 8,
                }}
              >
                ({localUnread} unread)
              </span>
            )}
          </h1>

          {localUnread > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "var(--font-inter), sans-serif",
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: "#ff3b3b",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Mark All Read
            </button>
          )}
        </div>

        {grouped.map((group) => (
          <div key={group.label} style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#555",
                marginBottom: 12,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.items.map((notification) => {
                const idx = animIndex++;
                return (
                  <motion.div
                    key={notification.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                  >
                    <NotificationCard
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <CommandPalette
        open={cmdkOpen}
        onClose={handleCloseCmdk}
        rooms={rooms}
        friends={friends}
      />
    </div>
  );
}
