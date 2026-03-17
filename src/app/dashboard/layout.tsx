"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { useAtomValue } from "jotai";
import { serviceStatusAtom } from "@/store/roomAtoms";

const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
  low: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)", text: "#93c5fd" },
  normal: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#93c5fd" },
  high: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#fcd34d" },
  critical: { bg: "rgba(239, 68, 68, 0.18)", border: "rgba(239, 68, 68, 0.5)", text: "#fca5a5" },
};

function ServiceStatusBanner() {
  const serviceStatus = useAtomValue(serviceStatusAtom);
  if (!serviceStatus) return null;

  const style = priorityColors[serviceStatus.priority] || priorityColors.high;

  return (
    <div
      style={{
        background: style.bg,
        borderBottom: `1px solid ${style.border}`,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: style.text, fontWeight: 600, flexShrink: 0 }}>
        {serviceStatus.title}
      </span>
      <span style={{ color: "rgba(255,255,255,0.7)" }}>
        {serviceStatus.body}
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthGuard();
  useServiceStatus();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ServiceStatusBanner />
      {children}
    </>
  );
}
