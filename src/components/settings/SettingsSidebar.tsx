"use client";

import {
  User,
  Bell,
  Microphone,
  Palette,
  Lock,
  Keyboard,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
}

const items: SidebarItem[] = [
  { key: "profile", label: "Profile", icon: <User size={18} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { key: "audio", label: "Audio", icon: <Microphone size={18} /> },
  { key: "appearance", label: "Appearance", icon: <Palette size={18} /> },
  { key: "privacy", label: "Privacy", icon: <Lock size={18} /> },
  { key: "shortcuts", label: "Shortcuts", icon: <Keyboard size={18} /> },
];

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (key: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileClose,
}: SettingsSidebarProps) {
  const navContent = (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "16px 8px",
      }}
    >
      {items.map((item) => {
        const isActive = item.key === activeSection;
        return (
          <button
            key={item.key}
            onClick={() => {
              onSectionChange(item.key);
              onMobileClose?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: isActive ? "rgba(255,59,59,0.08)" : "transparent",
              border: "none",
              borderLeft: isActive ? "3px solid #ff3b3b" : "3px solid transparent",
              borderRadius: "0 8px 8px 0",
              color: isActive ? "#f5f5f5" : "#888",
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              fontFamily: "var(--font-inter), sans-serif",
              cursor: "pointer",
              transition: "all 0.15s ease",
              width: "100%",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "#bbb";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#888";
              }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className="settings-sidebar-desktop"
        style={{
          width: 240,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {navContent}
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
          }}
        >
          <div
            onClick={onMobileClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: 260,
              background: "rgba(17,17,17,0.98)",
              backdropFilter: "blur(16px)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 64,
            }}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
