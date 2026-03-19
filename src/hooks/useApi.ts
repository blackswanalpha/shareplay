"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetRooms,
  apiCreateRoom,
  apiJoinRoom,
  apiGetAllUsers,
  apiGetFriends,
  apiGetFriendRequests,
  apiRespondToFriendRequest,
  apiRemoveFriend,
  apiSearchUsers,
  apiSendFriendRequest,
  apiGetInvites,
  apiGetNotifications,
  apiGetUnreadCount,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiGetSessionHistory,
  apiUpdateMe,
  apiUploadAvatar,
  apiDeleteAvatar,
  apiGetNotificationPreferences,
  apiUpdateNotificationPreferences,
} from "@/lib/api";
import {
  adaptRoom,
  adaptFriend,
  adaptFriendRequest,
  adaptNotification,
  adaptSession,
  adaptInvite,
  computeStats,
  adaptNotificationPreferences,
  toApiNotificationPreferences,
} from "@/lib/adapters";
import type { NotificationPreferences } from "@/lib/types";
// --- Queries ---

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const data = await apiGetRooms();
      return data.map(adaptRoom);
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: () => apiGetAllUsers(),
  });
}

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const data = await apiGetFriends();
      return data.filter((f) => f.status === "accepted").map(adaptFriend);
    },
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ["friend-requests"],
    queryFn: async () => {
      const data = await apiGetFriendRequests();
      return data.map(adaptFriendRequest);
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await apiGetNotifications();
      return data.map(adaptNotification);
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const data = await apiGetUnreadCount();
      return data.unread_count;
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const data = await apiGetSessionHistory();
      return data.map(adaptSession);
    },
  });
}

export function useInvites() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const data = await apiGetInvites();
      return data.map(adaptInvite);
    },
  });
}

export function useDashboardStats() {
  const { data: rooms } = useRooms();
  const { data: sessions } = useSessions();
  const { data: friends } = useFriends();

  return useMemo(
    () => computeStats(rooms || [], sessions || [], friends || []),
    [rooms, sessions, friends]
  );
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => apiSearchUsers(query),
    enabled: query.length >= 2,
  });
}

// --- Mutations ---

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      max_participants?: number;
      settings?: Record<string, unknown>;
    }) => apiCreateRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useJoinRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiJoinRoom(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiMarkNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiMarkAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

export function useRespondToFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: number;
      action: "accept" | "decline" | "block";
    }) => apiRespondToFriendRequest(requestId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendId: number) => apiRemoveFriend(friendId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => apiSendFriendRequest(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
      qc.invalidateQueries({ queryKey: ["all-users"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

// --- Settings ---

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      username?: string;
      email?: string;
      avatar_url?: string | null;
    }) => apiUpdateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => apiUploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDeleteAvatar(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const data = await apiGetNotificationPreferences();
      return adaptNotificationPreferences(data);
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      apiUpdateNotificationPreferences(toApiNotificationPreferences(prefs)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
