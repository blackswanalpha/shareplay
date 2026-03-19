import { API_URL } from "./config";
import type {
  ApiToken,
  ApiUser,
  ApiRoom,
  ApiFriendship,
  ApiNotification,
  ApiSession,
  ApiRoomInvite,
  ApiUserSearch,
  ApiNotificationPreferences,
} from "./types";

const ACCESS_TOKEN_KEY = "shareplay_access_token";
const REFRESH_TOKEN_KEY = "shareplay_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Refresh lock to prevent concurrent refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data: ApiToken = await res.json();
    storeTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { noAuth?: boolean }
): Promise<T> {
  const { noAuth, ...fetchOptions } = options || {};
  const headers = new Headers(fetchOptions.headers);

  if (!noAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401 && !noAuth) {
    // Try refresh once
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;

    if (refreshed) {
      const retryHeaders = new Headers(fetchOptions.headers);
      retryHeaders.set("Authorization", `Bearer ${getAccessToken()}`);
      if (!retryHeaders.has("Content-Type") && fetchOptions.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      const retry = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers: retryHeaders,
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        let message = "Request failed";
        if (typeof err.detail === "string") {
          message = err.detail;
        } else if (Array.isArray(err.detail) && err.detail.length > 0) {
          message = err.detail[0].msg || JSON.stringify(err.detail[0]);
        } else if (err.detail) {
          message = String(err.detail);
        }
        throw new ApiError(retry.status, message);
      }
      return retry.json();
    }

    // Refresh failed — clear tokens, redirect
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let message = "Request failed";
    if (typeof err.detail === "string") {
      message = err.detail;
    } else if (Array.isArray(err.detail) && err.detail.length > 0) {
      message = err.detail[0].msg || JSON.stringify(err.detail[0]);
    } else if (err.detail) {
      message = String(err.detail);
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// --- Auth ---

export function apiRegister(data: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiUser> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    noAuth: true,
  });
}

export function apiLogin(data: {
  email: string;
  password: string;
}): Promise<ApiToken> {
  return apiFetch("/auth/token", {
    method: "POST",
    body: JSON.stringify(data),
    noAuth: true,
  });
}

export function apiForgotPassword(data: {
  email: string;
}): Promise<{ message: string }> {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
    noAuth: true,
  });
}

export function apiResetPassword(data: {
  token: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    noAuth: true,
  });
}

export function apiVerifyEmail(data: {
  token: string;
}): Promise<{ message: string }> {
  return apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
    noAuth: true,
  });
}

export function apiRefreshToken(refresh_token: string): Promise<ApiToken> {
  return apiFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
    noAuth: true,
  });
}

export function apiGetMe(): Promise<ApiUser> {
  return apiFetch("/auth/me");
}

export function apiUpdateMe(data: {
  username?: string;
  email?: string;
  avatar_url?: string | null;
}): Promise<ApiUser> {
  return apiFetch("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUploadAvatar(file: File): Promise<ApiUser> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      typeof err.detail === "string" ? err.detail : "Failed to upload avatar";
    throw new ApiError(res.status, message);
  }
  return res.json();
}

export function apiDeleteAvatar(): Promise<ApiUser> {
  return apiFetch("/auth/me/avatar", { method: "DELETE" });
}

// --- Rooms ---

export function apiGetRooms(): Promise<ApiRoom[]> {
  return apiFetch("/rooms/");
}

export function apiGetRoom(code: string): Promise<ApiRoom> {
  return apiFetch(`/rooms/${code}`);
}

export function apiGetRoomParticipants(
  code: string
): Promise<Array<{ id: number; username: string; avatar_url: string | null; role: string; is_online: boolean }>> {
  return apiFetch(`/rooms/${code}/participants`);
}

export function apiGetChatHistory(
  code: string
): Promise<Array<{ id: number; user_id: number; username: string; avatar_url: string | null; content: string; message_type: string; reactions: Record<string, number[]>; created_at: string }>> {
  return apiFetch(`/chat/${code}/history`);
}

export function apiGetPlaylist(
  code: string
): Promise<Array<{ id: number; title: string; url: string; duration_seconds: number | null; thumbnail_url?: string | null; added_by_username?: string | null; status: string }>> {
  return apiFetch(`/playlist/${code}`);
}

export function apiCreateRoom(data: {
  name: string;
  max_participants?: number;
  settings?: Record<string, unknown>;
}): Promise<ApiRoom> {
  return apiFetch("/rooms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiJoinRoom(code: string): Promise<ApiRoom> {
  return apiFetch(`/rooms/${code}/join`, { method: "POST" });
}

// --- Social ---

export function apiGetAllUsers(): Promise<ApiUserSearch[]> {
  return apiFetch("/social/users");
}

export function apiGetFriends(): Promise<ApiFriendship[]> {
  return apiFetch("/social/friends");
}

export function apiGetFriendRequests(): Promise<ApiFriendship[]> {
  return apiFetch("/social/friends/requests");
}

export function apiSendFriendRequest(username: string): Promise<ApiFriendship> {
  return apiFetch("/social/friends/request", {
    method: "POST",
    body: JSON.stringify({ friend_username: username }),
  });
}

export function apiRespondToFriendRequest(
  friendshipId: number,
  action: "accept" | "decline" | "block"
): Promise<ApiFriendship> {
  return apiFetch(`/social/friends/${friendshipId}`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  });
}

export function apiRemoveFriend(friendId: number): Promise<void> {
  return apiFetch(`/social/friends/${friendId}`, { method: "DELETE" });
}

export function apiSearchUsers(query: string): Promise<ApiUserSearch[]> {
  return apiFetch(`/social/search?q=${encodeURIComponent(query)}`);
}

export function apiGetInvites(): Promise<ApiRoomInvite[]> {
  return apiFetch("/social/invites");
}

export function apiRespondToInvite(
  inviteId: number,
  action: "accept" | "decline"
): Promise<ApiRoomInvite> {
  return apiFetch(`/social/invites/${inviteId}`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  });
}

// --- Notifications ---

export function apiGetNotifications(): Promise<ApiNotification[]> {
  return apiFetch("/notifications/");
}

export function apiGetUnreadCount(): Promise<{ unread_count: number }> {
  return apiFetch("/notifications/unread-count");
}

export function apiMarkNotificationRead(id: number): Promise<ApiNotification> {
  return apiFetch(`/notifications/${id}/read`, { method: "PUT" });
}

export function apiMarkAllNotificationsRead(): Promise<void> {
  return apiFetch("/notifications/read-all", { method: "PUT" });
}

export function apiGetNotificationPreferences(): Promise<ApiNotificationPreferences> {
  return apiFetch("/notifications/preferences");
}

export function apiUpdateNotificationPreferences(
  data: Partial<ApiNotificationPreferences>
): Promise<ApiNotificationPreferences> {
  return apiFetch("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// --- YouTube / Video Info ---

export function apiGetVideoInfo(url: string): Promise<import("./types").VideoInfoResponse> {
  return apiFetch("/yt/info", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

// --- Sessions ---

export function apiGetSessionHistory(): Promise<ApiSession[]> {
  return apiFetch("/sessions/history");
}

// --- Gamification ---

export function apiGetMyGamification(): Promise<import("./types").GamificationSummary> {
  return apiFetch("/api/me/gamification");
}

export function apiGetXPLeaderboard(): Promise<import("./types").UserXP[]> {
  return apiFetch("/api/leaderboard/xp");
}
