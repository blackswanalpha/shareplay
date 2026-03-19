"use client";

import { useState, useRef, useEffect, lazy, Suspense } from "react";

const Picker = lazy(() => import("emoji-picker-react").then((mod) => ({ default: mod.default })));

const QUICK_EMOJIS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F525}", "\u{1F44F}", "\u{1F62E}"];

interface QuickReactionBarProps {
  onSelect: (emoji: string) => void;
  onOpenFullPicker: () => void;
}

export function QuickReactionBar({ onSelect, onOpenFullPicker }: QuickReactionBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        background: "rgba(20,20,20,0.95)",
        borderRadius: 19,
        padding: "2.4px 4.8px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            padding: "2.4px 3.6px",
            borderRadius: 5,
            lineHeight: 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
          }}
        >
          {emoji}
        </button>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenFullPicker();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 10,
          padding: "2.4px 3.6px",
          borderRadius: 5,
          lineHeight: 1,
          color: "#888",
          transition: "background 0.15s, color 0.15s",
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
  );
}

interface FullEmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function FullEmojiPicker({ onSelect, onClose }: FullEmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        zIndex: 100,
        bottom: "100%",
        right: 0,
        marginBottom: 4,
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: 180,
              height: 240,
              background: "rgba(20,20,20,0.95)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Loading...
          </div>
        }
      >
        <Picker
          onEmojiClick={(emojiData) => {
            onSelect(emojiData.emoji);
            onClose();
          }}
          width={180}
          height={240}
          theme={"dark" as import("emoji-picker-react").Theme}
          searchPlaceholder="Search..."
          previewConfig={{ showPreview: false }}
          suggestedEmojisMode={"none" as import("emoji-picker-react").SuggestionMode}
          skinTonesDisabled
          style={{
            "--epr-emoji-size": "19px",
            "--epr-emoji-gap": "2.4px",
            "--epr-emoji-padding": "2.4px",
            "--epr-header-padding": "5px 7px",
            "--epr-category-navigation-button-size": "17px",
            "--epr-search-input-height": "26px",
            "--epr-search-input-text-color": "#aaa",
            "--epr-search-input-padding": "0 5px",
            fontSize: "11px",
          } as React.CSSProperties}
        />
      </Suspense>
    </div>
  );
}

interface ReactionFloatingButtonProps {
  onSelect: (emoji: string) => void;
}

export function ReactionFloatingButton({ onSelect }: ReactionFloatingButtonProps) {
  const [open, setOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => {
            if (v) setShowFullPicker(false);
            return !v;
          });
        }}
        aria-label="React to message"
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? "rgba(255,66,66,0.2)" : "rgba(255,255,255,0.08)",
          border: open ? "1px solid rgba(255,66,66,0.3)" : "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          transition: "all 0.15s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }
        }}
      >
        {"\u263A\uFE0F"}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            right: 0,
            zIndex: 20,
          }}
        >
          {showFullPicker ? (
            <FullEmojiPicker
              onSelect={(emoji) => {
                onSelect(emoji);
                setOpen(false);
                setShowFullPicker(false);
              }}
              onClose={() => {
                setShowFullPicker(false);
                setOpen(false);
              }}
            />
          ) : (
            <QuickReactionBar
              onSelect={(emoji) => {
                onSelect(emoji);
                setOpen(false);
              }}
              onOpenFullPicker={() => setShowFullPicker(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface ChatInputEmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function ChatInputEmojiPicker({ onSelect }: ChatInputEmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open emoji picker"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          background: "none",
          border: "none",
          color: open ? "#ff4242" : "#888",
          cursor: "pointer",
          fontSize: 12,
          lineHeight: 1,
          transition: "color 0.2s",
        }}
      >
        {"\u263A\uFE0F"}
      </button>
      {open && (
        <FullEmojiPicker
          onSelect={(emoji) => {
            onSelect(emoji);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
