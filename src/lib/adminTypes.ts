// Admin portal TypeScript types

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_email_verified: boolean;
  created_at: string;
  total_sessions: number;
  total_messages: number;
  total_rooms_hosted: number;
}

export interface AdminUserDetail extends AdminUser {
  recent_rooms: Array<{ id: number; code: string; name: string; is_active: boolean; created_at: string }>;
  recent_sessions: Array<{ id: number; room_id: number; joined_at: string; left_at: string | null; duration_seconds: number | null }>;
}

export interface AdminRoom {
  id: number;
  code: string;
  name: string;
  host_id: number;
  host_username: string;
  is_active: boolean;
  max_participants: number;
  participant_count: number;
  message_count: number;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface AdminRoomDetail extends AdminRoom {
  participants: Array<{ user_id: number; username: string; role: string; is_active: boolean; joined_at: string }>;
  recent_messages: Array<{ id: number; user_id: number; username: string; content: string; created_at: string }>;
}

export interface ContentReport {
  id: number;
  reporter_id: number;
  reporter_username: string;
  reported_user_id: number;
  reported_username: string;
  message_id: number | null;
  room_id: number | null;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: number | null;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  type: string;
  title_template: string;
  body_template: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: number;
  actor_id: number;
  actor_username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AuditStats {
  total: number;
  by_action: Record<string, number>;
  by_entity_type: Record<string, number>;
  by_actor: Record<string, number>;
}

export interface AdminSession {
  id: number;
  user_id: number;
  username: string;
  room_id: number;
  room_code: string;
  room_name: string;
  joined_at: string;
  left_at: string | null;
  duration_seconds: number | null;
}

export interface AdminDashboard {
  total_rooms: number;
  active_rooms: number;
  total_users: number;
  active_users: number;
  total_messages: number;
  total_watch_time_seconds: number;
  banned_users: number;
  pending_reports: number;
  users_today: number;
  rooms_today: number;
  messages_today: number;
  user_growth: Array<{ date: string; count: number }>;
  room_activity: Array<{ date: string; count: number }>;
  message_activity: Array<{ date: string; count: number }>;
}

export interface EngagementMetrics {
  dau: number;
  wau: number;
  mau: number;
  avg_session_minutes: number;
  messages_per_user: number;
}

export interface UserGrowthData {
  period: string;
  data: Array<{ date: string; count: number }>;
}

export interface AlertRule {
  id: number;
  name: string;
  description: string | null;
  category: string;
  condition_type: string;
  condition_config: Record<string, unknown>;
  priority: string;
  is_enabled: boolean;
  cooldown_seconds: number;
  escalation_config: Record<string, unknown>;
  target_scope: string;
  target_id: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  rule_id: number | null;
  category: string;
  priority: string;
  status: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  target_user_id: number | null;
  room_code: string | null;
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  snoozed_until: string | null;
  escalated_at: string | null;
  escalated_priority: string | null;
  dedup_key: string | null;
  email_sent: boolean;
  created_at: string;
}

export interface AlertStats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
}

export interface SessionStats {
  active_sessions: number;
  sessions_today: number;
  avg_duration_seconds: number;
  total_socket_connections: number;
}

export interface ModerationStats {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  delivery_rate: number;
}

// --- Retention Engine ---

export interface RetentionDashboard {
  risk_distribution: Record<string, number>;
  avg_score: number;
  total_scored_users: number;
  active_streaks: number;
  total_achievements: number;
  campaign_stats: Record<string, number>;
  top_reactors: LeaderboardEntry[];
  score_trend: Array<{ date: string; avg_score: number }>;
}

export interface EngagementScore {
  user_id: number;
  username: string;
  score: number;
  risk_level: string;
  components?: Record<string, number>;
  last_active_at: string | null;
  last_scored_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  total_reactions: number;
  weekly_reactions: number;
}

export interface UserStreak {
  user_id: number;
  username: string;
  current_login_streak: number;
  longest_login_streak: number;
  current_activity_streak: number;
  longest_activity_streak: number;
  last_login_date: string | null;
  last_activity_date: string | null;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_key: string;
  achievement_name: string;
  description: string | null;
  icon: string | null;
  category: string;
  earned_at: string;
}

export interface ReengagementLog {
  id: number;
  user_id: number;
  username: string;
  campaign_type: string;
  channel: string;
  status: string;
  metadata: Record<string, unknown>;
  sent_at: string;
}

// --- Campaign Templates ---

export interface CampaignTemplate {
  id: number;
  name: string;
  subject: string;
  body_template: string;
  target_filter: Record<string, unknown>;
  channel: string;
  schedule_cron: string | null;
  is_active: boolean;
  send_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  template_id: number;
  name: string;
  send_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
}
