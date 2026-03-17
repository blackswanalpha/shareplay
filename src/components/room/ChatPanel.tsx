"use client";

import { useEffect, useRef, useCallback } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useAtomValue, useSetAtom } from "jotai";
import { messagesAtom, chatInputAtom } from "@/store/roomAtoms";
import { useAuth } from "@/providers/AuthProvider";
import type { SocketActions } from "@/hooks/useSocket";

interface ChatPanelProps {
  actions: SocketActions;
}

export function ChatPanel({ actions }: ChatPanelProps) {
  const messages = useAtomValue(messagesAtom);
  const chatInput = useAtomValue(chatInputAtom);
  const setChatInput = useSetAtom(chatInputAtom);
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!chatInput.trim() || !user) return;
    actions.sendMessage(chatInput.trim());
    setChatInput("");
  }, [chatInput, user, actions, setChatInput]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        ref={listRef}
        className="hide-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.map((msg) =>
          msg.is_system ? (
            <div
              key={msg.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
              }}
            >
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
              <span
                style={{
                  fontSize: 10,
                  color: "#555",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-inter), sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.text}
              </span>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
          ) : (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: msg.sender.id === user?.id ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  flexDirection: msg.sender.id === user?.id ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: msg.sender.id === user?.id ? "#f5f5f5" : "#ff4242",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {msg.sender.id === user?.id ? "You" : msg.sender.username}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#555",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {formatTime(msg.created_at)}
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#ddd",
                  fontFamily: "var(--font-inter), sans-serif",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  padding: "10px 14px",
                  background: msg.sender.id === user?.id
                    ? "rgba(255,66,66,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: msg.sender.id === user?.id
                    ? "1px solid rgba(255,66,66,0.2)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  borderTopLeftRadius: msg.sender.id === user?.id ? 12 : 2,
                  borderTopRightRadius: msg.sender.id === user?.id ? 2 : 12,
                  maxWidth: "85%",
                }}
              >
                {msg.text}
              </p>
            </div>
          )
        )}
      </div>

      {/* Chat input */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.2)",
          margin: "0 -16px",
          padding: "12px 16px 0",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "12px 48px 12px 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#f5f5f5",
              fontSize: 14,
              fontFamily: "var(--font-inter), sans-serif",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,66,66,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            style={{
              position: "absolute",
              right: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              background: "none",
              border: "none",
              color: chatInput.trim() ? "#ff4242" : "#555",
              cursor: chatInput.trim() ? "pointer" : "default",
              transition: "color 0.2s ease",
            }}
          >
            <PaperPlaneTilt size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
