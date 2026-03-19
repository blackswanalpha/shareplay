"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Copy, Check, Link } from "@phosphor-icons/react";
import type { Room } from "@/lib/types";

interface WelcomeModalProps {
  open: boolean;
  room: Room;
  onClose: () => void;
}

export function WelcomeModal({ open, room, onClose }: WelcomeModalProps) {
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${room.code}`
      : "";

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

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? undefined : { duration: 0.2 }}
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 16px",
          background: "rgba(17,17,17,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#f5f5f5",
              margin: 0,
            }}
          >
            Welcome to {room.name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#888",
              cursor: "pointer",
              transition: "all 0.2s ease",
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
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {/* Room type badge */}
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "rgba(255,59,59,0.1)",
                border: "1px solid rgba(255,59,59,0.2)",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255,66,66,0.9)",
                fontFamily: "var(--font-inter), sans-serif",
                textTransform: "capitalize",
              }}
            >
              {room.type === "watch" ? "Watch Party" : "Music Session"}
            </span>
          </div>

          {/* Share link */}
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#888",
              marginBottom: 8,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            <Link size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Share this link to invite others
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <input
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: "#f5f5f5",
                fontSize: 13,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                outline: "none",
              }}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "12px 16px",
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                border: copied
                  ? "1px solid rgba(34,197,94,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: copied ? "#22c55e" : "#888",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "var(--font-inter), sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#f5f5f5";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#888";
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Got it button */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 24px",
              background: "#ff3b3b",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e63535";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(255,59,59,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff3b3b";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
