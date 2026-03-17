import type {
  ApiUser,
  ApiRoom,
  ApiFriendship,
  ApiNotification,
  ApiSession,
  ApiRoomInvite,
  ApiNotificationPreferences,
  User,
  Room,
  Friend,
  FriendRequest,
  Notification,
  NotificationType,
  NotificationPreferences,
  Session,
  Invite,
  DashboardStats,
} from "./types";

import { API_URL } from "./config";

function avatarFallback(username: string): string {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
}

export function resolveAvatarUrl(url: string | null, username: string): string {
  if (!url) return avatarFallback(username);
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

export function adaptUser(api: ApiUser): User {
  return {
    id: String(api.id),
    username: api.username,
    email: api.email,
    avatar_url: resolveAvatarUrl(api.avatar_url, api.username),
    is_online: api.is_active,
    is_email_verified: api.is_email_verified,
    created_at: api.created_at,
  };
}

export function adaptRoom(api: ApiRoom): Room {
  const settings = api.settings || {};
  return {
    id: String(api.id),
    name: api.name,
    code: api.code,
    type: (settings.type as "watch" | "music") || "watch",
    is_live: api.is_active,
    participants: [],
    max_participants: api.max_participants,
    created_at: api.created_at,
    owner_id: String(api.host_id),
  };
}

export function adaptFriend(api: ApiFriendship): Friend {
  return {
    id: String(api.friend_id),
    username: api.friend_username,
    avatar_url: resolveAvatarUrl(api.friend_avatar_url ?? null, api.friend_username),
    status: api.is_online ? "online" : "offline",
    activity: api.current_room || undefined,
  };
}

export function adaptFriendRequest(api: ApiFriendship): FriendRequest {
  return {
    id: String(api.id),
    from_user: {
      id: String(api.friend_id),
      username: api.friend_username,
      avatar_url: resolveAvatarUrl(api.friend_avatar_url ?? null, api.friend_username),
    },
    created_at: api.created_at,
    status: api.status as "pending" | "accepted" | "declined",
  };
}

export function adaptNotification(api: ApiNotification): Notification {
  const data = api.data || {};
  return {
    id: String(api.id),
    type: (api.type as NotificationType) || "system",
    is_read: api.is_read,
    title: api.title,
    body: api.body,
    action_url: (data.action_url as string) || undefined,
    actor: data.actor_username
      ? {
          username: data.actor_username as string,
          avatar_url:
            (data.actor_avatar_url as string) ||
            avatarFallback(data.actor_username as string),
        }
      : undefined,
    created_at: api.created_at,
  };
}

export function adaptSession(api: ApiSession): Session {
  return {
    id: String(api.id),
    room_name: api.room_name,
    type: (api.room_type as "watch" | "music") || "watch",
    duration_minutes: api.duration_seconds != null ? Math.round(api.duration_seconds / 60) : 0,
    ended_at: api.left_at || api.joined_at,
  };
}

export function adaptInvite(api: ApiRoomInvite): Invite {
  return {
    id: String(api.id),
    room_name: api.room_name,
    room_code: api.room_code,
    inviter: {
      username: api.inviter_username,
      avatar_url: avatarFallback(api.inviter_username),
    },
    created_at: api.created_at,
  };
}

export function computeStats(
  rooms: Room[],
  sessions: Session[],
  friends: Friend[]
): DashboardStats {
  const totalHours = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklySessions = sessions.filter(
    (s) => new Date(s.ended_at) >= oneWeekAgo
  ).length;

  return {
    total_rooms: rooms.length,
    total_hours: Math.round(totalHours * 10) / 10,
    total_friends: friends.length,
    weekly_sessions: weeklySessions,
  };
}

export function adaptNotificationPreferences(
  api: ApiNotificationPreferences
): NotificationPreferences {
  return {
    room_invites: api.room_invite,
    user_mentions: api.user_mention,
    role_changes: api.role_change,
    system_alerts: api.system_announcement,
    room_ended: api.room_ended,
  };
}

export function toApiNotificationPreferences(
  prefs: NotificationPreferences
): ApiNotificationPreferences {
  return {
    room_invite: prefs.room_invites,
    user_mention: prefs.user_mentions,
    role_change: prefs.role_changes,
    system_announcement: prefs.system_alerts,
    room_ended: prefs.room_ended,
  };
}
