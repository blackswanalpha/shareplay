"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Monitor, MusicNote, ShieldCheck } from "@phosphor-icons/react";
import type { Room } from "@/lib/types";
import { useCreateRoom } from "@/hooks/useApi";
import { adaptRoom } from "@/lib/adapters";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export function CreateRoomModal({
  open,
  onClose,
  onCreated,
}: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"watch" | "music">("watch");
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [requireApproval, setRequireApproval] = useState(false);
  const reducedMotion = useReducedMotion();
  const createRoom = useCreateRoom();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setName("");
      setType("watch");
      setMaxParticipants(8);
      setRequireApproval(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createRoom.mutate(
      {
        name: name.trim(),
        max_participants: maxParticipants,
        settings: { type, require_approval: requireApproval },
      },
      {
        onSuccess: (apiRoom) => {
          onCreated(adaptRoom(apiRoom));
        },
      }
    );
  }

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
            }}
          >
            Create Room
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

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
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
              Room Name
            </label>
            <input
              type="text"
              placeholder="e.g. Movie Night"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: "#f5f5f5",
                fontSize: 15,
                fontFamily: "var(--font-inter), sans-serif",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
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
              Room Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["watch", "music"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background:
                      type === t ? "#ff3b3b" : "rgba(255,255,255,0.04)",
                    color: type === t ? "#fff" : "#888",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), sans-serif",
                    borderRadius: 10,
                    border:
                      type === t
                        ? "1px solid #ff3b3b"
                        : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t === "watch" ? (
                    <Monitor size={18} />
                  ) : (
                    <MusicNote size={18} />
                  )}
                  {t === "watch" ? "Watch" : "Music"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
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
              Max Participants
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxParticipants}
              onChange={(e) =>
                setMaxParticipants(
                  Math.min(20, Math.max(2, parseInt(e.target.value) || 2))
                )
              }
              style={{
                width: 100,
                padding: "10px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: "#f5f5f5",
                fontSize: 15,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => setRequireApproval((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "14px 16px",
                background: requireApproval
                  ? "rgba(255,59,59,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: requireApproval
                  ? "1px solid rgba(255,59,59,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <ShieldCheck
                size={20}
                weight={requireApproval ? "fill" : "regular"}
                style={{
                  color: requireApproval ? "#ff3b3b" : "#555",
                  transition: "color 0.2s ease",
                }}
              />
              <div style={{ flex: 1, textAlign: "left" }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: requireApproval ? "#f5f5f5" : "#888",
                    fontFamily: "var(--font-inter), sans-serif",
                    margin: 0,
                    transition: "color 0.2s ease",
                  }}
                >
                  Require host approval
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#555",
                    fontFamily: "var(--font-inter), sans-serif",
                    margin: "2px 0 0",
                  }}
                >
                  New members must be approved before joining
                </p>
              </div>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: requireApproval
                    ? "#ff3b3b"
                    : "rgba(255,255,255,0.1)",
                  position: "relative",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 2,
                    left: requireApproval ? 18 : 2,
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
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
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: "10px 24px",
                background: name.trim() ? "#ff3b3b" : "rgba(255,59,59,0.3)",
                color: name.trim() ? "#fff" : "rgba(255,255,255,0.4)",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-inter), sans-serif",
                borderRadius: 10,
                border: "none",
                cursor: name.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (name.trim()) {
                  e.currentTarget.style.background = "#e63535";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(255,59,59,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (name.trim()) {
                  e.currentTarget.style.background = "#ff3b3b";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              Create Room
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
