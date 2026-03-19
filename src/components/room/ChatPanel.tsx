"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useAtomValue, useSetAtom } from "jotai";
import { messagesAtom, chatInputAtom } from "@/store/roomAtoms";
import { useAuth } from "@/providers/AuthProvider";
import type { SocketActions } from "@/hooks/useSocket";
import { ReactionFloatingButton, ChatInputEmojiPicker } from "./EmojiReactionPicker";

interface ChatPanelProps {
  actions: SocketActions;
}

export function ChatPanel({ actions }: ChatPanelProps) {
  const messages = useAtomValue(messagesAtom);
  const chatInput = useAtomValue(chatInputAtom);
  const setChatInput = useSetAtom(chatInputAtom);
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

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

  const handleReaction = useCallback(
    (msgId: string, emoji: string) => {
      actions.addReaction(msgId, emoji);
    },
    [actions]
  );

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
                position: "relative",
              }}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  maxWidth: "90%",
                  flexDirection: msg.sender.id === user?.id ? "row-reverse" : "row",
                }}
              >
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
                    flex: "0 1 auto",
                    minWidth: 0,
                  }}
                >
                  {msg.text}
                </p>
                <div
                  style={{
                    opacity: hoveredMsgId === msg.id ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    pointerEvents: hoveredMsgId === msg.id ? "auto" : "none",
                  }}
                >
                  <ReactionFloatingButton
                    onSelect={(emoji) => handleReaction(msg.id, emoji)}
                  />
                </div>
              </div>

              {/* Reaction pills */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    maxWidth: "85%",
                  }}
                >
                  {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                    const isActive = user?.id ? userIds.includes(user.id) : false;
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                          lineHeight: 1.5,
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(255,66,66,0.15)"
                            : "rgba(255,255,255,0.05)",
                          border: isActive
                            ? "1px solid rgba(255,66,66,0.3)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: "#ddd",
                          fontFamily: "var(--font-inter), sans-serif",
                          transition: "background 0.15s, border-color 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 8 }}>{emoji}</span>
                        <span>{userIds.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
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
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "12px 84px 12px 16px",
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
          <div
            style={{
              position: "absolute",
              right: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChatInputEmojiPicker
              onSelect={(emoji) => {
                setChatInput((prev) => prev + emoji);
                inputRef.current?.focus();
              }}
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              style={{
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
    </div>
  );
}
