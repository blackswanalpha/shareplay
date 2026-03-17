"use client";

import { useEffect, useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useApi";
import type { NotificationPreferences } from "@/lib/types";

const items: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: "room_invites", label: "Room Invites", description: "Get notified when someone invites you to a room" },
  { key: "user_mentions", label: "User Mentions", description: "Get notified when someone mentions you in chat" },
  { key: "role_changes", label: "Role Changes", description: "Get notified when your role changes in a room" },
  { key: "system_alerts", label: "System Alerts", description: "Receive system updates and announcements" },
  { key: "room_ended", label: "Room Ended", description: "Get notified when a room you were in ends" },
];

const defaultPrefs: NotificationPreferences = {
  room_invites: true,
  user_mentions: true,
  role_changes: true,
  system_alerts: true,
  room_ended: true,
};

export function NotificationPreferencesSection() {
  const { data: serverPrefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);

  useEffect(() => {
    if (serverPrefs) {
      setPrefs(serverPrefs);
    }
  }, [serverPrefs]);

  function togglePref(key: keyof NotificationPreferences) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    updatePrefs.mutate(updated);
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 24,
        }}
      >
        Notification Preferences
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "16px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#f5f5f5",
                  fontFamily: "var(--font-inter), sans-serif",
                  marginBottom: 2,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {item.description}
              </div>
            </div>
            <ToggleSwitch
              checked={prefs[item.key]}
              onChange={() => togglePref(item.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
