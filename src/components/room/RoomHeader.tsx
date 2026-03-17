"use client";

import { useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import {
  ArrowLeft,
  Copy,
  Check,
  SignOut,
} from "@phosphor-icons/react";
import {
  roomAtom,
  onlineCountAtom,
  syncStatusAtom,
} from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";

interface RoomHeaderProps {
  onBack: () => void;
  onLeave: () => void;
  actions: SocketActions;
}

export function RoomHeader({
  onBack,
  onLeave,
}: RoomHeaderProps) {
  const room = useAtomValue(roomAtom);
  const onlineCount = useAtomValue(onlineCountAtom);
  const syncStatus = useAtomValue(syncStatusAtom);
  const [codeCopied, setCodeCopied] = useState(false);

  const syncColors: Record<string, string> = {
    synced: "#22c55e",
    syncing: "#eab308",
    "out-of-sync": "#ff4242",
  };

  const syncLabels: Record<string, string> = {
    synced: "Synced",
    syncing: "Syncing",
    "out-of-sync": "Out of sync",
  };

  const handleCopy = useCallback(() => {
    if (room) {
      navigator.clipboard?.writeText(room.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }, [room]);

  if (!room) return null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onBack}
          aria-label="Back to dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            color: "#ccc",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#f5f5f5",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {room.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
                color: "#22c55e",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              {onlineCount} online
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
                color: syncColors[syncStatus],
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {syncLabels[syncStatus]}
            </span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Room code badge */}
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,66,66,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
              fontWeight: 400,
              color: "rgba(255,66,66,0.9)",
              letterSpacing: "0.15em",
            }}
          >
            CODE: {room.code}
          </span>
          {codeCopied ? (
            <Check size={14} style={{ color: "#22c55e" }} />
          ) : (
            <Copy size={14} style={{ color: "#666" }} />
          )}
        </button>

        {/* Leave button */}
        <button
          onClick={onLeave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            background: "#ff4242",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 0 20px rgba(255,66,66,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e63535";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,66,66,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ff4242";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,66,66,0.2)";
          }}
        >
          <SignOut size={16} />
          Leave
        </button>
      </div>
    </header>
  );
}
