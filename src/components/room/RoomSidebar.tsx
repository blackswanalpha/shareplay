"use client";

import dynamic from "next/dynamic";
import { useAtomValue, useSetAtom } from "jotai";
import {
  sidebarTabAtom,
  messagesAtom,
  participantsAtom,
  queueAtom,
} from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";

const ChatPanel = dynamic(
  () => import("./ChatPanel").then((m) => m.ChatPanel),
  { ssr: false }
);

const PeoplePanel = dynamic(
  () => import("./PeoplePanel").then((m) => m.PeoplePanel),
  { ssr: false }
);

const QueuePanel = dynamic(
  () => import("./QueuePanel").then((m) => m.QueuePanel),
  { ssr: false }
);

interface RoomSidebarProps {
  actions: SocketActions;
}

const tabs = [
  { key: "chat", label: "Chat" },
  { key: "people", label: "People" },
  { key: "queue", label: "Playlist" },
];

export function RoomSidebar({ actions }: RoomSidebarProps) {
  const activeTab = useAtomValue(sidebarTabAtom);
  const setActiveTab = useSetAtom(sidebarTabAtom);
  const messages = useAtomValue(messagesAtom);
  const participants = useAtomValue(participantsAtom);
  const queue = useAtomValue(queueAtom);

  const counts: Record<string, number> = {
    chat: messages.length,
    people: participants.length,
    queue: queue.length,
  };

  return (
    <div
      className="room-sidebar"
      style={{
        width: 340,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        borderRadius: "16px 0 0 0",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "16px 0",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.35)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #ff4242" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }
            }}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: activeTab === tab.key ? "#ff4242" : "#555",
                }}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0 16px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "chat" && <ChatPanel actions={actions} />}
        {activeTab === "people" && <PeoplePanel actions={actions} />}
        {activeTab === "queue" && <QueuePanel actions={actions} />}
      </div>
    </div>
  );
}
