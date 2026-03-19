"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/AuthProvider";
import {
  useRooms,
  useFriends,
  useSessions,
  useInvites,
  useUnreadCount,
  useDashboardStats,
  useJoinRoom,
} from "@/hooks/useApi";
import type { Room } from "@/lib/types";

const DashboardHeader = dynamic(
  () => import("./DashboardHeader").then((m) => m.DashboardHeader),
  { ssr: false }
);

const DashboardHero = dynamic(
  () => import("./DashboardHero").then((m) => m.DashboardHero),
  { ssr: false }
);

const ActiveRooms = dynamic(
  () => import("./ActiveRooms").then((m) => m.ActiveRooms),
  { ssr: false }
);

const FriendsOnline = dynamic(
  () => import("./FriendsOnline").then((m) => m.FriendsOnline),
  { ssr: false }
);

const RecentSessions = dynamic(
  () => import("./RecentSessions").then((m) => m.RecentSessions),
  { ssr: false }
);

const PendingInvites = dynamic(
  () => import("./PendingInvites").then((m) => m.PendingInvites),
  { ssr: false }
);

const QuickStats = dynamic(
  () => import("./QuickStats").then((m) => m.QuickStats),
  { ssr: false }
);

const AdSensePanel = dynamic(
  () => import("./AdSensePanel").then((m) => m.AdSensePanel),
  { ssr: false }
);

const CommandPalette = dynamic(
  () =>
    import("@/components/ui/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

const CreateRoomModal = dynamic(
  () => import("./CreateRoomModal").then((m) => m.CreateRoomModal),
  { ssr: false }
);

export function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: rooms = [] } = useRooms();
  const { data: friends = [] } = useFriends();
  const { data: sessions = [] } = useSessions();
  const { data: invites = [] } = useInvites();
  const { data: unreadCount = 0 } = useUnreadCount();
  const stats = useDashboardStats();
  const joinRoom = useJoinRoom();

  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  const handleOpenCmdk = useCallback(() => setCmdkOpen(true), []);
  const handleCloseCmdk = useCallback(() => setCmdkOpen(false), []);

  const handleCreateRoom = useCallback(() => setCreateRoomOpen(true), []);
  const handleCloseCreateRoom = useCallback(
    () => setCreateRoomOpen(false),
    []
  );

  const handleRoomCreated = useCallback(
    (room: Room) => {
      setCreateRoomOpen(false);
      router.push(`/room/${room.code}/lobby`);
    },
    [router]
  );

  const handleOpenRoom = useCallback(
    (roomId: string) => {
      router.push(`/room/${roomId}`);
    },
    [router]
  );

  const handleJoinRoom = useCallback(
    (code: string) => {
      joinRoom.mutate(code, {
        onSuccess: () => {
          router.push(`/room/${code}/lobby`);
        },
      });
    },
    [joinRoom, router]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
      if (e.key === "Escape" && cmdkOpen) {
        setCmdkOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cmdkOpen]);

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        onOpenCommandPalette={handleOpenCmdk}
      />

      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        <DashboardHero
          username={user.username}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />

        <ActiveRooms rooms={rooms} onOpenRoom={handleOpenRoom} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
          }}
          className="dashboard-grid"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <FriendsOnline friends={friends} />
            <RecentSessions sessions={sessions} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PendingInvites invites={invites} />
            <AdSensePanel />
            <QuickStats stats={stats} />
          </div>
        </div>
      </main>

      <CommandPalette
        open={cmdkOpen}
        onClose={handleCloseCmdk}
        rooms={rooms}
        friends={friends}
        onCreateRoom={handleCreateRoom}
      />

      <CreateRoomModal
        open={createRoomOpen}
        onClose={handleCloseCreateRoom}
        onCreated={handleRoomCreated}
      />
    </div>
  );
}
