"use client";


import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Play, Music, Gamepad2, Users, Copy, Check, ArrowLeft, Crown, MonitorPlay, LogOut, Settings, User, AlertTriangle, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import VideoPlayer from "@/components/room/VideoPlayer";
import MusicPlayer from "@/components/room/MusicPlayer";
import GamesSection from "@/components/room/GamesSection";
import ChatSidebar, { Participant } from "@/components/room/ChatSidebar";
import LobbyPage from "@/components/room/LobbyPage";
import RoomSettingsDialog from "@/components/room/RoomSettingsDialog";
import RoomHeader from "@/components/room/RoomHeader";
import RoomMainContent from "@/components/room/RoomMainContent";
import AudioSettings from "@/components/room/AudioSettings";
import { useWebRTCMesh } from "@/hooks/useWebRTCMesh";
import { sessionManager } from "@/lib/sessionManager";
import { api } from "@/lib/api";
import { AudioProcessor, createEnhancedAudioStream } from "@/lib/audioProcessor";
import { type Room } from "@/lib/api";
import { VideoPlaylistState } from "@/components/room/VideoPlayer"; // Import VideoPlaylistState
import styles from "./page.module.css";

type ActiveTab = "video" | "music" | "games";

export interface RoomConfig {
    id: number;
    name: string;
    type: string;
    features: {
        chat: boolean;
        video: boolean;
        music: boolean;
        games: boolean;
    };
    createdAt: number;
    hostId: string;
    hostEmail?: string;
    coHosts?: string[]; // Array of co-host emails
    lobbyEnabled?: boolean;
    isHost?: boolean;
}
export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const roomId = params.roomId as string;
    const [activeTab, setActiveTab] = useState<ActiveTab>("video");
    const [copied, setCopied] = useState(false);
    const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showEndRoomConfirm, setShowEndRoomConfirm] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showAudioSettings, setShowAudioSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmitted, setIsAdmitted] = useState(true);
    const [lobbyCount, setLobbyCount] = useState(0);
    const [availableTabs, setAvailableTabs] = useState<ActiveTab[]>([]);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    // Voice Chat State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(false);
    const [audioProcessor] = useState(() => new AudioProcessor());
    const [audioQuality, setAudioQuality] = useState<'basic' | 'enhanced'>('enhanced');
    // Centralized State
    const [messages, setMessages] = useState<{ id: string; user: string; text: string; timestamp: Date }[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [micStatuses, setMicStatuses] = useState<{ [userName: string]: boolean }>({});
    const [sessionRestored, setSessionRestored] = useState(false);
    const [restoredData, setRestoredData] = useState<{
        chatMessages: number;
        videoState: boolean;
        musicState: boolean;
    }>({ chatMessages: 0, videoState: false, musicState: false });
    const [videoState, setVideoState] = useState({
        url: "",
        isPlaying: false,
        currentTime: 0,
        timestamp: 0
    });

    const [videoPlaylistState, setVideoPlaylistState] = useState<VideoPlaylistState>({
        playlist: [],
        current_index: 0,
        loop: false,
        shuffle: false,
    });

    const [musicState, setMusicState] = useState({
        track: null,
        isPlaying: false,
        currentTime: 0,
        volume: 0.75,
        timestamp: 0
    });

    // Unified user identifier used for WebSocket, WebRTC, and UI identification
    const currentUserIdentifier = useMemo(() =>
        user?.primaryEmailAddress?.emailAddress || user?.fullName || 'Guest',
        [user?.primaryEmailAddress?.emailAddress, user?.fullName]
    );

    const isHost = Boolean(roomConfig?.isHost || (roomConfig?.hostEmail && user?.primaryEmailAddress?.emailAddress === roomConfig.hostEmail));
    const isCoHost = roomConfig?.coHosts?.includes(user?.primaryEmailAddress?.emailAddress || '') || false;
    const isHostOrCoHost = isHost || isCoHost;

    // Helper function to format departure messages
    const getDepartureMessage = (username: string, departureType: string, sessionDuration?: number): string => {
        const durationStr = sessionDuration
            ? ` (was here for ${Math.floor(sessionDuration / 60)}min ${sessionDuration % 60}s)`
            : '';

        switch (departureType) {
            case 'disconnect':
                return `${username} disconnected${durationStr}`;
            case 'kicked':
                return `${username} was kicked from the room`;
            case 'banned':
                return `${username} was banned from the room`;
            case 'left':
                return `${username} left the room${durationStr}`;
            case 'timeout':
                return `${username} timed out${durationStr}`;
            case 'websocket_error':
                return `${username} lost connection`;
            default:
                return `${username} left the room`;
        }
    };

    const wsRef = useRef<WebSocket | null>(null);
    const fetchRoomDetailsRef = useRef<(() => Promise<Room | null>) | undefined>(undefined);
    const isLeavingRoomRef = useRef(false);
    const initializedRoomIdRef = useRef<string | null>(null);

    // Extract fetchRoomDetails to be reusable
    const fetchRoomDetails = useCallback(async (): Promise<Room | null> => {
        try {
            // Try API first
            const { api } = await import("@/lib/api");
            const userEmail = currentUserIdentifier;
            const room = await api.getRoom(roomId, userEmail);

            const tabs: ActiveTab[] = [];
            if (room.has_video) tabs.push("video");
            if (room.has_music) tabs.push("music");
            if (room.has_games) tabs.push("games");

            setAvailableTabs(tabs);
            if (tabs.length > 0) setActiveTab(tabs[0]);

            setRoomConfig({
                id: room.id,
                name: room.name,
                features: { chat: true, video: room.has_video, music: room.has_music, games: room.has_games },
                createdAt: new Date(room.created_at).getTime(),
                hostId: room.host_id.toString(),
                hostEmail: room.host_email,
                coHosts: room.co_hosts || [],
                lobbyEnabled: room.lobby_enabled,
                isHost: room.is_host,
                type: "custom"
            });

            // After setting room config, request current video state if we're not the host
            const isCurrentUserHost = room.is_host ?? (room.host_email === user?.primaryEmailAddress?.emailAddress);
            const isCurrentUserCoHost = room.co_hosts?.includes(user?.primaryEmailAddress?.emailAddress || '') || false;

            // Update user role in online users list if they are already there
            // This is just a local optimistic update, the real source of truth is the WebSocket
            setOnlineCount(prev => prev); // Trigger re-render

            // Notify backend about our presence (HTTP fallback/init)
            try {
                // If we are joining as a new user, we might want to announce it
                // But typically WebSocket handles this. 
                // However, for initial state, we just fetched the room.

                // Track usage
                api.trackRoomJoin(roomId, {
                    user_email: user?.primaryEmailAddress?.emailAddress || 'guest',
                    requesting_user: user?.fullName || 'Guest'
                }).catch((err: any) => console.error("Tracking error:", err));

            } catch (e) {
                // Ignore tracking errors
            }

            if (!isCurrentUserHost && room.lobby_enabled) {
                // If lobby is enabled and we're not the host, check our status
                // We default to false (waiting) only if status is not explicitly 'admitted'
                if (room.current_user_status === 'admitted') {
                    setIsAdmitted(true);
                } else if (room.current_user_status === 'denied') {
                    alert("You have been denied access to this room.");
                    router.push("/dashboard");
                    return null;
                } else {
                    setIsAdmitted(false);
                }
            }

            // Sync video state if needed (and we are not host)
            if (!isCurrentUserHost && room.current_video_url) {
                // ... sync logic
            }

            if (!isCurrentUserHost) {


                // Final fallback after 3 seconds if no video is loaded
                setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN && !videoStateRef.current.url) {
                        wsRef.current.send(JSON.stringify({
                            type: "request_video_state",
                            requesting_user: user?.fullName || 'Guest'
                        }));
                    }
                }, 3000);
            }

            // If host/co-host, fetch lobby count
            if (isCurrentUserHost || (room.co_hosts || []).includes(user?.primaryEmailAddress?.emailAddress || '')) {
                if (room.lobby_enabled) {
                    api.getLobbyUsers(roomId, user?.primaryEmailAddress?.emailAddress || '').then(users => {
                        setLobbyCount(users.length);
                    }).catch(err => console.error("Lobby fetch error:", err));
                }
            }

            return room;
        } catch (error) {
            console.error("Failed to fetch room from API", error);
            // Fallback logic could go here
            return null;
        }
    }, [roomId, user?.id]); // Removed videoState.url dependency to break the loop

    // Update the ref whenever the function changes
    useEffect(() => {
        fetchRoomDetailsRef.current = fetchRoomDetails;
    }, [fetchRoomDetails]);

    const handleVideoPlaylistChange = useCallback((newPlaylistState: VideoPlaylistState, shouldSync: boolean = true) => {
        setVideoPlaylistState(newPlaylistState);

        if (isHostOrCoHost && shouldSync) {
            const syncMessage = {
                type: "video_sync",
                state: videoState.isPlaying ? "playing" : "paused",
                time: videoState.currentTime,
                url: videoState.url,
                sync_timestamp: Date.now(),
                is_host: isHost,
                from_host: isHostOrCoHost,
                extended_state: {
                    playlist: newPlaylistState.playlist,
                    current_index: newPlaylistState.current_index,
                    loop: newPlaylistState.loop,
                    shuffle: newPlaylistState.shuffle,
                }
            };
            // Send via WebRTC Data Channel (Low Latency)
            broadcastData(syncMessage);

            // Also send via WebSocket as fallback/redundancy
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(syncMessage));
            }
        }
    }, [isHostOrCoHost, videoState.isPlaying, videoState.currentTime, videoState.url]);

    useEffect(() => {
        if (isLeavingRoomRef.current) {
            console.log("RoomPage useEffect: isLeavingRoomRef is true, preventing initialization.");
            return; // Prevent further execution if we are intentionally leaving
        }

        if (isLoaded && !user) {
            router.push("/");
            return;
        }

        const initializeRoom = async () => {
            // First fetch room details
            let room;
            try {
                room = await fetchRoomDetails();
            } catch (error: any) {
                console.error("Failed to fetch room details:", error);
                if (error.message?.includes("Room") && error.message?.includes("not found")) {
                    alert("This room no longer exists or has been deleted.");
                    router.push("/dashboard");
                    return;
                }
                throw error; // Re-throw other errors
            }

            // Then restore session if user is authenticated
            if (user?.primaryEmailAddress?.emailAddress && room) {
                try {
                    const numericRoomId = room.id;

                    // Set auth token for session manager
                    const token = await api.getTokenForEmail(user.primaryEmailAddress.emailAddress, user.fullName);
                    sessionManager.setAuthToken(token);

                    // Join room and restore session data (validates access)
                    const sessionData = await sessionManager.joinRoom(numericRoomId);

                    if (sessionData) {
                        // Load chat history from the database
                        try {
                            // Clear any existing messages first to prevent contamination
                            setMessages([]);

                            const chatHistory = await sessionManager.getChatHistory(numericRoomId, 50);
                            if (chatHistory && chatHistory.length > 0) {
                                const restoredMessages = chatHistory.map(msg => ({
                                    id: msg.id.toString(),
                                    user: msg.username,
                                    text: msg.message,
                                    timestamp: new Date(msg.timestamp),
                                    roomId: numericRoomId.toString(), // Add room tracking
                                })).reverse(); // Reverse to show oldest first

                                setMessages(restoredMessages);
                                setRestoredData(prev => ({ ...prev, chatMessages: restoredMessages.length }));
                                console.log(`Restored ${restoredMessages.length} chat messages for room ${numericRoomId}`);
                            }
                        } catch (error) {
                            console.error('Failed to load chat history:', error);
                        }

                        // Restore video state
                        const restoredVideoState = sessionManager.restoreVideoState(sessionData.sync_states || []);
                        if (restoredVideoState) {
                            setVideoState({
                                url: restoredVideoState.url,
                                isPlaying: restoredVideoState.isPlaying,
                                currentTime: restoredVideoState.currentTime,
                                timestamp: Date.now(),
                            });
                            setVideoPlaylistState(restoredVideoState.playlistState);
                            setRestoredData(prev => ({ ...prev, videoState: true }));
                        }

                        // Restore music state
                        const musicSyncState = sessionData.sync_states?.find(s => s.sync_type === 'music');
                        if (musicSyncState) {
                            setMusicState({
                                track: musicSyncState.extended_state?.track || null,
                                isPlaying: musicSyncState.is_playing,
                                currentTime: musicSyncState.current_time,
                                volume: musicSyncState.volume,
                                timestamp: Date.now(),
                            });
                            setRestoredData(prev => ({ ...prev, musicState: true }));
                        }

                        // Restore user preferences
                        if (sessionData.session) {
                            // Could set preferred volume, notification preferences, etc.
                            console.log('Session restored:', sessionData.session);
                            setSessionRestored(true);

                            // Hide restoration notification after 5 seconds
                            setTimeout(() => setSessionRestored(false), 5000);
                        }
                    }
                } catch (error: any) {
                    console.error('Failed to restore session:', error);

                    // Handle specific access control errors
                    if (error.message?.includes("Access denied") || error.message?.includes("403")) {
                        alert("You cannot access this room. You may have already left it or been removed.");
                        router.push("/dashboard");
                        return;
                    }

                    // Handle room not found
                    if (error.message?.includes("404") || error.message?.includes("Room not found")) {
                        alert("This room no longer exists.");
                        router.push("/dashboard");
                        return;
                    }

                    // Continue without session restoration for other errors
                }
            }
        };

        if (!isLoaded || !user) return;
        if (initializedRoomIdRef.current === roomId) return;

        initializedRoomIdRef.current = roomId;
        initializeRoom();
    }, [isLoaded, router, user, roomId]);

    // Refs for accessing up-to-date state inside WebSocket callbacks without dependency loops
    const videoStateRef = useRef(videoState);
    const videoPlaylistStateRef = useRef(videoPlaylistState); // Add ref for playlist state
    const musicStateRef = useRef(musicState);
    const paramsRef = useRef(params);
    const userRef = useRef(user);
    const roomConfigRef = useRef(roomConfig); // Added to track roomConfig for isHost check

    // Sync message deduplication tracking
    const lastSyncSequenceRef = useRef<{ [key: string]: number }>({});
    const pendingSyncTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // Helper function to process sync messages with deduplication
    const processSyncMessage = useCallback((data: any, source: 'websocket' | 'webrtc') => {
        if (!data.from_host) return; // Only process host sync messages

        const syncType = data.type.replace('_sync', '');
        const sequenceId = data.sequence_id || data.sync_timestamp;
        const lastSequence = lastSyncSequenceRef.current[syncType] || 0;

        // Skip if we've already processed this or newer sequence
        if (sequenceId <= lastSequence) {
            console.log(`Skipping duplicate ${syncType} sync from ${source} (seq: ${sequenceId}, last: ${lastSequence})`);
            return;
        }

        // Clear any pending timeout for this sync type
        if (pendingSyncTimeoutRef.current[syncType]) {
            clearTimeout(pendingSyncTimeoutRef.current[syncType]);
        }

        // Apply sync immediately for critical changes, or delay for small changes
        const isImportantChange = data.transport?.includes('backup') || data.state !== videoState.isPlaying;
        const applyDelay = source === 'websocket' && !isImportantChange ? 25 : 0;

        const applySync = () => {
            lastSyncSequenceRef.current[syncType] = sequenceId;

            if (syncType === 'video') {
                setVideoState(prev => ({
                    url: data.url || prev.url,
                    isPlaying: data.state === "playing" || data.state === "buffering",
                    currentTime: data.time || 0,
                    timestamp: Date.now()
                }));
                if (data.extended_state) {
                    setVideoPlaylistState(data.extended_state);
                }
            } else if (syncType === 'music') {
                setMusicState(prev => ({
                    track: data.track || prev.track,
                    isPlaying: data.state === "playing" || data.state === "buffering",
                    currentTime: data.time || 0,
                    volume: data.volume !== undefined ? data.volume : prev.volume,
                    timestamp: Date.now()
                }));
            }
        };

        if (applyDelay > 0) {
            pendingSyncTimeoutRef.current[syncType] = setTimeout(applySync, applyDelay);
        } else {
            applySync();
        }
    }, [videoState.isPlaying]);

    useEffect(() => {
        videoStateRef.current = videoState;
    }, [videoState]);

    useEffect(() => {
        videoPlaylistStateRef.current = videoPlaylistState; // Update ref for playlist state
    }, [videoPlaylistState]);

    useEffect(() => {
        musicStateRef.current = musicState;
    }, [musicState]);

    useEffect(() => {
        paramsRef.current = params;
        userRef.current = user;
    }, [params, user]);

    useEffect(() => {
        roomConfigRef.current = roomConfig;
    }, [roomConfig]);

    const lastWsUrlRef = useRef<string | null>(null);

    // WebSocket Logic
    useEffect(() => {
        if (!user?.id || !roomId) return;

        const connectWebSocket = () => {
            if (!isLoaded || !user) {
                console.log("[Frontend Debug] connectWebSocket skipped: User not loaded yet.");
                return;
            }

            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
            // Use unified identifier
            const userName = currentUserIdentifier;
            const safeNickname = encodeURIComponent(userName);
            const userImage = encodeURIComponent(user?.imageUrl || "");
            const connectionId = Math.random().toString(36).substring(7);
            const fullUrl = `${wsUrl}/ws/chat/${roomId}/${safeNickname}?imageUrl=${userImage}&cid=${connectionId}`;

            console.log(`[Frontend Debug] connectWebSocket called. user=${user?.primaryEmailAddress?.emailAddress}, roomId=${roomId}`);

            // Prevent redundant connections if URL hasn't changed
            const existingWs = wsRef.current;
            if (lastWsUrlRef.current === fullUrl && existingWs && existingWs.readyState < 2) {
                return;
            }

            // If there's an existing connection that's different, close it first
            if (existingWs && existingWs.readyState < 2) {
                existingWs.close(1000, "New connection starting");
            }

            lastWsUrlRef.current = fullUrl;
            console.log(`[Frontend Debug] Connecting to WebSocket: ${fullUrl}`);

            const ws = new WebSocket(fullUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (wsRef.current !== ws) {
                    console.log(`[Frontend Debug] Old WebSocket connection ID ${connectionId} opened, closing because newer one exists.`);
                    ws.close(1000, "Superseded");
                    return;
                }
                console.log(`[Frontend Debug] Connected to Room WebSocket for room: ${roomId} (ID: ${connectionId})`);
                setIsConnected(true);

                ws.send(JSON.stringify({
                    type: "request_video_state",
                    requesting_user: userName
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "chat" || data.type === "system") {
                        // Enhanced deduplication check
                        setMessages(prev => {
                            // Check for duplicate by ID
                            if (data.id && prev.some(m => m.id === data.id)) {
                                return prev;
                            }

                            // Check for duplicate by content and timestamp (for messages without ID)
                            const newMessage = {
                                id: data.id || `${Date.now()}-${Math.random()}`,
                                user: data.type === "system" ? "System" : data.username,
                                imageUrl: data.userImage, // Map userImage from signal
                                text: data.message,
                                timestamp: new Date(data.timestamp || Date.now()),
                                roomId: roomId, // Add current room tracking
                                isHost: data.isHost // Handle isHost flag if backend sends it
                            };

                            // Check if similar message exists (same user, text, within 1 second)
                            const isDuplicate = prev.some(m =>
                                m.user === newMessage.user &&
                                m.text === newMessage.text &&
                                Math.abs(m.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000
                            );

                            if (isDuplicate) {
                                return prev;
                            }

                            return [...prev, newMessage];
                        });
                    } else if (data.type === "users") {
                        // Handle array of strings or objects
                        const usersList = data.users.map((u: any) => {
                            if (typeof u === 'string') return { name: u };
                            return {
                                name: u.name || u.username,
                                imageUrl: u.imageUrl,
                                isHost: u.isHost,
                                role: u.role
                            };
                        });
                        setParticipants(usersList);
                        setOnlineCount(data.count);
                    } else if (data.type === "mic_status_update") {
                        // Update mic statuses for all users
                        setMicStatuses(data.mic_statuses || {});
                    } else if (data.type === "signal") {
                        // WebRTC Signaling
                        // Use ref to ensure we use the latest handleSignal which has the open socket
                        handleSignalRef.current(data.user, data.signal);
                    } else if (data.type === "video_sync") {
                        // Use the deduplicated sync processor
                        processSyncMessage(data, 'websocket');
                    } else if (data.type === "music_sync") {
                        // Use the deduplicated sync processor
                        processSyncMessage(data, 'websocket');
                    } else if (data.type === "request_video_state") {
                        // Host should respond with current video state when requested
                        const currentVideoState = videoStateRef.current;
                        const currentVideoPlaylistState = videoPlaylistStateRef.current; // Get current playlist state
                        const currentRoomConfig = roomConfigRef.current;
                        const currentUser = userRef.current;
                        const isCurrentUserHost = currentRoomConfig?.hostEmail === currentUser?.primaryEmailAddress?.emailAddress;

                        if (isCurrentUserHost && currentVideoState.url) {
                            wsRef.current?.send(JSON.stringify({
                                type: "video_state_response",
                                state: currentVideoState.isPlaying ? "playing" : "paused",
                                time: currentVideoState.currentTime,
                                url: currentVideoState.url,
                                is_host: true, // Backend will verify this
                                extended_state: currentVideoPlaylistState // Include playlist state
                            }));
                        }
                    } else if (data.type === "chat_cleared") {
                        setMessages([]);
                    } else if (data.type === "room_state_update") {
                        // Handle room state updates to refresh component state
                        if (data.update_type === "settings_changed" || data.update_type === "host_changed") {
                            // Refetch room details to update state
                            fetchRoomDetailsRef.current?.();
                        }
                    } else if (data.type === "room_ending") {
                        // Handle room ending notification - clean up everything
                        console.log("Room ending:", data.message);

                        // Set flag to prevent reconnection attempts
                        isLeavingRoomRef.current = true;

                        // Clear messages to prevent cross-room contamination
                        setMessages([]);

                        // Clean up local streams
                        if (localStream) {
                            localStream.getTracks().forEach(track => track.stop());
                            setLocalStream(null);
                        }

                        // Close WebSocket connection
                        if (wsRef.current) {
                            wsRef.current.close(1000, "Room ended by host");
                        }

                        // Save current session state if possible (async without await to avoid blocking)
                        if (userRef.current?.primaryEmailAddress?.emailAddress && roomConfig) {
                            const currentVideoTime = videoState.currentTime;
                            const currentMusicTime = musicState.currentTime;
                            sessionManager.leaveRoom(roomConfig.id, currentVideoTime, currentMusicTime)
                                .catch(error => console.error('Failed to save session on room end:', error));
                        }

                        // Show notification and redirect
                        alert(data.message || "The room has been ended by the host.");
                        router.push("/dashboard");
                    } else if (data.type === "cohost_promoted") {
                        // Handle co-host promotion
                        if (data.userEmail === userRef.current?.primaryEmailAddress?.emailAddress) {
                            // Current user was promoted
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                user: "System",
                                text: "You have been promoted to co-host!",
                                timestamp: new Date()
                            }]);
                        }
                        // Update room config
                        setRoomConfig(prev => prev ? {
                            ...prev,
                            coHosts: [...(prev.coHosts || []), data.userEmail]
                        } : null);
                    } else if (data.type === "cohost_demoted") {
                        // Handle co-host demotion
                        if (data.userEmail === userRef.current?.primaryEmailAddress?.emailAddress) {
                            // Current user was demoted
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                user: "System",
                                text: "You have been demoted from co-host.",
                                timestamp: new Date()
                            }]);
                        }
                        // Update room config
                        setRoomConfig(prev => prev ? {
                            ...prev,
                            coHosts: (prev.coHosts || []).filter(email => email !== data.userEmail)
                        } : null);
                    } else if (data.type === "lobby_status") {
                        // User received an update about their lobby status
                        if (data.status === "admitted") {
                            setIsAdmitted(true);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                user: "System",
                                text: "You have been admitted to the room!",
                                timestamp: new Date()
                            }]);
                            // Request state now that we are admitted
                            wsRef.current?.send(JSON.stringify({
                                type: "request_video_state",
                                requesting_user: currentUserIdentifier
                            }));
                        } else if (data.status === "denied") {
                            alert("Your request to join this room was denied.");
                            router.push("/dashboard");
                        }
                    } else if (data.type === "lobby_update") {
                        // Host/co-host received notification about lobby changes
                        if (isHostOrCoHost) {
                            api.getLobbyUsers(roomId, user?.primaryEmailAddress?.emailAddress || '').then(users => {
                                setLobbyCount(users.length);
                            }).catch(err => console.error("Lobby update fetch error:", err));
                        }
                    } else if (data.type === "user_departed") {
                        // Handle user departure notification
                        console.log(`[Departure] ${data.username} left: ${data.departure_type} - ${data.departure_reason}`);

                        // Add a system message about the departure
                        const departureMessage = getDepartureMessage(data.username, data.departure_type, data.session_duration_seconds);
                        setMessages(prev => {
                            // Check for duplicate
                            const isDuplicate = prev.some(m =>
                                m.user === "System" &&
                                m.text === departureMessage &&
                                Math.abs(m.timestamp.getTime() - Date.now()) < 2000
                            );
                            if (isDuplicate) return prev;

                            return [...prev, {
                                id: `departure-${data.username}-${Date.now()}`,
                                user: "System",
                                text: departureMessage,
                                timestamp: new Date(data.departed_at || Date.now())
                            }];
                        });

                        // Remove the user from participants list
                        setParticipants(prev => prev.filter(p => p.name !== data.username));
                        setOnlineCount(prev => Math.max(0, prev - 1));
                    }
                } catch (e) {
                    console.warn("WebSocket Parse Error", e);
                }
            };

            ws.onclose = (event) => {
                console.log(`[Frontend Debug] WebSocket closed (ID: ${connectionId})`, event.code, event.reason);

                // Only handle this close event if it's coming from our "current" socket
                if (wsRef.current === ws) {
                    setIsConnected(false);
                    wsRef.current = null;
                    // Only attempt to reconnect if not intentionally leaving the room
                    if (!event.wasClean && !isLeavingRoomRef.current) {
                        setTimeout(() => {
                            // Re-check current state before reconnecting
                            if (wsRef.current === null && !isLeavingRoomRef.current) {
                                console.log("[Frontend Debug] Attempting to reconnect...");
                                connectWebSocket();
                            }
                        }, 3000);
                    }
                } else {
                    console.log(`[Frontend Debug] Ignoring onclose for superseded socket ID: ${connectionId}`);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                console.error("WebSocket URL:", `${wsUrl}/ws/chat/${roomId}/${safeNickname}`);
                console.error("WebSocket readyState:", ws.readyState);
                setIsConnected(false);
            };
        };

        connectWebSocket();

        return () => {
            console.log("[Frontend Debug] Cleaning up WebSocket effect. User ID or Room ID changed.");
            if (wsRef.current) {
                wsRef.current.close(1000, "Cleanup");
                wsRef.current = null;
            }
            setIsConnected(false);
        };
    }, [isLoaded, user?.id, roomId]); // Use stable values instead of params object


    // We need a workaround for the circular dependency.
    // Let's use a Ref for the broadcast function.
    const broadcastDataRef = useRef<(data: any) => void>(() => { });
    // Also use a Ref for handleSignal to avoid stale closures in ws.onmessage
    const handleSignalRef = useRef<(user: string, signal: any) => void>(() => { });

    // Redefine handlePeerConnected to actually USE the broadcastDataRef
    const onPeerConnectAction = useCallback((peerId: string) => {
        const currentRoomConfig = roomConfigRef.current;
        const currentUser = userRef.current;
        const currentVideoState = videoStateRef.current;
        const currentUserEmail = currentUser?.primaryEmailAddress?.emailAddress || "";
        const isCurrentUserHost = currentRoomConfig?.hostEmail === currentUserEmail;
        const isCurrentUserCoHost = currentRoomConfig?.coHosts?.includes(currentUserEmail) || false;

        if ((isCurrentUserHost || isCurrentUserCoHost) && currentVideoState?.url) {
            console.log(`WebRTC: Sending initial sync to ${peerId}`);
            const syncMessage = {
                type: "video_sync",
                state: currentVideoState.isPlaying ? "playing" : "paused",
                time: currentVideoState.currentTime,
                url: currentVideoState.url,
                sync_timestamp: Date.now(),
                is_host: isCurrentUserHost,
                from_host: true,
                extended_state: videoPlaylistStateRef.current // Include playlist state
            };
            broadcastDataRef.current(syncMessage);
        }
    }, []);

    // Initialize WebRTC Mesh
    const participantNames = useMemo(() => participants.map(p => p.name), [participants]);

    const { handleSignal, broadcastData, onData, remoteStreams } = useWebRTCMesh({
        socket: isConnected ? wsRef.current : null,
        roomCode: roomId,
        currentUser: currentUserIdentifier,
        participants: participantNames,
        localStream,
        onPeerConnected: onPeerConnectAction
    });

    // Update refs
    useEffect(() => {
        broadcastDataRef.current = broadcastData;
        handleSignalRef.current = handleSignal;
    }, [broadcastData, handleSignal]);

    // WebRTC Data Listener with deduplication
    useEffect(() => {
        onData((data) => {
            // Handle incoming WebRTC data using the same deduplication logic
            if (data.type === "video_sync") {
                processSyncMessage(data, 'webrtc');
            } else if (data.type === "music_sync") {
                processSyncMessage(data, 'webrtc');
            }
        });
    }, [onData, processSyncMessage]);

    const toggleMic = async () => {
        try {
            if (isMicOn) {
                // Turn off microphone
                try {
                    if (localStream) {
                        localStream.getTracks().forEach(track => {
                            try {
                                track.stop();
                            } catch (e) {
                                console.warn('Error stopping track:', e);
                            }
                        });
                        setLocalStream(null);
                    }
                } catch (e) {
                    console.warn('Error stopping local stream:', e);
                }

                try {
                    audioProcessor.cleanup();
                } catch (e) {
                    console.warn('Error cleaning up audio processor:', e);
                }

                setIsMicOn(false);

                // Broadcast mic off status (non-blocking)
                try {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: "mic_status",
                            user: currentUserIdentifier,
                            isMicOn: false
                        }));
                    }
                } catch (e) {
                    console.warn('Error broadcasting mic status:', e);
                }
            } else {
                // Turn on microphone
                // Check if getUserMedia is available
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("getUserMedia is not supported in this browser");
                }

                let stream: MediaStream | null = null;

                if (audioQuality === 'enhanced') {
                    // Try enhanced audio processing first
                    try {
                        stream = await createEnhancedAudioStream(audioProcessor);
                        if (stream) {
                            console.log("Enhanced audio processing enabled");
                        }
                    } catch (enhancedError) {
                        console.warn("Enhanced audio failed, falling back to basic:", enhancedError);
                    }
                }

                // Fallback to basic audio if enhanced failed or not requested
                if (!stream) {
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                autoGainControl: true,
                                // Additional constraints for better quality
                                sampleRate: 48000,
                                channelCount: 1,
                                volume: 1.0,
                                // Chrome-specific enhancements
                                googEchoCancellation: true,
                                googAutoGainControl: true,
                                googNoiseSuppression: true,
                                googHighpassFilter: true,
                                googTypingNoiseDetection: true
                            } as MediaTrackConstraints
                        });
                        console.log("Basic audio processing enabled");
                    } catch (basicError) {
                        // Final fallback with minimal constraints
                        console.warn("Advanced constraints failed, using basic:", basicError);
                        stream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                autoGainControl: true
                            }
                        });
                    }
                }

                if (stream) {
                    setLocalStream(stream);
                    setIsMicOn(true);

                    // Broadcast mic on status (non-blocking)
                    try {
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(JSON.stringify({
                                type: "mic_status",
                                user: currentUserIdentifier,
                                isMicOn: true
                            }));
                        }
                    } catch (e) {
                        console.warn('Error broadcasting mic status:', e);
                    }

                    console.log("Microphone enabled successfully with", audioQuality, "processing");
                } else {
                    throw new Error("Failed to obtain audio stream");
                }
            }
        } catch (err: any) {
            console.error("Failed to toggle microphone:", err);

            // Reset state on error to ensure UI consistency
            setIsMicOn(false);
            if (localStream) {
                try {
                    localStream.getTracks().forEach(track => track.stop());
                    setLocalStream(null);
                } catch (e) {
                    console.warn('Error cleaning up on toggle error:', e);
                }
            }

            // Show user-friendly error based on error type
            let errorMessage = "Failed to access microphone";
            if (err.name === 'NotAllowedError') {
                errorMessage = "Microphone access denied. Please allow microphone permissions and try again.";
            } else if (err.name === 'NotFoundError') {
                errorMessage = "No microphone found. Please check your audio devices.";
            } else if (err.name === 'NotReadableError') {
                errorMessage = "Microphone is already in use by another application.";
            } else if (err.message) {
                errorMessage = `Failed to access microphone: ${err.message}`;
            }

            alert(errorMessage);
        }
    };

    const handleSendMessage = (text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "chat", text }));
        }
    };

    const handleVideoStateChange = (newState: Partial<{ url: string; isPlaying: boolean; currentTime: number }>, shouldSync: boolean = true) => {
        // Merge local state immediately for responsiveness
        const updated = { ...videoState, ...newState };
        setVideoState(prev => ({ ...prev, ...newState, timestamp: Date.now() }));

        // Only broadcast if shouldSync is true and user is host or co-host
        if (shouldSync && isHostOrCoHost) {
            const syncMessage = {
                type: "video_sync",
                state: updated.isPlaying ? "playing" : "paused",
                time: updated.currentTime,
                url: updated.url,
                sync_timestamp: Date.now(),
                is_host: isHost,
                from_host: isHostOrCoHost,
                extended_state: videoPlaylistStateRef.current // Include playlist state
            };

            // Smart sync strategy: Try WebRTC first, fallback to WebSocket
            const webrtcPeersCount = remoteStreams?.length || 0;
            const webrtcConnected = webrtcPeersCount > 0;

            if (webrtcConnected) {
                // Send via WebRTC Data Channel (Low Latency) - primary method
                broadcastData({ ...syncMessage, transport: "webrtc" });

                // Only send via WebSocket as backup if WebRTC might be unreliable
                // (e.g., if many peers or on important state changes like play/pause)
                const isImportantChange = newState.isPlaying !== undefined || newState.url;
                if (webrtcPeersCount > 3 || isImportantChange) {
                    setTimeout(() => {
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(JSON.stringify({ ...syncMessage, transport: "websocket_backup" }));
                        }
                    }, 50); // Small delay to avoid duplicate processing
                }
            } else {
                // No WebRTC peers, use WebSocket only
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ ...syncMessage, transport: "websocket_primary" }));
                }
            }
        }
    };

    const handleMusicStateChange = (newState: any, shouldSync: boolean = true) => {
        // Merge local state immediately for responsiveness
        const updated = { ...musicState, ...newState };
        setMusicState(prev => ({ ...prev, ...newState, timestamp: Date.now() }));

        // Only broadcast if shouldSync is true and user is host or co-host
        if (shouldSync && isHostOrCoHost) {
            const syncMessage = {
                type: "music_sync",
                state: updated.isPlaying ? "playing" : "paused",
                time: updated.currentTime,
                track: updated.track,
                volume: updated.volume,
                sync_timestamp: Date.now(),
                is_host: isHost,
                from_host: isHostOrCoHost,
                extended_state: {
                    shuffle: false, // Could be extended
                    repeat: false
                }
            };

            // Send via WebRTC Data Channel (Low Latency)
            broadcastData(syncMessage);

            // Also send via WebSocket as fallback/redundancy
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(syncMessage));
            }
        }
    };


    const copyRoomCode = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExitClick = () => {
        setShowExitConfirm(true);
    };

    const handleEndRoomClick = () => {
        setShowEndRoomConfirm(true);
    };

    const confirmExit = async () => {
        isLeavingRoomRef.current = true; // Signal that we are intentionally leaving

        // Clear messages to prevent cross-room contamination
        setMessages([]);

        // Save session state before leaving
        if (user?.primaryEmailAddress?.emailAddress && roomConfig) {
            try {
                const currentVideoTime = videoState.currentTime;
                const currentMusicTime = musicState.currentTime;
                await sessionManager.leaveRoom(roomConfig.id, currentVideoTime, currentMusicTime);
            } catch (error) {
                console.error('Failed to save session on exit:', error);
            }
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        router.push("/dashboard");
    };

    const confirmEndRoom = async () => {
        if (!user?.primaryEmailAddress?.emailAddress || !roomConfig) return;

        try {
            setShowEndRoomConfirm(false); // Close dialog immediately

            // Save current session state before ending room
            const currentVideoTime = videoState.currentTime;
            const currentMusicTime = musicState.currentTime;
            await sessionManager.leaveRoom(roomConfig.id, currentVideoTime, currentMusicTime);

            // Set flag to prevent reconnection attempts
            isLeavingRoomRef.current = true;

            // Delete the room via API (this will broadcast to all users)
            await api.deleteRoom(roomId, user.primaryEmailAddress.emailAddress);

            // Close WebSocket connection
            if (wsRef.current) {
                wsRef.current.close(1000, "Room ended by host");
            }

            // Clean up local streams
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error('Failed to end room:', error);
            setShowEndRoomConfirm(false);
            alert('Failed to end room. Please try again.');
        }
    };

    const handleLogout = async () => {
        await signOut({ redirectUrl: "/" });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const promoteToCoHost = (userEmail: string) => {
        if (!isHost || !roomConfig) return;

        const updatedCoHosts = [...(roomConfig.coHosts || []), userEmail];
        setRoomConfig(prev => prev ? { ...prev, coHosts: updatedCoHosts } : null);

        // Broadcast co-host promotion
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "cohost_promoted",
                userEmail,
                promotedBy: user?.primaryEmailAddress?.emailAddress,
                timestamp: Date.now()
            }));
        }
    };

    const demoteCoHost = (userEmail: string) => {
        if (!isHost || !roomConfig) return;

        const updatedCoHosts = (roomConfig.coHosts || []).filter(email => email !== userEmail);
        setRoomConfig(prev => prev ? { ...prev, coHosts: updatedCoHosts } : null);

        // Broadcast co-host demotion
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "cohost_demoted",
                userEmail,
                demotedBy: user?.primaryEmailAddress?.emailAddress,
                timestamp: Date.now()
            }));
        }
    };

    // Clean up on unmount to prevent cross-room contamination
    useEffect(() => {
        return () => {
            setMessages([]);
            if (wsRef.current) {
                wsRef.current.close();
            }
            // Clean up audio processor
            audioProcessor.cleanup();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Remove dependencies to only run on unmount

    if (!isLoaded || !user) {
        return <div className={styles.room}>Loading...</div>;
    }

    if (!isAdmitted && roomConfig && !isHost) {
        return (
            <LobbyPage
                room={roomConfig}
                user={user}
                onLeave={() => router.push("/dashboard")}
            />
        );
    }

    return (
        <div className={styles.room}>
            {/* Session Restoration Notification */}
            {sessionRestored && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <span>✅ Session Restored!</span>
                        <div className="text-sm opacity-90">
                            {restoredData.chatMessages > 0 && `${restoredData.chatMessages} messages • `}
                            {restoredData.videoState && "Video state • "}
                            {restoredData.musicState && "Music state • "}
                            Welcome back!
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <RoomHeader
                onExitClick={handleExitClick}
                onEndRoomClick={handleEndRoomClick}
                roomConfig={roomConfig}
                roomId={roomId}
                isHost={isHost}
                isConnected={isConnected}
                onlineCount={onlineCount}
                onCopyRoomCode={copyRoomCode}
                wasCopied={copied}
                showUserMenu={showUserMenu}
                onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
            />



            {/* Main Content */}
            <div className={styles.mainContent}>
                <RoomMainContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    availableTabs={availableTabs}
                    isHost={isHost}
                    videoState={videoState}
                    onVideoStateChange={handleVideoStateChange}
                    videoPlaylistState={videoPlaylistState}
                    onVideoPlaylistChange={handleVideoPlaylistChange}
                    onPlaylistToggle={setIsPlaylistOpen}
                    musicState={musicState}
                    onMusicStateChange={handleMusicStateChange}
                />

                {/* Chat Sidebar */}
                <ChatSidebar
                    roomCode={roomId}
                    nickname={currentUserIdentifier}
                    userEmail={user?.primaryEmailAddress?.emailAddress}
                    isHost={isHost}
                    hostEmail={roomConfig?.hostEmail}
                    setOnlineCount={setOnlineCount}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    participants={participants}
                    activeStreams={remoteStreams}
                    micStatuses={micStatuses}
                    isMicOn={isMicOn}
                    onToggleMic={toggleMic}
                    onOpenSettings={() => setShowSettingsDialog(true)}
                    onOpenAudioSettings={() => setShowAudioSettings(true)}
                    isOpen={isSidebarOpen}
                    onToggleSidebar={toggleSidebar}
                    onDemoteCoHost={demoteCoHost}
                    isShrunken={isPlaylistOpen}
                    lobbyEnabled={roomConfig?.lobbyEnabled}
                    lobbyCount={lobbyCount}
                />
            </div>

            <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Room?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this room? This will only end your session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-slate-400 text-sm">
                            <AlertTriangle size={16} className="inline mr-2 text-amber-500" />
                            Only your session will end. The room and other participants will continue.
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

            <Dialog open={showEndRoomConfirm} onOpenChange={setShowEndRoomConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>End Room?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to end this room permanently? This will disconnect all participants.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-slate-400 text-sm">
                            <AlertTriangle size={16} className="inline mr-2 text-red-500" />
                            This action cannot be undone. All participants will be disconnected and the room will be deleted.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowEndRoomConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmEndRoom} className="bg-red-600 hover:bg-red-700 text-white">
                            End Room
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {roomConfig && (
                <RoomSettingsDialog
                    open={showSettingsDialog}
                    onOpenChange={setShowSettingsDialog}
                    roomName={roomConfig.name}
                    features={roomConfig.features}
                    isHost={isHost}
                    onChatCleared={() => setMessages([])}
                />
            )
            }

            {/* Audio Settings Dialog */}
            <AudioSettings
                open={showAudioSettings}
                onOpenChange={setShowAudioSettings}
                audioProcessor={audioProcessor}
                localStream={localStream}
                isMicOn={isMicOn}
                onToggleMic={toggleMic}
                audioQuality={audioQuality}
                onAudioQualityChange={setAudioQuality}
            />

            {/* Hidden Audio Elements for Voice Chat */}
            {remoteStreams.map(rs => (
                <RemoteAudio key={rs.peerId} stream={rs.stream} peerId={rs.peerId} />
            ))}
        </div >
    );
}


const RemoteAudio = ({ stream, peerId }: { stream: MediaStream, peerId: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.srcObject = stream;
            audioRef.current.play().catch((err: any) => {
                // Ignore AbortError which is common when streams change quickly or component unmounts
                if (err.name !== 'AbortError') {
                    console.warn(`Audio playback failed for peer ${peerId}`, err);
                }
            });
        }
    }, [stream, peerId]);

    return <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />;
};
