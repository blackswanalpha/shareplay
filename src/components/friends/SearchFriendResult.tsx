"use client";

import { StatusDot } from "@/components/ui/StatusDot";
import type { Friend } from "@/lib/types";

interface SearchFriendResultProps {
  friend: Friend;
  isFriend?: boolean;
  friendshipStatus?: string | null;
  onAddFriend?: () => void;
}

export function SearchFriendResult({ friend, isFriend = true, friendshipStatus, onAddFriend }: SearchFriendResultProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <img
        src={friend.avatar_url}
        alt={friend.username}
        width={36}
        height={36}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          background: "#222",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {friend.username}
        </span>
      </div>
      <StatusDot status={friend.status} size={8} />
      {isFriend ? (
        <span
          style={{
            fontSize: 12,
            color: friendshipStatus === "pending" ? "#f59e0b" : "#555",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {friendshipStatus === "pending" ? "Pending" : "Already Friends"}
        </span>
      ) : (
        <button
          onClick={onAddFriend}
          style={{
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "var(--font-inter), sans-serif",
            border: "none",
            borderRadius: 8,
            background: "#ff3b3b",
            color: "#fff",
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Add Friend
        </button>
      )}
    </div>
  );
}
