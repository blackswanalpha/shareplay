"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminGuard } from "./AdminGuard";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <AdminHeader />
          <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
