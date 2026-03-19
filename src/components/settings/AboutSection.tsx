"use client";

import { GithubLogo, XLogo, DiscordLogo } from "@phosphor-icons/react";

const techStack = ["Next.js", "React", "Jotai", "Chakra UI", "Socket.io", "Framer Motion"];

const socialLinks = [
  { icon: GithubLogo, label: "GitHub", href: "#" },
  { icon: XLogo, label: "Twitter / X", href: "#" },
  { icon: DiscordLogo, label: "Discord", href: "#" },
];

export function AboutSection() {
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
        About
      </h2>

      {/* App info */}
      <div
        style={{
          textAlign: "center",
          padding: 32,
          background: "rgba(255,255,255,0.02)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#f5f5f5",
            marginBottom: 4,
          }}
        >
          SharePlay
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#888",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 16,
          }}
        >
          Version 0.1.0
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#aaa",
            fontFamily: "var(--font-inter), sans-serif",
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          SharePlay brings people together through shared experiences. Watch videos, listen to music,
          and hang out with friends in real-time — no matter where you are.
        </p>
      </div>

      {/* Tech stack */}
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
          Built With
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {techStack.map((tech) => (
            <span
              key={tech}
              style={{
                padding: "6px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                color: "#ccc",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Social links */}
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
          Connect
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: "#ccc",
                  fontSize: 13,
                  fontFamily: "var(--font-inter), sans-serif",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#ccc";
                }}
              >
                <Icon size={18} />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Legal */}
      <div style={{ marginBottom: 24 }}>
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
          Legal
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <a
            href="#"
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f5f5f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}
          >
            Terms of Service
          </a>
          <a
            href="#"
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f5f5f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}
          >
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          fontSize: 12,
          color: "#555",
          fontFamily: "var(--font-inter), sans-serif",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 16,
        }}
      >
        &copy; 2026 SharePlay. All rights reserved.
      </div>
    </div>
  );
}
