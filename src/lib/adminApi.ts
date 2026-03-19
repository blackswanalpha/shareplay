import { apiFetch } from "./api";
import type {
  AdminUser,
  AdminUserDetail,
  AdminRoom,
  AdminRoomDetail,
  ContentReport,
  SystemSetting,
  NotificationTemplate,
  AuditLogEntry,
  AuditStats,
  AdminSession,
  AdminDashboard,
  EngagementMetrics,
  UserGrowthData,
  Alert,
  AlertRule,
  AlertStats,
  SessionStats,
  ModerationStats,
  NotificationStats,
  RetentionDashboard,
  EngagementScore,
  LeaderboardEntry,
  ReengagementLog,
} from "./adminTypes";

// --- Dashboard ---
export const adminGetDashboard = () =>
  apiFetch<AdminDashboard>("/admin/dashboard/extended");

// --- Users ---
export const adminGetUsers = (params?: { search?: string; is_active?: boolean; is_admin?: boolean; page?: number; per_page?: number }) => {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.is_active !== undefined) q.set("is_active", String(params.is_active));
  if (params?.is_admin !== undefined) q.set("is_admin", String(params.is_admin));
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  return apiFetch<AdminUser[]>(`/admin/users?${q.toString()}`);
};

export const adminGetUser = (id: number) =>
  apiFetch<AdminUserDetail>(`/admin/users/${id}`);

export const adminBanUser = (id: number) =>
  apiFetch<{ message: string }>(`/admin/users/${id}/ban`, { method: "PUT" });

export const adminUnbanUser = (id: number) =>
  apiFetch<{ message: string }>(`/admin/users/${id}/unban`, { method: "PUT" });

export const adminPromoteUser = (id: number) =>
  apiFetch<{ message: string }>(`/admin/users/${id}/promote`, { method: "PUT" });

export const adminResetPassword = (id: number) =>
  apiFetch<{ message: string }>(`/admin/users/${id}/reset-password`, { method: "PUT" });

export const adminGetUserActivity = (id: number) =>
  apiFetch<{ sessions: Array<Record<string, unknown>>; messages: Array<Record<string, unknown>> }>(`/admin/users/${id}/activity`);

// --- Rooms ---
export const adminGetRooms = (params?: { search?: string; is_active?: boolean; page?: number; per_page?: number }) => {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.is_active !== undefined) q.set("is_active", String(params.is_active));
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  return apiFetch<AdminRoom[]>(`/admin/rooms?${q.toString()}`);
};

export const adminGetRoom = (code: string) =>
  apiFetch<AdminRoomDetail>(`/admin/rooms/${code}`);

export const adminCloseRoom = (code: string) =>
  apiFetch<{ message: string }>(`/admin/rooms/${code}/close`, { method: "PUT" });

// --- Moderation ---
export const adminGetReports = (params?: { status?: string; reason?: string; page?: number }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.reason) q.set("reason", params.reason);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<ContentReport[]>(`/admin/moderation/reports?${q.toString()}`);
};

export const adminGetReport = (id: number) =>
  apiFetch<ContentReport>(`/admin/moderation/reports/${id}`);

export const adminResolveReport = (id: number, data: { resolution: string; note?: string }) =>
  apiFetch<{ message: string }>(`/admin/moderation/reports/${id}/resolve`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const adminDismissReport = (id: number) =>
  apiFetch<{ message: string }>(`/admin/moderation/reports/${id}/dismiss`, { method: "PUT" });

export const adminGetModerationStats = () =>
  apiFetch<ModerationStats>("/admin/moderation/stats");

// --- Analytics ---
export const adminGetUserGrowth = (period = "30d") =>
  apiFetch<UserGrowthData>(`/admin/analytics/user-growth?period=${period}`);

export const adminGetRoomTrends = (period = "30d") =>
  apiFetch<{ period: string; data: Array<{ date: string; count: number }> }>(`/admin/analytics/room-trends?period=${period}`);

export const adminGetEngagement = () =>
  apiFetch<EngagementMetrics>("/admin/analytics/engagement");

export const adminGetRetention = () =>
  apiFetch<{ cohorts: Array<Record<string, unknown>> }>("/admin/analytics/retention");

export const adminExportCsv = (type: string) =>
  apiFetch<Blob>(`/admin/analytics/export?type=${type}`);

// --- Alerts (reuse existing endpoints) ---
export const adminGetAlerts = (params?: { status?: string; category?: string; priority?: string }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.category) q.set("category", params.category);
  if (params?.priority) q.set("priority", params.priority);
  return apiFetch<Alert[]>(`/alerts/?${q.toString()}`);
};

export const adminAcknowledgeAlert = (id: number, note?: string) =>
  apiFetch<Alert>(`/alerts/${id}/acknowledge`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });

export const adminResolveAlert = (id: number, note?: string) =>
  apiFetch<Alert>(`/alerts/${id}/resolve`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });

export const adminGetAlertRules = () =>
  apiFetch<AlertRule[]>("/alerts/rules");

export const adminCreateAlertRule = (data: Partial<AlertRule>) =>
  apiFetch<AlertRule>("/alerts/rules", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminUpdateAlertRule = (id: number, data: Partial<AlertRule>) =>
  apiFetch<AlertRule>(`/alerts/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const adminDeleteAlertRule = (id: number) =>
  apiFetch<void>(`/alerts/rules/${id}`, { method: "DELETE" });

export const adminGetAlertStats = () =>
  apiFetch<AlertStats>("/alerts/stats");

// --- Sessions ---
export const adminGetActiveSessions = (page = 1) =>
  apiFetch<AdminSession[]>(`/admin/sessions/active?page=${page}`);

export const adminGetSessionStats = () =>
  apiFetch<SessionStats>("/admin/sessions/stats");

export const adminGetSessionHistory = (params?: { user_id?: number; page?: number }) => {
  const q = new URLSearchParams();
  if (params?.user_id) q.set("user_id", String(params.user_id));
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<AdminSession[]>(`/admin/sessions/history?${q.toString()}`);
};

export const adminTerminateSession = (id: number) =>
  apiFetch<{ message: string }>(`/admin/sessions/terminate/${id}`, { method: "POST" });

// --- Settings ---
export const adminGetSettings = (category?: string) => {
  const q = category ? `?category=${category}` : "";
  return apiFetch<SystemSetting[]>(`/admin/settings${q}`);
};

export const adminUpdateSetting = (key: string, data: { value: unknown; description?: string }) =>
  apiFetch<SystemSetting>(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const adminGetFeatureFlags = () =>
  apiFetch<Record<string, boolean>>("/admin/settings/feature-flags/all");

export const adminUpdateFeatureFlags = (flags: Record<string, boolean>) =>
  apiFetch<{ message: string }>("/admin/settings/feature-flags/all", {
    method: "PUT",
    body: JSON.stringify({ flags }),
  });

export const adminToggleMaintenance = () =>
  apiFetch<{ message: string }>("/admin/settings/maintenance/toggle", { method: "PUT" });

// --- Notifications ---
export const adminSendNotification = (data: { title: string; body: string; type?: string; target_user_ids?: number[] }) =>
  apiFetch<{ message: string }>("/admin/notifications/send", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminBroadcastNotification = (data: { title: string; body: string }) =>
  apiFetch<{ message: string }>("/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminGetNotificationStats = () =>
  apiFetch<NotificationStats>("/admin/notifications/stats");

export const adminGetTemplates = () =>
  apiFetch<NotificationTemplate[]>("/admin/notifications/templates");

export const adminCreateTemplate = (data: { name: string; type: string; title_template: string; body_template: string; variables?: string[] }) =>
  apiFetch<NotificationTemplate>("/admin/notifications/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminUpdateTemplate = (id: number, data: { name: string; type: string; title_template: string; body_template: string; variables?: string[] }) =>
  apiFetch<NotificationTemplate>(`/admin/notifications/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const adminDeleteTemplate = (id: number) =>
  apiFetch<{ message: string }>(`/admin/notifications/templates/${id}`, { method: "DELETE" });

// --- Audit ---
export const adminGetAuditLogs = (params?: { action?: string; entity_type?: string; actor_id?: number; page?: number; per_page?: number }) => {
  const q = new URLSearchParams();
  if (params?.action) q.set("action", params.action);
  if (params?.entity_type) q.set("entity_type", params.entity_type);
  if (params?.actor_id) q.set("actor_id", String(params.actor_id));
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  return apiFetch<AuditLogEntry[]>(`/admin/audit?${q.toString()}`);
};

export const adminGetAuditStats = () =>
  apiFetch<AuditStats>("/admin/audit/stats");

// --- Retention ---
export const adminGetRetentionDashboard = () =>
  apiFetch<RetentionDashboard>("/admin/retention/dashboard");

export const adminGetRetentionScores = (params?: { risk_level?: string; page?: number; per_page?: number }) => {
  const q = new URLSearchParams();
  if (params?.risk_level) q.set("risk_level", params.risk_level);
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  return apiFetch<EngagementScore[]>(`/admin/retention/scores?${q.toString()}`);
};

export const adminGetReactionLeaderboard = (params?: { period?: string; limit?: number }) => {
  const q = new URLSearchParams();
  if (params?.period) q.set("period", params.period);
  if (params?.limit) q.set("limit", String(params.limit));
  return apiFetch<LeaderboardEntry[]>(`/admin/retention/leaderboard/reactions?${q.toString()}`);
};

export const adminGetCampaignLogs = (params?: { campaign_type?: string; page?: number }) => {
  const q = new URLSearchParams();
  if (params?.campaign_type) q.set("campaign_type", params.campaign_type);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<ReengagementLog[]>(`/admin/retention/campaigns?${q.toString()}`);
};

export const adminTriggerCampaign = (data: { campaign_type: string; user_ids?: number[] }) =>
  apiFetch<{ campaign_type: string; users_targeted: number; sent: number; skipped: number }>("/admin/retention/campaigns/trigger", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminRecomputeScore = (userId: number) =>
  apiFetch<EngagementScore>(`/admin/retention/scores/${userId}/recompute`, { method: "POST" });

export const adminUpdateRetentionSettings = (data: { enabled?: boolean }) =>
  apiFetch<{ message: string; enabled: boolean }>("/admin/retention/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
