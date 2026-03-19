"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Warning } from "@phosphor-icons/react";

interface HostLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function HostLeaveModal({ open, onClose, onConfirm }: HostLeaveModalProps) {
  const reducedMotion = useReducedMotion();

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
          maxWidth: 400,
          margin: "0 16px",
          background: "rgba(17,17,17,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
          padding: 24,
          textAlign: "center",
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Warning size={28} weight="fill" style={{ color: "#ef4444" }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#f5f5f5",
            margin: "0 0 8px",
          }}
        >
          Leave Room?
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-inter), sans-serif",
            lineHeight: 1.5,
            margin: "0 0 28px",
          }}
        >
          You&apos;re the host. If you leave, this room will be destroyed for all
          participants.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              color: "#888",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#888";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 24px",
              background: "#ef4444",
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
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(239,68,68,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Leave Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}
