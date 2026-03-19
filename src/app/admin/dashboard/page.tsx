"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { KPICard } from "@/components/admin/KPICard";
import { ActivityChart } from "@/components/admin/dashboard/ActivityChart";
import { SystemStatus } from "@/components/admin/dashboard/SystemStatus";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { useAdminDashboard } from "@/hooks/useAdminApi";
import {
  Users,
  Monitor,
  ChatCircle,
  Clock,
  ShieldWarning,
  UserMinus,
  Pulse,
} from "@phosphor-icons/react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();
  const headerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.45 }
      );
    }
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 },
        "-=0.2"
      );
    }
    if (dividerRef.current) {
      tl.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        "-=0.15"
      );
    }

    return () => { tl.kill(); };
  }, []);

  if (isLoading || !data) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        gap: 12,
      }}>
        <div style={{
          width: 20,
          height: 20,
          border: "2px solid rgba(255,59,59,0.2)",
          borderTopColor: "#ff3b3b",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
          Loading dashboard...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const d = data;
  const watchHours = Math.round(d.total_watch_time_seconds / 3600);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1280 }}>
      {/* Header */}
      <div>
        <div
          ref={headerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            opacity: 0,
          }}
        >
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              margin: 0,
              color: "#f5f5f5",
              letterSpacing: "-0.02em",
            }}>
              Dashboard
            </h1>
            <p
              ref={subtitleRef}
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                margin: "6px 0 0",
                fontFamily: "'Inter', sans-serif",
                opacity: 0,
              }}
            >
              {greeting}. Here&apos;s what&apos;s happening with <span style={{ color: "#ff3b3b", fontWeight: 500 }}>SharePlay</span> today.
            </p>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.15)",
          }}>
            <Pulse size={14} color="#4ade80" weight="bold" />
            <span style={{
              fontSize: 12,
              color: "#4ade80",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              LIVE
            </span>
          </div>
        </div>
        <div
          ref={dividerRef}
          style={{
            height: 1,
            marginTop: 20,
            background: "linear-gradient(to right, rgba(255,59,59,0.3), rgba(255,255,255,0.06), transparent)",
            transformOrigin: "left",
          }}
        />
      </div>

      {/* KPI Cards — Primary Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}>
        <style>{`
          @media (max-width: 1024px) {
            .admin-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 640px) {
            .admin-kpi-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <KPICard
          label="Total Users"
          value={d.total_users}
          subtitle={`+${d.users_today} today`}
          icon={<Users size={20} weight="duotone" />}
          index={0}
        />
        <KPICard
          label="Active Users"
          value={d.active_users}
          icon={<Users size={20} weight="duotone" />}
          accentColor="#4ade80"
          index={1}
        />
        <KPICard
          label="Total Rooms"
          value={d.total_rooms}
          subtitle={`+${d.rooms_today} today`}
          icon={<Monitor size={20} weight="duotone" />}
          accentColor="#60a5fa"
          index={2}
        />
        <KPICard
          label="Active Rooms"
          value={d.active_rooms}
          icon={<Monitor size={20} weight="duotone" />}
          accentColor="#818cf8"
          index={3}
        />
      </div>

      {/* KPI Cards — Secondary Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}>
        <KPICard
          label="Messages"
          value={d.total_messages}
          subtitle={`+${d.messages_today} today`}
          icon={<ChatCircle size={20} weight="duotone" />}
          accentColor="#a78bfa"
          index={4}
        />
        <KPICard
          label="Watch Time"
          value={`${watchHours.toLocaleString()}h`}
          icon={<Clock size={20} weight="duotone" />}
          accentColor="#fb923c"
          index={5}
        />
        <KPICard
          label="Banned Users"
          value={d.banned_users}
          icon={<UserMinus size={20} weight="duotone" />}
          accentColor="#f87171"
          index={6}
        />
        <KPICard
          label="Pending Reports"
          value={d.pending_reports}
          icon={<ShieldWarning size={20} weight="duotone" />}
          accentColor="#facc15"
          index={7}
        />
      </div>

      {/* Charts Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
      }}>
        <style>{`
          @media (max-width: 860px) {
            .admin-charts-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <ActivityChart
          title="User Growth"
          data={d.user_growth}
          gradient={["#ff3b3b", "#ff6b6b"]}
          delay={0.5}
        />
        <ActivityChart
          title="Room Activity"
          data={d.room_activity}
          gradient={["#60a5fa", "#93c5fd"]}
          delay={0.6}
        />
      </div>

      {/* Message Activity — Full Width */}
      <ActivityChart
        title="Message Activity"
        data={d.message_activity}
        gradient={["#a78bfa", "#c4b5fd"]}
        delay={0.7}
      />

      {/* Bottom Row: System Status + Quick Actions + Today's Activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14,
      }}>
        <style>{`
          @media (max-width: 1024px) {
            .admin-bottom-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <SystemStatus
          activeRooms={d.active_rooms}
          activeUsers={d.active_users}
          delay={0.8}
        />
        <QuickActions
          delay={0.9}
          pendingReports={d.pending_reports}
        />
        <RecentActivity
          usersToday={d.users_today}
          roomsToday={d.rooms_today}
          messagesToday={d.messages_today}
          pendingReports={d.pending_reports}
          delay={1.0}
        />
      </div>

      {/* Footer timestamp */}
      <div style={{
        textAlign: "center",
        padding: "8px 0 4px",
        fontSize: 11,
        color: "rgba(255,255,255,0.15)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Auto-refreshes every 30s &middot; Last updated {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
