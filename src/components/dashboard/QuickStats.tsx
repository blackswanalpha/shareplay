"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Monitor, Timer, Users, CalendarBlank } from "@phosphor-icons/react";
import type { DashboardStats } from "@/lib/types";
import type { ReactNode } from "react";

interface QuickStatsProps {
  stats: DashboardStats;
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
}

function StatCard({ icon, label, value, suffix }: StatCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "16px 8px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ color: "#ff3b3b" }}>{icon}</div>
      <div
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: "#f5f5f5",
          lineHeight: 1,
        }}
      >
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#666",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <GlassPanel hoverEffect={false}>
      <h3
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#f5f5f5",
          marginBottom: 16,
        }}
      >
        Your Stats
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <StatCard
          icon={<Monitor size={20} />}
          label="Rooms Created"
          value={stats.total_rooms}
        />
        <StatCard
          icon={<Timer size={20} />}
          label="Hours Watched"
          value={stats.total_hours}
          suffix="h"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Friends"
          value={stats.total_friends}
        />
        <StatCard
          icon={<CalendarBlank size={20} />}
          label="This Week"
          value={stats.weekly_sessions}
        />
      </div>
    </GlassPanel>
  );
}
