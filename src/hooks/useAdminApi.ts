"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetDashboard,
  adminGetUsers,
  adminGetUser,
  adminBanUser,
  adminUnbanUser,
  adminPromoteUser,
  adminResetPassword,
  adminGetRooms,
  adminGetRoom,
  adminCloseRoom,
  adminGetReports,
  adminResolveReport,
  adminDismissReport,
  adminGetModerationStats,
  adminGetUserGrowth,
  adminGetRoomTrends,
  adminGetEngagement,
  adminGetRetention,
  adminGetAlerts,
  adminAcknowledgeAlert,
  adminResolveAlert,
  adminGetAlertRules,
  adminCreateAlertRule,
  adminUpdateAlertRule,
  adminDeleteAlertRule,
  adminGetAlertStats,
  adminGetActiveSessions,
  adminGetSessionStats,
  adminGetSessionHistory,
  adminTerminateSession,
  adminGetSettings,
  adminUpdateSetting,
  adminGetFeatureFlags,
  adminUpdateFeatureFlags,
  adminToggleMaintenance,
  adminSendNotification,
  adminBroadcastNotification,
  adminGetNotificationStats,
  adminGetTemplates,
  adminCreateTemplate,
  adminUpdateTemplate,
  adminDeleteTemplate,
  adminGetAuditLogs,
  adminGetAuditStats,
  adminGetRetentionDashboard,
  adminGetRetentionScores,
  adminGetReactionLeaderboard,
  adminTriggerCampaign,
  adminRecomputeScore,
  adminUpdateRetentionSettings,
} from "@/lib/adminApi";

// --- Dashboard ---
export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminGetDashboard,
    refetchInterval: 30000,
  });
}

// --- Users ---
export function useAdminUsers(params?: { search?: string; is_active?: boolean; is_admin?: boolean; page?: number }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminGetUsers(params),
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminGetUser(id),
    enabled: id > 0,
  });
}

export function useAdminBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminBanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminUnbanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminPromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminPromoteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (id: number) => adminResetPassword(id),
  });
}

// --- Rooms ---
export function useAdminRooms(params?: { search?: string; is_active?: boolean; page?: number }) {
  return useQuery({
    queryKey: ["admin", "rooms", params],
    queryFn: () => adminGetRooms(params),
  });
}

export function useAdminRoom(code: string) {
  return useQuery({
    queryKey: ["admin", "rooms", code],
    queryFn: () => adminGetRoom(code),
    enabled: !!code,
  });
}

export function useAdminCloseRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => adminCloseRoom(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "rooms"] }),
  });
}

// --- Moderation ---
export function useAdminReports(params?: { status?: string; reason?: string; page?: number }) {
  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => adminGetReports(params),
  });
}

export function useAdminResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { resolution: string; note?: string } }) =>
      adminResolveReport(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });
}

export function useAdminDismissReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDismissReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });
}

export function useAdminModerationStats() {
  return useQuery({
    queryKey: ["admin", "moderation-stats"],
    queryFn: adminGetModerationStats,
  });
}

// --- Analytics ---
export function useAdminUserGrowth(period = "30d") {
  return useQuery({
    queryKey: ["admin", "user-growth", period],
    queryFn: () => adminGetUserGrowth(period),
  });
}

export function useAdminRoomTrends(period = "30d") {
  return useQuery({
    queryKey: ["admin", "room-trends", period],
    queryFn: () => adminGetRoomTrends(period),
  });
}

export function useAdminEngagement() {
  return useQuery({
    queryKey: ["admin", "engagement"],
    queryFn: adminGetEngagement,
  });
}

export function useAdminRetention() {
  return useQuery({
    queryKey: ["admin", "retention"],
    queryFn: adminGetRetention,
  });
}

// --- Alerts ---
export function useAdminAlerts(params?: { status?: string; category?: string; priority?: string }) {
  return useQuery({
    queryKey: ["admin", "alerts", params],
    queryFn: () => adminGetAlerts(params),
  });
}

export function useAdminAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => adminAcknowledgeAlert(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "alerts"] }),
  });
}

export function useAdminResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => adminResolveAlert(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "alerts"] }),
  });
}

export function useAdminAlertRules() {
  return useQuery({
    queryKey: ["admin", "alert-rules"],
    queryFn: adminGetAlertRules,
  });
}

export function useAdminCreateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminCreateAlertRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "alert-rules"] }),
  });
}

export function useAdminUpdateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminUpdateAlertRule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "alert-rules"] }),
  });
}

export function useAdminDeleteAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDeleteAlertRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "alert-rules"] }),
  });
}

export function useAdminAlertStats() {
  return useQuery({
    queryKey: ["admin", "alert-stats"],
    queryFn: adminGetAlertStats,
  });
}

// --- Sessions ---
export function useAdminActiveSessions(page = 1) {
  return useQuery({
    queryKey: ["admin", "active-sessions", page],
    queryFn: () => adminGetActiveSessions(page),
    refetchInterval: 10000,
  });
}

export function useAdminSessionStats() {
  return useQuery({
    queryKey: ["admin", "session-stats"],
    queryFn: adminGetSessionStats,
    refetchInterval: 10000,
  });
}

export function useAdminSessionHistory(params?: { user_id?: number; page?: number }) {
  return useQuery({
    queryKey: ["admin", "session-history", params],
    queryFn: () => adminGetSessionHistory(params),
  });
}

export function useAdminTerminateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminTerminateSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "active-sessions"] });
      qc.invalidateQueries({ queryKey: ["admin", "session-stats"] });
    },
  });
}

// --- Settings ---
export function useAdminSettings(category?: string) {
  return useQuery({
    queryKey: ["admin", "settings", category],
    queryFn: () => adminGetSettings(category),
  });
}

export function useAdminUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: { value: unknown; description?: string } }) =>
      adminUpdateSetting(key, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: adminGetFeatureFlags,
  });
}

export function useAdminUpdateFeatureFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: Record<string, boolean>) => adminUpdateFeatureFlags(flags),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useAdminToggleMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminToggleMaintenance(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}

// --- Notifications ---
export function useAdminSendNotification() {
  return useMutation({
    mutationFn: (data: { title: string; body: string; type?: string; target_user_ids?: number[] }) =>
      adminSendNotification(data),
  });
}

export function useAdminBroadcastNotification() {
  return useMutation({
    mutationFn: (data: { title: string; body: string }) => adminBroadcastNotification(data),
  });
}

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: ["admin", "notification-stats"],
    queryFn: adminGetNotificationStats,
  });
}

export function useAdminTemplates() {
  return useQuery({
    queryKey: ["admin", "templates"],
    queryFn: adminGetTemplates,
  });
}

export function useAdminCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: string; title_template: string; body_template: string; variables?: string[] }) =>
      adminCreateTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });
}

export function useAdminUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; type: string; title_template: string; body_template: string; variables?: string[] } }) =>
      adminUpdateTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });
}

export function useAdminDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDeleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });
}

// --- Audit ---
export function useAdminAuditLogs(params?: { action?: string; entity_type?: string; actor_id?: number; page?: number }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminGetAuditLogs(params),
  });
}

export function useAdminAuditStats() {
  return useQuery({
    queryKey: ["admin", "audit-stats"],
    queryFn: adminGetAuditStats,
  });
}

// --- Retention ---
export function useAdminRetentionDashboard() {
  return useQuery({
    queryKey: ["admin", "retention-dashboard"],
    queryFn: adminGetRetentionDashboard,
    refetchInterval: 30000,
  });
}

export function useAdminRetentionScores(params?: { risk_level?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["admin", "retention-scores", params],
    queryFn: () => adminGetRetentionScores(params),
  });
}

export function useAdminRetentionLeaderboard(params?: { period?: string; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "retention-leaderboard", params],
    queryFn: () => adminGetReactionLeaderboard(params),
  });
}

export function useAdminTriggerCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaign_type: string; user_ids?: number[] }) => adminTriggerCampaign(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "retention-dashboard"] }),
  });
}

export function useAdminRecomputeScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminRecomputeScore(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "retention-scores"] });
      qc.invalidateQueries({ queryKey: ["admin", "retention-dashboard"] });
    },
  });
}

export function useAdminUpdateRetentionSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { enabled?: boolean }) => adminUpdateRetentionSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "retention-dashboard"] }),
  });
}
