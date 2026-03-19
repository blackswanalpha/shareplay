"use client";

import type { ReactNode } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { AdminSkeleton } from "./AdminSkeleton";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminGuard();

  if (isLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
