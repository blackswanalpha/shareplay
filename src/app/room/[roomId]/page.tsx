"use client";


import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Play, Music, Gamepad2, Users, Copy, Check, ArrowLeft, Crown, MonitorPlay, LogOut, Settings, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import VideoPlayer from "@/components/room/VideoPlayer";
import MusicPlayer from "@/components/room/MusicPlayer";
import GamesSection from "@/components/room/GamesSection";
import ChatSidebar from "@/components/room/ChatSidebar";
import RoomSettingsDialog from "@/components/room/RoomSettingsDialog";
import styles from "./page.module.css";

type ActiveTab = "video" | "music" | "games";

interface RoomConfig {
    name: string;
    type: string;
    features: {
        video: boolean;
        music: boolean;
        games: boolean;
    };
    createdAt: number;
    hostId: string;
}

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const TabButton = ({ icon, label, active, onClick }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`${styles.tabButton} ${active ? styles.active : ""} `}
        >
            {icon}
            {label}
        </button>
    );
};

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const roomId = params.roomId as string;

    const [activeTab, setActiveTab] = useState<ActiveTab>("video");
    const [copied, setCopied] = useState(false);
    const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null);
    const [onlineCount, setOnlineCount] = useState(3);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);

    const [availableTabs, setAvailableTabs] = useState<ActiveTab[]>([]);

    // Centralized State
    const [messages, setMessages] = useState<any[]>([]);
    const [participants, setParticipants] = useState<string[]>([]);
    const [videoState, setVideoState] = useState({
        url: "",
        isPlaying: false,
        currentTime: 0,
        timestamp: 0
    });

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
            return;
        }

        const fetchRoomDetails = async () => {
            try {
                // Try API first
                const { api } = await import("@/lib/api");
                const room = await api.getRoom(roomId);

                const tabs: ActiveTab[] = [];
                if (room.has_video) tabs.push("video");
                if (room.has_music) tabs.push("music");
                if (room.has_games) tabs.push("games");

                setAvailableTabs(tabs);
                if (tabs.length > 0) setActiveTab(tabs[0]);

                setRoomConfig({
                    name: room.name,
                    features: { video: room.has_video, music: room.has_music, games: room.has_games },
                    createdAt: new Date(room.created_at).getTime(),
                    hostId: room.host_id.toString(),
                    type: "custom"
                });

            } catch (error) {
                console.error("Failed to fetch room from API", error);
                // Fallback logic could go here
            }
        };

        fetchRoomDetails();
    }, [roomId, router, status, session]);

    // WebSocket Logic
    useEffect(() => {
        if (!session?.user?.name) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
        const safeNickname = encodeURIComponent(session.user.name);
        const ws = new WebSocket(`${wsUrl}/ws/chat/${roomId}/${safeNickname}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to Room WebSocket");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "chat" || data.type === "system") {
                    // Deduplication check
                    setMessages(prev => {
                        if (data.id && prev.some(m => m.id === data.id)) return prev;

                        return [...prev, {
                            id: data.id || Date.now().toString() + Math.random(),
                            user: data.type === "system" ? "System" : data.user,
                            text: data.type === "system" ? data.message : data.text,
                            timestamp: new Date(data.timestamp || Date.now()),
                        }];
                    });
                } else if (data.type === "users") {
                    setParticipants(data.users);
                    setOnlineCount(data.count);
                } else if (data.type === "video_sync") {
                    // Only apply if not self (though backend usually broadcasts to all)
                    // or if we rely on backend as truth.
                    if (data.user !== session.user?.name) {
                        setVideoState({
                            url: data.url,
                            isPlaying: data.state === "playing",
                            currentTime: data.time,
                            timestamp: Date.now() // Force update
                        });
                    }
                }
            } catch (e) {
                console.warn("WebSocket Parse Error", e);
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, session?.user?.name]);

    const handleSendMessage = (text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "chat", text }));
        }
    };

    const handleVideoStateChange = (newState: any) => {
        // Merge local state immediately for responsiveness
        const updated = { ...videoState, ...newState };
        setVideoState(prev => ({ ...prev, ...newState, timestamp: Date.now() }));

        // Broadcast if connected
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "video_sync",
                state: updated.isPlaying ? "playing" : "paused",
                time: updated.currentTime,
                url: updated.url
            }));
        }
    };

    const isHost = roomConfig?.hostId === session?.user?.id;

    const copyRoomCode = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExitClick = () => {
        setShowExitConfirm(true);
    };

    const confirmExit = () => {
        router.push("/dashboard");
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    if (status === "loading" || !session) {
        return <div className={styles.room}>Loading...</div>;
    }

    return (
        <div className={styles.room}>
            {/* Header */}
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button variant="ghost" size="sm" onClick={handleExitClick}>
                        <ArrowLeft size={18} />
                    </Button>
                    <MonitorPlay size={24} className="text-pink-500" />
                    <div className={styles.roomInfo}>
                        <h1 className={styles.roomName}>{roomConfig?.name || `Room ${roomId}`}</h1>
                        {isHost && (
                            <span className={styles.hostBadge}>
                                <Crown size={12} /> HOST
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.onlineIndicator}>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>{onlineCount} Online</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyRoomCode}>
                        {copied ? <Check size={16} className={styles.successIcon} /> : <Copy size={16} />}
                        <span className="ml-2">{roomId}</span>
                    </Button>

                    {/* User Menu */}
                    <div className={styles.userMenu}>
                        <div
                            className={styles.avatar}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            {(session?.user?.name?.[0] || "U").toUpperCase()}
                        </div>

                        {showUserMenu && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.menuHeader}>
                                    <span className={styles.menuUserName}>{session?.user?.name}</span>
                                    <span className={styles.menuUserEmail}>{session?.user?.email}</span>
                                </div>
                                <button className={styles.menuItem}>
                                    <User size={16} /> Profile
                                </button>
                                <button className={styles.menuItem}>
                                    <Settings size={16} /> Settings
                                </button>
                                <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleLogout}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.contentArea}>
                    {/* Tab Navigation */}
                    <div className={styles.tabNav}>
                        {availableTabs.includes("video") && (
                            <button
                                className={`${styles.tabButton} ${activeTab === "video" ? styles.active : ""}`}
                                onClick={() => setActiveTab("video")}
                            >
                                <Play size={18} />
                                <span>Watch</span>
                            </button>
                        )}
                        {availableTabs.includes("music") && (
                            <button
                                className={`${styles.tabButton} ${activeTab === "music" ? styles.active : ""}`}
                                onClick={() => setActiveTab("music")}
                            >
                                <Music size={18} />
                                <span>Listen</span>
                            </button>
                        )}
                        {availableTabs.includes("games") && (
                            <button
                                className={`${styles.tabButton} ${activeTab === "games" ? styles.active : ""}`}
                                onClick={() => setActiveTab("games")}
                            >
                                <Gamepad2 size={18} />
                                <span>Play</span>
                            </button>
                        )}


                        {/* Settings Button */}
                        <div className={styles.settingsTab}>
                            <button
                                className={styles.tabButton}
                                onClick={() => setShowSettingsDialog(true)}
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className={styles.tabContent}>
                        {activeTab === "video" && (
                            <VideoPlayer
                                isHost={isHost}
                                videoState={videoState}
                                onStateChange={handleVideoStateChange}
                            />
                        )}
                        {activeTab === "music" && (
                            <div className={styles.comingSoon}>
                                <div className={styles.comingSoonContent}>
                                    <div className={styles.featureIcon}>
                                        <Music size={48} />
                                    </div>
                                    <h2 className={styles.comingSoonTitle}>Music Player Coming Soon</h2>
                                    <p className={styles.comingSoonDescription}>
                                        Listen to music together in perfect sync! Coming features:
                                    </p>
                                    <ul className={styles.featureList}>
                                        <li>Synchronized music playback</li>
                                        <li>Spotify and YouTube Music integration</li>
                                        <li>Collaborative playlists</li>
                                        <li>Real-time music recommendations</li>
                                        <li>Audio quality controls</li>
                                    </ul>
                                    <div className={styles.comingSoonBadge}>
                                        🎵 Stay tuned for updates!
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "games" && (
                            <div className={styles.comingSoon}>
                                <div className={styles.comingSoonContent}>
                                    <div className={styles.featureIcon}>
                                        <Gamepad2 size={48} />
                                    </div>
                                    <h2 className={styles.comingSoonTitle}>Games Area Coming Soon</h2>
                                    <p className={styles.comingSoonDescription}>
                                        Play games together with friends! Planned features:
                                    </p>
                                    <ul className={styles.featureList}>
                                        <li>Multiplayer party games</li>
                                        <li>Trivia and quiz games</li>
                                        <li>Drawing and guessing games</li>
                                        <li>Real-time leaderboards</li>
                                        <li>Custom game rooms</li>
                                    </ul>
                                    <div className={styles.comingSoonBadge}>
                                        🎮 Game on soon!
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Sidebar */}
                <ChatSidebar
                    roomCode={roomId}
                    nickname={session.user?.name || "Guest"}
                    isHost={isHost}
                    setOnlineCount={setOnlineCount}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    participants={participants}
                />
            </div>

            <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Room?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this room?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-slate-400 text-sm">
                            <AlertTriangle size={16} className="inline mr-2 text-amber-500" />
                            The music and video will ensure to stop playing for you.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowExitConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmExit} className="bg-red-600 hover:bg-red-700 text-white">
                            Leave Room
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        { roomConfig && (
            <RoomSettingsDialog
                open={showSettingsDialog}
                onOpenChange={setShowSettingsDialog}
                roomName={roomConfig.name}
                features={roomConfig.features}
                isHost={isHost}
            />
        )
}
        </div >
    );
}
