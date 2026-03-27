export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  is_online: boolean;
  is_admin: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  username: string;
  avatar_url: string;
  is_online: boolean;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  type: "watch" | "music";
  is_live: boolean;
  participants: Participant[];
  max_participants: number;
  created_at: string;
  owner_id: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  status: "online" | "away" | "offline";
  activity?: string;
}

export interface Session {
  id: string;
  room_name: string;
  type: "watch" | "music";
  duration_minutes: number;
  ended_at: string;
}

export interface Invite {
  id: string;
  room_name: string;
  room_code: string;
  inviter: {
    username: string;
    avatar_url: string;
  };
  created_at: string;
}

export interface DashboardStats {
  total_rooms: number;
  total_hours: number;
  total_friends: number;
  weekly_sessions: number;
}

export interface FriendRequest {
  id: string;
  from_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  created_at: string;
  status: "pending" | "accepted" | "declined";
}

export type NotificationType = "invite" | "role" | "mention" | "friend" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  is_read: boolean;
  title: string;
  body: string;
  action_url?: string;
  actor?: {
    username: string;
    avatar_url: string;
  };
  created_at: string;
}

export interface NotificationPreferences {
  room_invites: boolean;
  user_mentions: boolean;
  role_changes: boolean;
  system_alerts: boolean;
  room_ended: boolean;
}

export interface AudioSettings {
  input_device: string;
  output_device: string;
  echo_cancel: boolean;
  noise_suppress: boolean;
  auto_gain: boolean;
}

export type ParticipantRole = "host" | "co-host" | "member";

export interface RoomParticipant extends Participant {
  role: ParticipantRole;
  is_muted: boolean;
  is_speaking: boolean;
  is_deafened: boolean;
  is_screen_sharing: boolean;
  is_camera_sharing: boolean;
}

export interface ChatMessage {
  id: string;
  sender: { id: string; username: string; avatar_url: string };
  text: string;
  is_system?: boolean;
  created_at: string;
  reactions?: Record<string, string[]>;
}

export interface QueueTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  album_art_url: string;
  duration_seconds: number;
  added_by: string;
  vote_score?: number;
  status?: "queued" | "playing" | "played" | "skipped";
}

export interface NowPlaying {
  type: "video" | "music";
  title: string;
  subtitle: string;
  album_art_url?: string;
  thumbnail_url?: string;
  duration_seconds: number;
  elapsed_seconds: number;
  is_playing: boolean;
}

export interface PendingUser {
  id: string;
  username: string;
  avatar_url: string;
  requested_at: string;
}

export type SyncStatus = "synced" | "syncing" | "out-of-sync";

export interface RoomState {
  room: Room;
  participants: RoomParticipant[];
  messages: ChatMessage[];
  queue: QueueTrack[];
  now_playing: NowPlaying | null;
  sync_status: SyncStatus;
}

export interface CreateRoomFormData {
  name: string;
  type: "watch" | "music";
  max_participants: number;
}

// --- API Response Types (match backend schemas) ---

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface ApiToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiRoom {
  id: number;
  code: string;
  name: string;
  host_id: number;
  is_active: boolean;
  max_participants: number;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface ApiFriendship {
  id: number;
  user_id: number;
  friend_id: number;
  friend_username: string;
  friend_avatar_url: string | null;
  status: string;
  is_online: boolean;
  current_room: string | null;
  created_at: string;
}

export interface ApiNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface ApiSession {
  id: number;
  user_id: number;
  room_id: number;
  room_code: string;
  room_name: string;
  room_type: string | null;
  joined_at: string;
  left_at: string | null;
  duration_seconds: number | null;
}

export interface ApiRoomInvite {
  id: number;
  room_code: string;
  room_name: string;
  inviter_username: string;
  invitee_username: string;
  status: string;
  message: string | null;
  created_at: string;
}

export interface ApiUserSearch {
  id: number;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  friendship_status?: string | null;
}

export interface ApiNotificationPreferences {
  room_invite: boolean;
  user_mention: boolean;
  role_change: boolean;
  system_announcement: boolean;
  room_ended: boolean;
}

// --- Video Info (yt-dlp) ---

export interface VideoInfoResponse {
  url: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  uploader: string;
  stream_url: string;
}

// --- Live reactions (ephemeral floating emojis) ---

export interface LiveReaction {
  id: string;
  emoji: string;
  userId: string;
  username: string;
  x: number;
  createdAt: number;
}

// --- Audio participant state ---

export interface AudioParticipantState {
  userId: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isDeafened: boolean;
}

// --- Appearance Settings ---

export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "red" | "blue" | "green" | "purple" | "orange";
export type FontSize = "small" | "medium" | "large";

export interface AppearanceSettings {
  theme_mode: ThemeMode;
  accent_color: AccentColor;
  font_size: FontSize;
  reduced_motion: boolean;
  compact_mode: boolean;
}

// --- Keyboard Shortcuts ---

export interface KeyboardShortcut {
  id: string;
  action: string;
  description: string;
  keys: string[];
  category: "general" | "navigation" | "room_controls" | "chat";
}

// --- Feedback ---

export type FeedbackType = "bug" | "feature" | "general";

export interface FeedbackFormData {
  type: FeedbackType;
  rating: number;
  message: string;
  email: string;
}

// --- Gamification ---

export interface UserXP {
  user_id: number;
  username: string;
  total_xp: number;
  level: number;
  weekly_xp: number;
  xp_to_next_level: number;
  level_progress_pct: number;
}

export interface GamificationChallenge {
  id: number;
  title: string;
  description: string | null;
  challenge_type: string;
  action_type: string;
  target_count: number;
  xp_reward: number;
  icon: string | null;
  current_count: number;
  completed: boolean;
  active_until: string;
}

export interface AchievementProgress {
  id: number;
  user_id: number;
  achievement_key: string;
  achievement_name: string;
  description: string | null;
  icon: string | null;
  category: string;
  tier: string | null;
  progress_current: number | null;
  progress_target: number | null;
  earned_at: string;
}

export interface GamificationSummary {
  xp: UserXP;
  achievements: AchievementProgress[];
  active_challenges: GamificationChallenge[];
  streak: {
    user_id: number;
    username: string;
    current_login_streak: number;
    longest_login_streak: number;
    current_activity_streak: number;
    longest_activity_streak: number;
    last_login_date: string | null;
    last_activity_date: string | null;
  } | null;
  leaderboard_rank: number;
  leaderboard_top5: UserXP[];
  leaderboard_total_users: number;
  leaderboard_percentile: number;
  total_badges: number;
  earned_badges: number;
  current_xp_multiplier: number;
}

export interface BadgeCatalogEntry {
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  tier: string | null;
  earned: boolean;
  earned_at: string | null;
  progress_current: number;
  progress_target: number;
}

export interface BadgeCatalog {
  categories: Record<string, BadgeCatalogEntry[]>;
  total_badges: number;
  earned_badges: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_xp: number;
  level: number;
  weekly_xp: number;
  xp_to_next_level: number;
  level_progress_pct: number;
  total_users?: number;
  percentile?: number;
}

export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  page: number;
  per_page: number;
  total_users: number;
  user_rank: LeaderboardEntry | null;
}

export interface ChallengePool {
  daily: GamificationChallenge[];
  weekly: GamificationChallenge[];
  total: number;
  completed: number;
}

export interface XPMultiplier {
  name: string;
  value: number;
}

export interface XPMilestone {
  level: number;
  xp_required: number;
  reached: boolean;
}

export interface XPBreakdown {
  total_xp: number;
  level: number;
  weekly_xp: number;
  xp_to_next_level: number;
  level_progress_pct: number;
  current_multiplier: number;
  active_multipliers: XPMultiplier[];
  milestones: XPMilestone[];
}

// --- Broadcast types ---

export type BroadcastType = "announcement" | "alert" | "service_status";
export type BroadcastPriority = "low" | "normal" | "high" | "critical";

export interface Broadcast {
  id: string;
  type: BroadcastType;
  priority: BroadcastPriority;
  title: string;
  body: string;
  sender_id?: number;
  sender_username?: string;
  room_code?: string;
  requires_ack: boolean;
  auto_dismiss_ms?: number;
  data?: Record<string, unknown>;
  created_at: number;
}
