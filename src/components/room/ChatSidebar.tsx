"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Mic, MicOff, Settings, ChevronLeft, ChevronRight, Crown, UserPlus, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import styles from "./ChatSidebar.module.css";

export interface Participant {
    name: string;
    imageUrl?: string;
    isHost?: boolean;
    id?: string;
}

interface Message {
    id: string;
    user: string;
    imageUrl?: string;
    text: string;
    timestamp: Date;
    isHost?: boolean;
}

interface ChatSidebarProps {
    roomCode: string;
    nickname: string;
    isHost?: boolean;
    hostEmail?: string;
    setOnlineCount?: (count: number) => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    participants: Participant[];
    // Audio props
    activeStreams?: { peerId: string; stream: MediaStream }[];
    micStatuses?: { [userName: string]: boolean };
    isMicOn?: boolean;
    onToggleMic?: () => void;
    onOpenSettings?: () => void;
    // Sidebar visibility props
    isOpen?: boolean;
    onToggleSidebar?: () => void;
    // Co-host management props
    coHosts?: string[];
    onPromoteToCoHost?: (userEmail: string) => void;
    onDemoteCoHost?: (userEmail: string) => void;
    isShrunken?: boolean;
}

export default function ChatSidebar({
    roomCode,
    nickname,
    isHost = false,
    hostEmail,
    setOnlineCount,
    messages,
    onSendMessage,
    participants,
    activeStreams = [],
    micStatuses = {},
    isMicOn = false,
    onToggleMic,
    onOpenSettings,
    isOpen = true,
    onToggleSidebar,
    coHosts = [],
    onPromoteToCoHost,
    onDemoteCoHost,
    isShrunken = false
}: ChatSidebarProps) {
    const [inputValue, setInputValue] = useState("");
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
        const now = new Date();
        const messageDate = new Date(date); // Ensure messageDate is a Date object

        const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInSeconds < 60) return "now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const formatClockTime = (d: Date) => {
            let hours = d.getHours();
            const minutes = d.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strMinutes = minutes < 10 ? '0' + minutes : minutes;
            return `${hours}:${strMinutes} ${ampm}`;
        };

        if (diffInHours < 24 && now.getDate() === messageDate.getDate()) {
            return `today at ${formatClockTime(messageDate)}`;
        }
        
        // Check if messageDate is yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (messageDate.getDate() === yesterday.getDate() && messageDate.getMonth() === yesterday.getMonth() && messageDate.getFullYear() === yesterday.getFullYear()) {
            return `yesterday at ${formatClockTime(messageDate)}`;
        }

        // Fallback for older dates: MM/DD/YYYY HH:MM AM/PM
        const strDate = messageDate.toLocaleDateString("en-US");
        return `${strDate} ${formatClockTime(messageDate)}`;
    };

    return (
        <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''} ${isShrunken ? styles.sidebarShrunken : ''}`}>
            {!isOpen && onToggleSidebar && (
                <Button
                    variant="ghost"
                    size="sm"
                    className={`${styles.toggleButton} ${styles.toggleButtonCollapsed}`}
                    onClick={onToggleSidebar}
                    title="Expand Chat"
                >
                    <ChevronLeft size={20} />
                </Button>
            )}

            {isOpen && (
                <>
                    {/* Header with Participants Toggle/Title */}
                    <div className={styles.header}>
                        <div className={styles.participantsToggle}>
                            <div className="flex items-center gap-3">
                                <div className={styles.participantsHeaderIcon} title="People List">
                                    <Users size={18} />
                                </div>
                                <h3 className={styles.participantsTitle}>Participants ({participants.length})</h3>
                            </div>
                            <div className="flex gap-2">
                                {onToggleMic && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${isMicOn ? 'text-green-500' : 'text-slate-400'} hover:text-white`}
                                        onClick={onToggleMic}
                                        title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                                    >
                                        {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                    onClick={onOpenSettings}
                                >
                                    <Settings size={16} />
                                </Button>
                                {onToggleSidebar && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        onClick={onToggleSidebar}
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participants Horizontal Scroller */}
                    <div className={styles.participantsScroller}>
                        {participants.map((user, index) => {
                            // Check if host based on object property or fallback to name/email matching
                            const isUserHost = user.isHost || (hostEmail && user.name === nickname);
                            return (
                                <div key={index} className={styles.participantAvatar} title={user.name}>
                                    <div className={`${styles.avatarImage} ${isUserHost ? styles.hostBorder : ''}`} style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#1e1e24',
                                        overflow: 'hidden',
                                        borderRadius: '50%'   // Ensure fully rounded
                                    }}>
                                        {user.imageUrl ? (
                                            <img src={user.imageUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {isUserHost && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-[2px] shadow-sm z-10">
                                            <Crown size={10} fill="black" className="text-black" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Chat Area */}
                    <div className={styles.chatContainer}>
                        <div className={styles.messages}>
                            {messages.map((msg) => {
                                const isSystem = msg.user === "System";
                                const isOwn = msg.user === nickname;

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className={styles.systemMessage}>
                                            <div className={styles.messageBubble}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={msg.id}
                                        className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                                    >
                                        <div className={`${styles.participantAvatar} ${msg.isHost ? styles.hostBorder : ''}`} style={{ width: 32, height: 32, fontSize: '0.8rem', overflow: 'hidden' }}>
                                            {msg.imageUrl ? (
                                                <img src={msg.imageUrl} alt={msg.user} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            ) : (
                                                msg.user.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
                                            <div className={styles.messageHeader}>
                                                <div className="flex items-center gap-1">
                                                    <span className={`${styles.userName} ${msg.isHost ? styles.hostName : ''}`}>{msg.user}</span>
                                                    {msg.isHost && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                                                </div>
                                                <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                                            </div>
                                            <div className={styles.messageBubble}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className={styles.inputContainer}>
                            <button
                                className={styles.emojiButton}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile size={20} className="text-slate-400 hover:text-white transition-colors" />
                            </button>

                            {showEmojiPicker && (
                                <div className={styles.emojiPickerContainer} ref={pickerRef}>
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        theme={Theme.DARK}
                                        width={300}
                                        height={400}
                                    />
                                </div>
                            )}

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
                    </div>
                </>
            )}
        </div>
    );
}
