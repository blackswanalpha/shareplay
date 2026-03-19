"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { KeyboardShortcut } from "@/lib/types";

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const modKey = isMac ? "⌘" : "Ctrl";

const shortcuts: KeyboardShortcut[] = [
  { id: "g1", action: "Command Palette", description: "Open the command palette", keys: [modKey, "K"], category: "general" },
  { id: "g2", action: "Settings", description: "Open settings", keys: [modKey, ","], category: "general" },
  { id: "g3", action: "Search", description: "Focus search bar", keys: [modKey, "F"], category: "general" },
  { id: "g4", action: "Close Modal", description: "Close any open modal or dialog", keys: ["Esc"], category: "general" },
  { id: "n1", action: "Dashboard", description: "Go to dashboard", keys: [modKey, "D"], category: "navigation" },
  { id: "n2", action: "Friends", description: "Open friends panel", keys: [modKey, "Shift", "F"], category: "navigation" },
  { id: "n3", action: "Notifications", description: "Open notifications", keys: [modKey, "N"], category: "navigation" },
  { id: "r1", action: "Toggle Mute", description: "Mute or unmute your microphone", keys: [modKey, "M"], category: "room_controls" },
  { id: "r2", action: "Toggle Camera", description: "Turn camera on or off", keys: [modKey, "E"], category: "room_controls" },
  { id: "r3", action: "Toggle Deafen", description: "Deafen or undeafen audio", keys: [modKey, "Shift", "D"], category: "room_controls" },
  { id: "r4", action: "Share Screen", description: "Start or stop screen sharing", keys: [modKey, "Shift", "S"], category: "room_controls" },
  { id: "r5", action: "Leave Room", description: "Leave the current room", keys: [modKey, "Shift", "L"], category: "room_controls" },
  { id: "c1", action: "Focus Chat", description: "Focus the chat input", keys: [modKey, "J"], category: "chat" },
  { id: "c2", action: "Send Message", description: "Send the typed message", keys: ["Enter"], category: "chat" },
  { id: "c3", action: "New Line", description: "Add a new line in chat", keys: ["Shift", "Enter"], category: "chat" },
];

const categories: { key: KeyboardShortcut["category"]; label: string }[] = [
  { key: "general", label: "General" },
  { key: "navigation", label: "Navigation" },
  { key: "room_controls", label: "Room Controls" },
  { key: "chat", label: "Chat" },
];

function KeyBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 8px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#ccc",
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: 24,
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
  );
}

export function KeyboardShortcutsSection() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return shortcuts;
    const q = search.toLowerCase();
    return shortcuts.filter(
      (s) =>
        s.action.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keys.some((k) => k.toLowerCase().includes(q))
    );
  }, [search]);

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
        Keyboard Shortcuts
      </h2>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <MagnifyingGlass
          size={16}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#666",
          }}
        />
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#f5f5f5",
            fontSize: 13,
            fontFamily: "var(--font-inter), sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Shortcut categories */}
      {categories.map((cat) => {
        const catShortcuts = filtered.filter((s) => s.category === cat.key);
        if (catShortcuts.length === 0) return null;
        return (
          <div key={cat.key} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              {cat.label}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              {catShortcuts.map((shortcut, i) => (
                <div
                  key={shortcut.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom:
                      i < catShortcuts.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#f5f5f5",
                        fontFamily: "var(--font-inter), sans-serif",
                      }}
                    >
                      {shortcut.action}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        fontFamily: "var(--font-inter), sans-serif",
                        marginTop: 2,
                      }}
                    >
                      {shortcut.description}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 16 }}>
                    {shortcut.keys.map((key, ki) => (
                      <KeyBadge key={ki} label={key} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#555",
            fontSize: 14,
            fontFamily: "var(--font-inter), sans-serif",
            padding: 32,
          }}
        >
          No shortcuts match your search
        </div>
      )}

      {/* Reset button */}
      <div style={{ marginTop: 8 }}>
        <button
          style={{
            padding: "10px 20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#888",
            fontSize: 13,
            fontFamily: "var(--font-inter), sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "#888";
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
