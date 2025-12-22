"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Smile, Mic, MicOff, Settings, ChevronLeft, ChevronRight, Crown, UserPlus, UserMinus, Users, Volume2, UserX, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import LobbyManagement from "./LobbyManagement";
import ActivityTable from "./ActivityTable";
import styles from "./ChatSidebar.module.css";

export interface Participant {
    name: string;
    imageUrl?: string;
    isHost?: boolean;
    role?: string;
    id?: string;
    email?: string;
    clerkUserId?: string;
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
    userEmail?: string;
    isHost?: boolean;
    hostEmail?: string;
    setOnlineCount?: (count: number) => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    participants: Participant[];
    // Audio props
    activeStreams?: { peerId: string; stream: MediaStream }[];
    micStatuses?: { [userName: string]: boolean };
    talkingUsers?: string[];
    isMicOn?: boolean;
    onToggleMic?: () => void;
    onOpenSettings?: () => void;
    onOpenAudioSettings?: () => void;
    // Sidebar visibility props
    isOpen?: boolean;
    onToggleSidebar?: () => void;
    // Co-host management props
    coHosts?: string[];
    onPromoteToCoHost?: (userEmail: string) => void;
    onDemoteCoHost?: (userEmail: string) => void;
    isShrunken?: boolean;
    lobbyEnabled?: boolean;
    lobbyCount?: number;
}

export default function ChatSidebar({
    roomCode,
    nickname,
    userEmail,
    isHost = false,
    hostEmail,
    setOnlineCount,
    messages,
    onSendMessage,
    participants,
    activeStreams = [],
    micStatuses = {},
    talkingUsers = [],
    isMicOn = false,
    onToggleMic,
    onOpenSettings,
    onOpenAudioSettings,
    isOpen = true,
    onToggleSidebar,
    coHosts = [],
    onPromoteToCoHost,
    onDemoteCoHost,
    isShrunken = false,
    lobbyEnabled = false,
    lobbyCount = 0
}: ChatSidebarProps) {
    const { user: currentUser } = useUser();
    const [inputValue, setInputValue] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'lobby' | 'activity'>('chat');
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

    const getUserRole = (user: Participant) => {
        // Prioritize role from backend if available
        if (user.role === 'owner' || user.role === 'host') return 'host';
        if (user.role === 'co-host' || user.role === 'cohost') return 'cohost';

        const isUserHost = user.isHost || (hostEmail && (user.name === nickname || user.email === nickname));
        const isCoHost = coHosts.includes(user.name) || (user.email && coHosts.includes(user.email));

        if (isUserHost) return 'host';
        if (isCoHost) return 'cohost';
        return 'guest';
    };

    const getUserBorderClass = (user: Participant) => {
        const role = getUserRole(user);
        const isTalking = talkingUsers.includes(user.name);

        let baseClass = '';
        switch (role) {
            case 'host':
                baseClass = styles.hostBorder;
                break;
            case 'cohost':
                baseClass = styles.coHostBorder;
                break;
            default:
                baseClass = styles.guestBorder;
        }

        return `${baseClass} ${isTalking ? styles.talkingPulse : ''}`;
    };

    const getParticipantImageUrl = (participant: Participant) => {
        // If this participant is the current user, use Clerk's image
        if (currentUser && (
            participant.name === currentUser.fullName ||
            participant.name === nickname ||
            participant.email === currentUser.primaryEmailAddress?.emailAddress ||
            participant.clerkUserId === currentUser.id
        )) {
            return currentUser.imageUrl || participant.imageUrl;
        }

        // Otherwise use the participant's imageUrl
        return participant.imageUrl;
    };

    const getParticipantDisplayName = (participant: Participant) => {
        // If this participant is the current user, use Clerk's email
        if (currentUser && (
            participant.name === currentUser.fullName ||
            participant.name === nickname ||
            participant.email === currentUser.primaryEmailAddress?.emailAddress ||
            participant.clerkUserId === currentUser.id
        )) {
            return currentUser.primaryEmailAddress?.emailAddress || participant.email || participant.name;
        }

        return participant.email || participant.name;
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
        <>
            <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''} ${isShrunken ? styles.sidebarShrunken : ''}`}>
                {/* Sidebar Toggle Button */}
                {onToggleSidebar && (
                    <div
                        className={styles.sidebarToggle}
                        onClick={onToggleSidebar}
                        title={isOpen ? "Collapse Chat" : "Expand Chat"}
                    >
                        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </div>
                )}

                {isOpen && (
                    <>
                        {/* Header with Tabs */}
                        <div className={styles.header}>
                            <div className={styles.tabs}>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'chat' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('chat')}
                                    title="Chat"
                                >
                                    <Send size={18} className="-rotate-45" />
                                    <span>Chat</span>
                                </button>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'participants' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('participants')}
                                    title="Participants"
                                >
                                    <Users size={18} />
                                    <span>People</span>
                                    <span className={styles.tabBadge}>{participants.length}</span>
                                </button>
                                {(isHost || coHosts.includes(nickname)) && lobbyEnabled && (
                                    <button
                                        className={`${styles.tabButton} ${activeTab === 'lobby' ? styles.activeTab : ''}`}
                                        onClick={() => setActiveTab('lobby')}
                                        title="Lobby"
                                    >
                                        <UserX size={18} />
                                        <span>Lobby</span>
                                        {lobbyCount > 0 && (
                                            <span className={`${styles.tabBadge} ${styles.lobbyBadge}`}>{lobbyCount}</span>
                                        )}
                                    </button>
                                )}
                                {(isHost || coHosts.includes(nickname)) && (
                                    <button
                                        className={`${styles.tabButton} ${activeTab === 'activity' ? styles.activeTab : ''}`}
                                        onClick={() => setActiveTab('activity')}
                                        title="System Presence"
                                    >
                                        <Activity size={18} />
                                        <span>Log</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {activeTab === 'participants' && (
                            <div className={styles.participantsPane}>
                                {/* Participants List */}
                                <div className={styles.scrollerContent}>
                                    {participants.map((user, index) => {
                                        const userRole = getUserRole(user);
                                        const borderClass = getUserBorderClass(user);
                                        const imageUrl = getParticipantImageUrl(user);
                                        const displayName = getParticipantDisplayName(user);
                                        return (
                                            <div key={index} className={styles.participantItem}>
                                                <div className={`${styles.participantAvatar} ${borderClass} ${imageUrl ? styles.hasImage : ''}`}>
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={displayName} />
                                                    ) : (
                                                        <div className={styles.initialsAvatar}>
                                                            {displayName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {userRole === 'host' && (
                                                        <div className={styles.crownContainer}>
                                                            <Crown size={10} fill="black" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.participantInfo}>
                                                    <span className={styles.participantName}>{displayName}</span>
                                                    <span className={styles.participantRole}>{userRole}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'lobby' && (
                            <div className={styles.lobbyPane}>
                                <LobbyManagement
                                    roomCode={roomCode}
                                    userEmail={userEmail || nickname}
                                />
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className={styles.activityPane}>
                                <ActivityTable
                                    roomCode={roomCode}
                                    userEmail={currentUser?.primaryEmailAddress?.emailAddress || ""}
                                />
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <>
                                {/* Participants Horizontal Scroller */}
                                <div className={styles.participantsScroller}>
                                    {participants.map((user, index) => {
                                        const userRole = getUserRole(user);
                                        const borderClass = getUserBorderClass(user);
                                        const imageUrl = getParticipantImageUrl(user);
                                        const displayName = getParticipantDisplayName(user);
                                        return (
                                            <div key={index} className={`${styles.participantAvatar} ${borderClass} ${imageUrl ? styles.hasImage : ''}`} title={`${displayName} (${userRole})`}>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={displayName}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#1e1e24',
                                                        borderRadius: '50%',
                                                        color: '#a78bfa',
                                                        fontWeight: 700
                                                    }}>
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {userRole === 'host' && (
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

                                            const msgImageUrl = isOwn && currentUser ? (currentUser.imageUrl || msg.imageUrl) : msg.imageUrl;
                                            const msgDisplayName = isOwn && currentUser ? (currentUser.fullName || msg.user) : msg.user;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                                                >
                                                    <div className={`${styles.participantAvatar} ${msg.isHost ? styles.hostBorder : ''} ${msgImageUrl ? styles.hasImage : ''}`} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                                        {msgImageUrl ? (
                                                            <img src={msgImageUrl} alt={msgDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                        ) : (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                background: '#1e1e24',
                                                                borderRadius: '50%',
                                                                color: '#a78bfa',
                                                                fontWeight: 700
                                                            }}>
                                                                {msgDisplayName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
                                                        <div className={styles.messageHeader}>
                                                            <div className="flex items-center gap-1">
                                                                <span className={`${styles.userName} ${msg.isHost ? styles.hostName : ''}`}>{msgDisplayName}</span>
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
                                            <Send size={18} style={{ transform: 'rotate(45deg)' }} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Controls Card */}
            <div className={styles.bottomControls}>
                {onToggleMic && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-10 w-10 p-0 ${isMicOn ? 'text-green-500' : 'text-slate-400'} hover:text-white`}
                        onClick={onToggleMic}
                        title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </Button>
                )}
                {onOpenAudioSettings && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-slate-400 hover:text-white"
                        onClick={onOpenAudioSettings}
                        title="Audio Settings"
                    >
                        <Volume2 size={20} />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-slate-400 hover:text-white"
                    onClick={onOpenSettings}
                    title="Settings"
                >
                    <Settings size={20} />
                </Button>
            </div>
        </>
    );
}
