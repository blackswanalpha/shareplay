"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import styles from "./ChatSidebar.module.css";

interface Message {
    id: string;
    user: string;
    text: string;
    timestamp: Date;
    isHost?: boolean;
}

interface ChatSidebarProps {
    roomCode: string;
    nickname: string;
    isHost?: boolean;
    setOnlineCount?: (count: number) => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    participants: string[];
}

export default function ChatSidebar({
    roomCode,
    nickname,
    isHost = false,
    setOnlineCount,
    messages,
    onSendMessage,
    participants
}: ChatSidebarProps) {
    const [inputValue, setInputValue] = useState("");
    const [showParticipants, setShowParticipants] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue("");
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue((prev) => prev + emojiData.emoji);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={styles.sidebar}>
            {/* Header */}
            <div className={styles.header}>
                <button
                    className={`${styles.tab} ${!showParticipants ? styles.active : ""}`}
                    onClick={() => setShowParticipants(false)}
                >
                    Chat
                </button>
                <button
                    className={`${styles.tab} ${showParticipants ? styles.active : ""}`}
                    onClick={() => setShowParticipants(true)}
                >
                    People ({participants.length})
                </button>
            </div>

            {!showParticipants ? (
                <>
                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={styles.message}>
                                <div className={styles.messageHeader}>
                                    <span className={styles.userName} style={{ color: msg.user === "System" ? "#666" : undefined }}>
                                        {msg.user}
                                    </span>
                                    <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                                </div>
                                <p className={styles.messageText} style={{ fontStyle: msg.user === "System" ? "italic" : "normal" }}>
                                    {msg.text}
                                </p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={styles.inputContainer} style={{ position: "relative" }}>
                        {showEmojiPicker && (
                            <div ref={pickerRef} style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "10px", zIndex: 10 }}>
                                <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} width={300} height={400} />
                            </div>
                        )}
                        <button
                            className={styles.emojiButton}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className={styles.input}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            ) : (
                /* Participants List */
                /* Participants List */
                <div className={styles.participants}>
                    {participants.map((user, index) => (
                        <div key={index} className={styles.participantItem}>
                            <div className={styles.participantAvatar}>
                                {user.charAt(0).toUpperCase()}
                                <div className={styles.statusDot} />
                            </div>
                            <div className={styles.participantInfo}>
                                <span className={styles.participantName}>{user}</span>
                                {isHost && user === nickname && (
                                    <span className={styles.hostBadge}>You (Host)</span>
                                )}
                                {!isHost && user === nickname && (
                                    <span className={styles.youBadge}>You</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
