"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { List } from "@phosphor-icons/react";
import { useAuth } from "@/providers/AuthProvider";
import { useRooms, useFriends, useUnreadCount } from "@/hooks/useApi";

const DashboardHeader = dynamic(
  () => import("@/components/dashboard/DashboardHeader").then((m) => m.DashboardHeader),
  { ssr: false }
);

const CommandPalette = dynamic(
  () => import("@/components/ui/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

const SettingsSidebar = dynamic(
  () => import("./SettingsSidebar").then((m) => m.SettingsSidebar),
  { ssr: false }
);

const ProfileSection = dynamic(
  () => import("./ProfileSection").then((m) => m.ProfileSection),
  { ssr: false }
);

const NotificationPreferencesSection = dynamic(
  () => import("./NotificationPreferencesSection").then((m) => m.NotificationPreferencesSection),
  { ssr: false }
);

const AudioSettingsSection = dynamic(
  () => import("./AudioSettingsSection").then((m) => m.AudioSettingsSection),
  { ssr: false }
);

const VideoSettingsSection = dynamic(
  () => import("./VideoSettingsSection").then((m) => m.VideoSettingsSection),
  { ssr: false }
);

const AppearanceSection = dynamic(
  () => import("./AppearanceSection").then((m) => m.AppearanceSection),
  { ssr: false }
);

const KeyboardShortcutsSection = dynamic(
  () => import("./KeyboardShortcutsSection").then((m) => m.KeyboardShortcutsSection),
  { ssr: false }
);

const FeedbackSection = dynamic(
  () => import("./FeedbackSection").then((m) => m.FeedbackSection),
  { ssr: false }
);

const AboutSection = dynamic(
  () => import("./AboutSection").then((m) => m.AboutSection),
  { ssr: false }
);

const HelpSupportSection = dynamic(
  () => import("./HelpSupportSection").then((m) => m.HelpSupportSection),
  { ssr: false }
);

const FAQSection = dynamic(
  () => import("./FAQSection").then((m) => m.FAQSection),
  { ssr: false }
);

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          padding: 48,
          textAlign: "center",
          color: "#555",
          fontSize: 14,
          fontFamily: "var(--font-inter), sans-serif",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        Coming Soon
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { data: rooms = [] } = useRooms();
  const { data: friends = [] } = useFriends();
  const { data: unreadCount = 0 } = useUnreadCount();

  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenCmdk = useCallback(() => setCmdkOpen(true), []);
  const handleCloseCmdk = useCallback(() => setCmdkOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
      if (e.key === "Escape") {
        if (cmdkOpen) setCmdkOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cmdkOpen, mobileMenuOpen]);

  function renderSection() {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "notifications":
        return <NotificationPreferencesSection />;
      case "audio":
        return <AudioSettingsSection />;
      case "video":
        return <VideoSettingsSection />;
      case "appearance":
        return <AppearanceSection />;
      case "shortcuts":
        return <KeyboardShortcutsSection />;
      case "feedback":
        return <FeedbackSection />;
      case "about":
        return <AboutSection />;
      case "help":
        return <HelpSupportSection onNavigateToSection={setActiveSection} />;
      case "faq":
        return <FAQSection onNavigateToSection={setActiveSection} />;
      default:
        return <ProfileSection />;
    }
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        onOpenCommandPalette={handleOpenCmdk}
      />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <button
          className="settings-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open settings menu"
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 50,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#ff3b3b",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(255,59,59,0.4)",
          }}
        >
          <List size={22} />
        </button>

        <SettingsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main
          style={{
            flex: 1,
            maxWidth: 720,
            padding: 32,
          }}
        >
          {renderSection()}
        </main>
      </div>

      <CommandPalette
        open={cmdkOpen}
        onClose={handleCloseCmdk}
        rooms={rooms}
        friends={friends}
      />
    </div>
  );
}
