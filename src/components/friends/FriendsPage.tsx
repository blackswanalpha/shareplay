"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import {
  useAllUsers,
  useFriends,
  useFriendRequests,
  useRooms,
  useUnreadCount,
  useSearchUsers,
  useRespondToFriendRequest,
  useSendFriendRequest,
} from "@/hooks/useApi";

const DashboardHeader = dynamic(
  () => import("@/components/dashboard/DashboardHeader").then((m) => m.DashboardHeader),
  { ssr: false }
);

const CommandPalette = dynamic(
  () => import("@/components/ui/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

const TabBar = dynamic(
  () => import("@/components/ui/TabBar").then((m) => m.TabBar),
  { ssr: false }
);

const FriendCard = dynamic(
  () => import("./FriendCard").then((m) => m.FriendCard),
  { ssr: false }
);

const FriendRequestCard = dynamic(
  () => import("./FriendRequestCard").then((m) => m.FriendRequestCard),
  { ssr: false }
);

const SearchFriendResult = dynamic(
  () => import("./SearchFriendResult").then((m) => m.SearchFriendResult),
  { ssr: false }
);

export function FriendsPage() {
  const { user } = useAuth();
  const { data: allUsers = [] } = useAllUsers();
  const { data: friends = [] } = useFriends();
  const { data: friendRequests = [] } = useFriendRequests();
  const { data: rooms = [] } = useRooms();
  const { data: unreadCount = 0 } = useUnreadCount();
  const respondToRequest = useRespondToFriendRequest();
  const sendFriendRequest = useSendFriendRequest();

  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const reducedMotion = useReducedMotion();

  const { data: searchResults } = useSearchUsers(debouncedQuery);

  const handleOpenCmdk = useCallback(() => setCmdkOpen(true), []);
  const handleCloseCmdk = useCallback(() => setCmdkOpen(false), []);

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onlineFriends = useMemo(
    () => friends.filter((f) => f.status === "online" || f.status === "away"),
    [friends]
  );

  const friendIds = useMemo(
    () => new Set(friends.map((f) => f.id)),
    [friends]
  );

  const tabs = [
    { key: "users", label: "Users", count: allUsers.length },
    { key: "all", label: "All Friends", count: friends.length },
    { key: "online", label: "Online", count: onlineFriends.length },
    { key: "requests", label: "Requests", count: friendRequests.length },
  ];

  function handleAcceptRequest(requestId: string) {
    respondToRequest.mutate({ requestId: Number(requestId), action: "accept" });
  }

  function handleDeclineRequest(requestId: string) {
    respondToRequest.mutate({ requestId: Number(requestId), action: "decline" });
  }

  function handleBlockRequest(requestId: string) {
    respondToRequest.mutate({ requestId: Number(requestId), action: "block" });
  }

  function handleAddFriend(username: string) {
    sendFriendRequest.mutate(username);
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        onOpenCommandPalette={handleOpenCmdk}
      />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#f5f5f5",
            marginBottom: 24,
          }}
        >
          Friends & Social
        </h1>

        <div
          style={{
            position: "relative",
            marginBottom: 24,
          }}
        >
          <MagnifyingGlass
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
            }}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              color: "#f5f5f5",
              fontSize: 14,
              fontFamily: "var(--font-inter), sans-serif",
              outline: "none",
              backdropFilter: "blur(12px)",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>

        {debouncedQuery.length >= 2 && searchResults ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchResults.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "#555",
                  fontSize: 14,
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                No users found matching &quot;{debouncedQuery}&quot;
              </div>
            ) : (
              searchResults.map((u) => {
                const isFriend = friendIds.has(String(u.id));
                return (
                  <SearchFriendResult
                    key={u.id}
                    friend={{
                      id: String(u.id),
                      username: u.username,
                      avatar_url:
                        u.avatar_url ||
                        `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.username)}`,
                      status: u.is_online ? "online" : "offline",
                    }}
                    isFriend={isFriend}
                    onAddFriend={() => handleAddFriend(u.username)}
                  />
                );
              })
            )}
          </div>
        ) : (
          <>
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeTab === "users" &&
                allUsers.map((u, i) => {
                  const isFriend = friendIds.has(String(u.id));
                  return (
                    <motion.div
                      key={u.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                    >
                      <SearchFriendResult
                        friend={{
                          id: String(u.id),
                          username: u.username,
                          avatar_url:
                            u.avatar_url ||
                            `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.username)}`,
                          status: u.is_online ? "online" : "offline",
                        }}
                        isFriend={isFriend || u.friendship_status === "pending"}
                        friendshipStatus={isFriend ? "accepted" : u.friendship_status}
                        onAddFriend={() => handleAddFriend(u.username)}
                      />
                    </motion.div>
                  );
                })}

              {activeTab === "all" &&
                friends.map((friend, i) => (
                  <motion.div
                    key={friend.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <FriendCard friend={friend} />
                  </motion.div>
                ))}

              {activeTab === "online" &&
                onlineFriends.map((friend, i) => (
                  <motion.div
                    key={friend.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <FriendCard friend={friend} />
                  </motion.div>
                ))}

              {activeTab === "requests" &&
                friendRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <FriendRequestCard
                      request={req}
                      onAccept={() => handleAcceptRequest(req.id)}
                      onDecline={() => handleDeclineRequest(req.id)}
                      onBlock={() => handleBlockRequest(req.id)}
                    />
                  </motion.div>
                ))}
            </div>
          </>
        )}
      </main>

      <CommandPalette
        open={cmdkOpen}
        onClose={handleCloseCmdk}
        rooms={rooms}
        friends={friends}
      />
    </div>
  );
}
