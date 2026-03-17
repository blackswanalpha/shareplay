"use client";

import { useAtomValue } from "jotai";
import { roomAnnouncementAtom, serviceStatusAtom } from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";

interface BroadcastBannerProps {
  actions: SocketActions;
  isHost: boolean;
}

const priorityStyles: Record<string, { bg: string; border: string; text: string }> = {
  low: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)", text: "#93c5fd" },
  normal: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#93c5fd" },
  high: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#fcd34d" },
  critical: { bg: "rgba(239, 68, 68, 0.18)", border: "rgba(239, 68, 68, 0.5)", text: "#fca5a5" },
};

export function BroadcastBanner({ actions, isHost }: BroadcastBannerProps) {
  const announcement = useAtomValue(roomAnnouncementAtom);
  const serviceStatus = useAtomValue(serviceStatusAtom);

  if (!announcement && !serviceStatus) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {serviceStatus && (
        <ServiceStatusBar
          title={serviceStatus.title}
          body={serviceStatus.body}
          priority={serviceStatus.priority}
        />
      )}
      {announcement && (
        <AnnouncementBar
          title={announcement.title}
          body={announcement.body}
          senderUsername={announcement.sender_username}
          isHost={isHost}
          onDismiss={() => actions.dismissAnnouncement()}
        />
      )}
    </div>
  );
}

function ServiceStatusBar({ title, body, priority }: { title: string; body: string; priority: string }) {
  const style = priorityStyles[priority] || priorityStyles.high;

  return (
    <div
      style={{
        background: style.bg,
        borderBottom: `1px solid ${style.border}`,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: style.text, fontWeight: 600, flexShrink: 0 }}>
        {title}
      </span>
      <span style={{ color: "rgba(255,255,255,0.7)" }}>
        {body}
      </span>
    </div>
  );
}

function AnnouncementBar({
  title,
  body,
  senderUsername,
  isHost,
  onDismiss,
}: {
  title: string;
  body: string;
  senderUsername?: string;
  isHost: boolean;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#93c5fd", fontWeight: 600, flexShrink: 0 }}>
        {title}
      </span>
      <span style={{ color: "rgba(255,255,255,0.7)", flex: 1 }}>
        {body}
      </span>
      {senderUsername && (
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, flexShrink: 0 }}>
          — {senderUsername}
        </span>
      )}
      {isHost && (
        <button
          onClick={onDismiss}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 4,
            color: "rgba(255,255,255,0.5)",
            fontSize: 11,
            padding: "2px 8px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
