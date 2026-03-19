"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Envelope,
  CaretDown,
  Bug,
  CheckCircle,
} from "@phosphor-icons/react";

const quickLinks = [
  { icon: BookOpen, label: "Documentation", description: "Guides, tutorials, and API docs", href: "#" },
  { icon: Users, label: "Community", description: "Join our Discord community", href: "#" },
  { icon: Envelope, label: "Contact Us", description: "Get in touch via email", href: "#" },
];

const troubleshootingItems = [
  {
    title: "Audio Issues",
    content:
      "Make sure your microphone is connected and permissions are granted in your browser settings. Try switching input devices in Audio settings. If echo is present, enable Echo Cancellation.",
  },
  {
    title: "Room Connection Problems",
    content:
      "Check your internet connection. If you can't join a room, try refreshing the page. Ensure the room code is correct and the room is still active. Disable any VPN or proxy that might interfere.",
  },
  {
    title: "Video Not Working",
    content:
      "Verify camera permissions in your browser. Try selecting a different camera in Video settings. Close other applications that might be using your camera. Restart your browser if the issue persists.",
  },
];

interface HelpSupportSectionProps {
  onNavigateToSection?: (key: string) => void;
}

export function HelpSupportSection({ onNavigateToSection }: HelpSupportSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [systemInfo, setSystemInfo] = useState({
    browser: "",
    os: "",
    version: "0.1.0",
    screen: "",
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (/iPhone|iPad/.test(ua)) os = "iOS";

    setSystemInfo({
      browser,
      os,
      version: "0.1.0",
      screen: `${window.screen.width}x${window.screen.height}`,
    });
  }, []);

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 8,
        }}
      >
        Help & Support
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#888",
          fontFamily: "var(--font-inter), sans-serif",
          marginBottom: 24,
        }}
      >
        Find answers, troubleshoot issues, or get in touch
      </p>

      {/* Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                textAlign: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <Icon size={24} color="#ff3b3b" />
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5", fontFamily: "var(--font-inter), sans-serif" }}>
                {link.label}
              </div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-inter), sans-serif" }}>
                {link.description}
              </div>
            </a>
          );
        })}
      </div>

      {/* Common Issues */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#888",
            fontFamily: "var(--font-inter), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 12,
          }}
        >
          Common Issues
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {troubleshootingItems.map((item, i) => {
            const isOpen = expandedIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpandedIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    color: "#f5f5f5",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), sans-serif",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {item.title}
                  <CaretDown
                    size={16}
                    color="#888"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 16px 14px",
                      fontSize: 13,
                      color: "#aaa",
                      fontFamily: "var(--font-inter), sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#888",
            fontFamily: "var(--font-inter), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 12,
          }}
        >
          System Information
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 24px",
          }}
        >
          {[
            { label: "Browser", value: systemInfo.browser },
            { label: "OS", value: systemInfo.os },
            { label: "App Version", value: systemInfo.version },
            { label: "Screen Resolution", value: systemInfo.screen },
          ].map((info) => (
            <div key={info.label}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-inter), sans-serif", marginBottom: 2 }}>
                {info.label}
              </div>
              <div style={{ fontSize: 13, color: "#f5f5f5", fontFamily: "var(--font-inter), sans-serif", fontWeight: 500 }}>
                {info.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Bug + Status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => onNavigateToSection?.("feedback")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "#ff3b3b",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Bug size={16} />
          Report a Bug
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle size={16} weight="fill" color="#22c55e" />
          <span
            style={{
              fontSize: 12,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}
