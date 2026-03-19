"use client";

import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smiley } from "@phosphor-icons/react";
import type { SocketActions } from "@/hooks/useSocket";

const Picker = lazy(() => import("emoji-picker-react").then((mod) => ({ default: mod.default })));

const QUICK_EMOJIS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F525}", "\u{1F44F}", "\u{1F62E}"];

interface EmotionBarFABProps {
  actions: SocketActions;
}

export function EmotionBarFAB({ actions }: EmotionBarFABProps) {
  const [open, setOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef(0);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowFullPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (emoji: string) => {
    const now = Date.now();
    if (now - lastSentRef.current < 500) return;
    lastSentRef.current = now;
    actions.sendLiveReaction(emoji);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 84,
        left: 32,
        zIndex: 45,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 52,
              left: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {showFullPicker ? (
              <div style={{ position: "relative" }}>
                <Suspense
                  fallback={
                    <div
                      style={{
                        width: 280,
                        height: 320,
                        background: "rgba(20,20,20,0.95)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#888",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}
                    >
                      Loading...
                    </div>
                  }
                >
                  <Picker
                    onEmojiClick={(emojiData) => {
                      handleSelect(emojiData.emoji);
                      setShowFullPicker(false);
                      setOpen(false);
                    }}
                    width={280}
                    height={320}
                    theme={"dark" as import("emoji-picker-react").Theme}
                    searchPlaceholder="Search..."
                    previewConfig={{ showPreview: false }}
                    suggestedEmojisMode={"none" as import("emoji-picker-react").SuggestionMode}
                    skinTonesDisabled
                    style={{
                      "--epr-emoji-size": "22px",
                      "--epr-emoji-gap": "3px",
                      "--epr-emoji-padding": "3px",
                      "--epr-header-padding": "6px 8px",
                      "--epr-category-navigation-button-size": "18px",
                      "--epr-search-input-height": "28px",
                      "--epr-search-input-text-color": "#aaa",
                      "--epr-search-input-padding": "0 6px",
                      fontSize: "12px",
                    } as React.CSSProperties}
                  />
                </Suspense>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(20,20,20,0.95)",
                  borderRadius: 24,
                  padding: "8px 6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(emoji);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 22,
                      padding: "4px",
                      borderRadius: 8,
                      lineHeight: 1,
                      transition: "background 0.15s, transform 0.15s",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullPicker(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "4px",
                    borderRadius: 8,
                    lineHeight: 1,
                    color: "#888",
                    transition: "background 0.15s, color 0.15s",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "#888";
                  }}
                >
                  +
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        onClick={() => {
          setOpen((v) => {
            if (v) setShowFullPicker(false);
            return !v;
          });
        }}
        aria-label="Send live reaction"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? "rgba(255,66,66,0.2)" : "rgba(20,20,20,0.95)",
          border: open ? "1px solid rgba(255,66,66,0.4)" : "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: open ? "#ff4242" : "rgba(255,255,255,0.7)",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(20,20,20,0.95)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }
        }}
      >
        <Smiley size={22} weight={open ? "fill" : "regular"} />
      </button>
    </div>
  );
}
