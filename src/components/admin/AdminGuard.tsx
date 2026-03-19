"use client";

import type { ReactNode } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#000",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
