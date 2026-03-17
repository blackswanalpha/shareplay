"use client";

import { Command } from "cmdk";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  MusicNote,
  Users,
  Plus,
  GearSix,
} from "@phosphor-icons/react";
import type { Room, Friend } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  friends: Friend[];
  onCreateRoom?: () => void;
}

export function CommandPalette({
  open,
  onClose,
  rooms,
  friends,
  onCreateRoom,
}: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "20vh",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Command
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(17,17,17,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
          fontFamily: "var(--font-inter), sans-serif",
        }}
        label="Command palette"
      >
        <Command.Input
          placeholder="Type a command or search..."
          autoFocus
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            color: "#f5f5f5",
            fontSize: 15,
            outline: "none",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        />
        <Command.List
          style={{
            maxHeight: 320,
            overflowY: "auto",
            padding: 8,
          }}
        >
          <Command.Empty
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "#555",
              fontSize: 14,
            }}
          >
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Rooms"
            style={{
              padding: "4px 0",
            }}
          >
            {rooms.map((room) => (
              <Command.Item
                key={room.id}
                value={room.name}
                onSelect={() => {
                  onClose();
                  router.push(`/room/${room.code}`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "#f5f5f5",
                  fontSize: 14,
                }}
              >
                {room.type === "watch" ? (
                  <Monitor size={16} style={{ color: "#888" }} />
                ) : (
                  <MusicNote size={16} style={{ color: "#888" }} />
                )}
                {room.name}
                {room.is_live && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "#22c55e",
                      fontWeight: 600,
                    }}
                  >
                    LIVE
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Separator
            style={{
              height: 1,
              background: "rgba(255,255,255,0.06)",
              margin: "4px 0",
            }}
          />

          <Command.Group heading="Friends">
            {friends
              .filter((f) => f.status !== "offline")
              .slice(0, 4)
              .map((friend) => (
                <Command.Item
                  key={friend.id}
                  value={friend.username}
                  onSelect={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#f5f5f5",
                    fontSize: 14,
                  }}
                >
                  <Users size={16} style={{ color: "#888" }} />
                  {friend.username}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color:
                        friend.status === "online" ? "#22c55e" : "#eab308",
                    }}
                  >
                    {friend.status}
                  </span>
                </Command.Item>
              ))}
          </Command.Group>

          <Command.Separator
            style={{
              height: 1,
              background: "rgba(255,255,255,0.06)",
              margin: "4px 0",
            }}
          />

          <Command.Group heading="Actions">
            <Command.Item
              value="Create Room"
              onSelect={() => {
                onCreateRoom?.();
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                color: "#f5f5f5",
                fontSize: 14,
              }}
            >
              <Plus size={16} style={{ color: "#888" }} />
              Create Room
            </Command.Item>
            <Command.Item
              value="Settings"
              onSelect={() => {
                onClose();
                router.push("/dashboard/settings");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                color: "#f5f5f5",
                fontSize: 14,
              }}
            >
              <GearSix size={16} style={{ color: "#888" }} />
              Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
