"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Link as LinkIcon, Plus, Trash2, List, SkipForward, SkipBack, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./VideoPlayer.module.css";

export interface PlaylistItem {
    id: string; // Unique ID for the playlist item (e.g., YouTube video ID, or a generated UUID)
    url: string;
    title: string;
    type: "youtube" | "direct";
    duration: number; // Duration of the video in seconds
    thumbnail?: string; // URL of the video thumbnail
}

export interface VideoPlaylistState {
    playlist: PlaylistItem[];
    current_index: number;
    loop: boolean;
    shuffle: boolean;
}

interface VideoPlayerProps {
    isHost?: boolean;
    videoState?: {
        url: string;
        isPlaying: boolean;
        currentTime: number;
        timestamp: number; // To force updates even if value is same
    };
    playlistState?: VideoPlaylistState; // Managed by the parent component
    onStateChange?: (newState: Partial<{ url: string; isPlaying: boolean; currentTime: number }>, shouldSync?: boolean) => void;
    onPlaylistChange?: (newPlaylistState: VideoPlaylistState, shouldSync?: boolean) => void;
    onPlaylistToggle?: (isOpen: boolean) => void;
}

export default function VideoPlayer({ isHost = false, videoState, playlistState, onStateChange, onPlaylistChange, onPlaylistToggle }: VideoPlayerProps) {
    const [localInputUrl, setLocalInputUrl] = useState("");
    const [showPlaylist, setShowPlaylist] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const ytPlayerRef = useRef<any>(null);
    const ytContainerRef = useRef<HTMLDivElement>(null);
    const isYtReadyRef = useRef(false);
    const [ytApiLoaded, setYtApiLoaded] = useState<boolean | null>(null);

    // Enhanced YouTube API loading with better error handling and fallbacks
    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout | null = null;

        const checkYTApi = () => {
            if ((window as any).YT && (window as any).YT.Player) {
                console.log("[VideoPlayer] YouTube API detected via polling");
                if (isMounted) setYtApiLoaded(true);
                return true;
            }
            return false;
        };

        if (checkYTApi()) return;

        console.log("[VideoPlayer] Initializing YouTube API loading...");

        // Set up global callback before loading script
        (window as any).onYouTubeIframeAPIReady = () => {
            console.log("[VideoPlayer] YouTube API ready via global callback");
            if (isMounted) setYtApiLoaded(true);
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        };

        // Enhanced script injection with better error handling
        const loadYouTubeAPI = async (attempt = 1, maxAttempts = 3) => {
            if (!isMounted) return;

            try {
                // Check if script already exists
                const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
                if (existingScript) {
                    if (attempt === 1) {
                        console.log("[VideoPlayer] YouTube API script already exists, waiting for load...");
                        // Start polling since script exists but might not be loaded yet
                        startPolling();
                        return;
                    } else {
                        // Remove failed script for retry
                        console.log("[VideoPlayer] Removing failed YouTube API script for retry");
                        existingScript.remove();
                    }
                }

                console.log(`[VideoPlayer] Loading YouTube API (attempt ${attempt}/${maxAttempts})`);
                
                const script = document.createElement('script');
                script.src = "https://www.youtube.com/iframe_api";
                script.async = true;
                
                // Add comprehensive error handling
                script.onerror = (error) => {
                    console.warn(`[VideoPlayer] YouTube API load failed (attempt ${attempt}):`, error);
                    script.remove();
                    
                    if (attempt < maxAttempts && isMounted) {
                        // Retry with exponential backoff
                        setTimeout(() => loadYouTubeAPI(attempt + 1, maxAttempts), 1000 * Math.pow(2, attempt));
                    } else if (isMounted) {
                        console.error("[VideoPlayer] YouTube API failed after all attempts - HTML5 video only");
                        setYtApiLoaded(false);
                    }
                };

                script.onload = () => {
                    console.log("[VideoPlayer] YouTube API script loaded successfully");
                    // Start polling for YT object availability
                    startPolling();
                };

                document.head.appendChild(script);

            } catch (error) {
                console.error("[VideoPlayer] Error loading YouTube API:", error);
                if (attempt < maxAttempts && isMounted) {
                    setTimeout(() => loadYouTubeAPI(attempt + 1, maxAttempts), 1000 * Math.pow(2, attempt));
                } else if (isMounted) {
                    setYtApiLoaded(false);
                }
            }
        };

        const startPolling = () => {
            if (pollInterval) return; // Already polling

            let pollAttempts = 0;
            const maxPollAttempts = 30; // 30 seconds
            
            pollInterval = setInterval(() => {
                if (!isMounted) {
                    if (pollInterval) clearInterval(pollInterval);
                    return;
                }

                pollAttempts++;
                
                if (checkYTApi()) {
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                } else if (pollAttempts >= maxPollAttempts) {
                    console.warn("[VideoPlayer] YouTube API polling timeout - allowing HTML5 videos only");
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                    if (isMounted) setYtApiLoaded(false);
                }
            }, 1000);
        };

        // Start the loading process
        loadYouTubeAPI();

        return () => {
            isMounted = false;
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        };
    }, []);

    // Derived state from props or fallback to local defaults if needed (but we aim for controlled)
    const currentUrl = videoState?.url || "";
    const isPlaying = videoState?.isPlaying || false;
    const playlist = playlistState?.playlist || [];
    const currentPlaylistIndex = playlistState?.current_index || 0;
    const loop = playlistState?.loop || false;
    const shuffle = playlistState?.shuffle || false;


    useEffect(() => {
        const isYouTube = currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be");
        if (isYouTube) {
            // Wait for YouTube API to load before proceeding
            if (ytApiLoaded === null) {
                console.log("[VideoPlayer] Waiting for YouTube API loading status...");
                return;
            }
            
            if (!ytApiLoaded) {
                console.warn("[VideoPlayer] YouTube API unavailable, cannot play YouTube videos");
                return;
            }

            if (!ytContainerRef.current) {
                console.log("[VideoPlayer] YouTube container ref not ready");
                return;
            }

            // Validate YT object is available
            if (!(window as any).YT || !(window as any).YT.Player) {
                console.warn("[VideoPlayer] YT object missing despite ytApiLoaded=true, waiting...");
                // Reset API status and let the loading effect retry
                setTimeout(() => {
                    if (!(window as any).YT || !(window as any).YT.Player) {
                        console.warn("[VideoPlayer] YT API still not available after timeout, marking as failed");
                        setYtApiLoaded(false);
                    }
                }, 2000);
                return;
            }

            // Extract video ID with improved regex
            const ytRegex = /(?:v=|youtu\.be\/|embed\/|watch\?v=|&v=)([^#&?]+)/;
            const match = currentUrl.match(ytRegex);
            const videoId = match ? match[1] : null;

            if (!videoId) {
                console.warn("[VideoPlayer] Could not extract YouTube ID from:", currentUrl);
                return;
            }

            if (!ytPlayerRef.current) {
                const containerId = "yt-player-container";
                const container = document.getElementById(containerId);

                if (!container) {
                    console.warn("[VideoPlayer] YT Container element not found in DOM");
                    return;
                }

                console.log("[VideoPlayer] Creating new YouTube Player for ID:", videoId);
                try {
                    ytPlayerRef.current = new (window as any).YT.Player(containerId, {
                        videoId: videoId,
                        playerVars: {
                            autoplay: isPlaying ? 1 : 0,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            modestbranding: 1,
                            rel: 0,
                            origin: window.location.origin,
                            enablejsapi: 1
                        },
                        events: {
                            onReady: () => {
                                console.log("[VideoPlayer] YouTube Player Ready");
                                isYtReadyRef.current = true;
                                if (isPlaying) {
                                    ytPlayerRef.current.playVideo();
                                }
                                ytPlayerRef.current.seekTo(videoState?.currentTime || 0, true);
                            },
                            onStateChange: (event: any) => {
                                if (!isHost || !onStateChange) return;

                                const state = event.data;
                                const time = ytPlayerRef.current?.getCurrentTime() || 0;
                                const YT = (window as any).YT;
                                
                                if (!YT || !YT.PlayerState) return;
                                
                                if (state === YT.PlayerState.PLAYING) {
                                    onStateChange({ isPlaying: true, currentTime: time }, true);
                                } else if (state === YT.PlayerState.PAUSED) {
                                    onStateChange({ isPlaying: false, currentTime: time }, true);
                                }
                            },
                            onError: (e: any) => {
                                console.error("[VideoPlayer] YouTube Player Error:", e.data);
                                let errorMessage = "Unknown error";
                                switch (e.data) {
                                    case 2: errorMessage = "Invalid video ID"; break;
                                    case 5: errorMessage = "Video cannot be played in HTML5 player"; break;
                                    case 100: errorMessage = "Video not found or removed"; break;
                                    case 101:
                                    case 150: errorMessage = "Video embedding restricted by owner"; break;
                                }
                                console.warn(`[VideoPlayer] YouTube Error: ${errorMessage} (${e.data})`);
                                
                                // Reset player on severe errors
                                if ([2, 5, 100, 101, 150].includes(e.data)) {
                                    ytPlayerRef.current = null;
                                    isYtReadyRef.current = false;
                                }
                            }
                        }
                    });
                } catch (err) {
                    console.error("[VideoPlayer] Failed to construct YT Player:", err);
                    ytPlayerRef.current = null;
                }
            } else {
                // Update existing player with new video
                try {
                    const loadedVideoUrl = ytPlayerRef.current.getVideoUrl?.() || "";
                    if (!loadedVideoUrl.includes(videoId)) {
                        console.log("[VideoPlayer] Loading new Video ID:", videoId);
                        ytPlayerRef.current.loadVideoById({
                            videoId: videoId,
                            startSeconds: videoState?.currentTime || 0
                        });
                    }
                } catch (err) {
                    console.warn("[VideoPlayer] Failed to check/load video by ID:", err);
                    ytPlayerRef.current = null;
                    isYtReadyRef.current = false;
                }
            }
        } else {
            // Clean up YouTube player when switching to HTML5
            if (ytPlayerRef.current) {
                try {
                    ytPlayerRef.current.destroy();
                } catch (err) {
                    console.warn("[VideoPlayer] Error destroying YT player:", err);
                }
                ytPlayerRef.current = null;
                isYtReadyRef.current = false;
            }

            // HTML5 Video handling
            if (!videoRef.current || !currentUrl) return;
            const video = videoRef.current;

            if (video.src !== currentUrl) {
                console.log("[VideoPlayer] Loading HTML5 Video:", currentUrl);
                video.src = currentUrl;
                video.load();
                if (isPlaying) {
                    video.play().catch(e => console.log("Autoplay blocked on URL change", e));
                }
            }
        }
    }, [currentUrl, ytApiLoaded]);

    // Effect to sync video element with props with improved timing accuracy
    useEffect(() => {
        const isYouTube = currentUrl.includes("youtube") || currentUrl.includes("youtu.be");
        if (isYouTube) {
            if (!ytPlayerRef.current || !isYtReadyRef.current || !videoState) return;

            const yt = ytPlayerRef.current;
            const ytTime = yt.getCurrentTime();
            const timeDiff = Math.abs(ytTime - videoState.currentTime);
            const syncThreshold = isHost ? 1.0 : 0.5;

            if (timeDiff > syncThreshold) {
                const now = Date.now();
                const messageAge = videoState.timestamp ? (now - videoState.timestamp) / 1000 : 0;
                const adjustedTime = videoState.currentTime + (isPlaying ? messageAge : 0);
                yt.seekTo(adjustedTime, true);
            }

            const ytState = yt.getPlayerState();
            const YT = (window as any).YT;
            if (!YT || !YT.PlayerState) return;
            
            if (isPlaying && ytState !== YT.PlayerState.PLAYING) {
                yt.playVideo();
            } else if (!isPlaying && ytState === YT.PlayerState.PLAYING) {
                yt.pauseVideo();
            }
        } else {
            if (!videoRef.current || !videoState) return;

            const video = videoRef.current;
            const timeDiff = Math.abs(video.currentTime - videoState.currentTime);
            const syncThreshold = isHost ? 1.0 : 0.3;

            if (timeDiff > syncThreshold) {
                const now = Date.now();
                const messageAge = videoState.timestamp ? (now - videoState.timestamp) / 1000 : 0;
                const adjustedTime = videoState.currentTime + (isPlaying ? messageAge : 0);

                video.currentTime = adjustedTime;
            }

            if (isPlaying && video.paused) {
                video.play().catch(e => {
                    setTimeout(() => {
                        video.play().catch(e2 => console.log("Retry failed", e2));
                    }, 100);
                });
            } else if (!isPlaying && !video.paused) {
                video.pause();
            }
        }
    }, [videoState?.timestamp, isPlaying, isHost, currentUrl]);

    // Autoplay the next video when current one ends
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isHost || !onPlaylistChange || !onStateChange) return;

        const handleEnded = () => {
            if (playlist.length > 0) {
                const nextIndex = (currentPlaylistIndex + 1) % playlist.length;
                const nextItem = playlist[nextIndex];

                // Update playlist state and video state
                onPlaylistChange({ ...playlistState!, current_index: nextIndex }, true);
                onStateChange({ url: nextItem.url, isPlaying: true, currentTime: 0 }, true);
            } else {
                // If playlist is empty, just pause
                onStateChange({ isPlaying: false }, true);
            }
        };

        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, [isHost, currentPlaylistIndex, playlist, playlistState, onPlaylistChange, onStateChange]);


    const extractVideoInfo = useCallback(async (url: string): Promise<Omit<PlaylistItem, 'id'>> => {
        const youtubeMatch = url.match(/(?:v=|youtu\.be\/|embed\/|watch\?v=|&v=)([^#&?]+)/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            return {
                url: `https://www.youtube.com/watch?v=${videoId}`,
                title: `YouTube Video (${videoId})`,
                type: "youtube",
                duration: 0,
                thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
            };
        }
        return {
            url: url,
            title: url.split("/").pop() || "Direct Video",
            type: "direct",
            duration: 0,
            thumbnail: undefined,
        };
    }, []);

    const handleLoadVideo = useCallback(async () => {
        if (localInputUrl.trim() && onStateChange && onPlaylistChange && playlistState) {
            const info = await extractVideoInfo(localInputUrl);
            const newItem: PlaylistItem = { ...info, id: Date.now().toString() };

            const newPlaylist = [newItem];
            const newIndex = 0;

            onPlaylistChange({ ...playlistState, playlist: newPlaylist, current_index: newIndex }, true);
            onStateChange({ url: newItem.url, isPlaying: true, currentTime: 0 }, true);
            setLocalInputUrl("");
        }
    }, [localInputUrl, onStateChange, onPlaylistChange, playlistState, extractVideoInfo]);

    const handleAddToPlaylist = useCallback(async () => {
        if (localInputUrl.trim() && onPlaylistChange && playlistState) {
            const info = await extractVideoInfo(localInputUrl);
            const newItem: PlaylistItem = { ...info, id: Date.now().toString() };

            const newPlaylist = [...playlist, newItem];
            onPlaylistChange({ ...playlistState, playlist: newPlaylist }, true);
            setLocalInputUrl("");
        }
    }, [localInputUrl, playlist, onPlaylistChange, playlistState, extractVideoInfo]);

    const handlePlayFromPlaylist = useCallback((index: number) => {
        const item = playlist[index];
        if (item && onStateChange && onPlaylistChange && playlistState) {
            // Update current playing video and current index in playlist
            onPlaylistChange({ ...playlistState, current_index: index }, true);
            onStateChange({ url: item.url, isPlaying: true, currentTime: 0 }, true);
        }
    }, [playlist, onStateChange, onPlaylistChange, playlistState]);


    const handlePlayNext = useCallback(() => {
        if (!onPlaylistChange || !playlistState || playlist.length === 0) return;

        let newIndex = currentPlaylistIndex;
        if (shuffle) {
            let randomIndex = Math.floor(Math.random() * playlist.length);
            while (randomIndex === currentPlaylistIndex && playlist.length > 1) {
                randomIndex = Math.floor(Math.random() * playlist.length);
            }
            newIndex = randomIndex;
        } else {
            newIndex = (currentPlaylistIndex + 1) % playlist.length;
        }

        const nextItem = playlist[newIndex];
        if (nextItem) {
            onPlaylistChange({ ...playlistState, current_index: newIndex }, true);
            onStateChange && onStateChange({ url: nextItem.url, isPlaying: true, currentTime: 0 }, true);
        }
    }, [currentPlaylistIndex, playlist, shuffle, onPlaylistChange, playlistState, onStateChange]);

    const handlePlayPrevious = useCallback(() => {
        if (!onPlaylistChange || !playlistState || playlist.length === 0) return;

        let newIndex = currentPlaylistIndex;
        if (shuffle) {
            let randomIndex = Math.floor(Math.random() * playlist.length);
            while (randomIndex === currentPlaylistIndex && playlist.length > 1) {
                randomIndex = Math.floor(Math.random() * playlist.length);
            }
            newIndex = randomIndex;
        } else {
            newIndex = (currentPlaylistIndex - 1 + playlist.length) % playlist.length;
        }

        const prevItem = playlist[newIndex];
        if (prevItem) {
            onPlaylistChange({ ...playlistState, current_index: newIndex }, true);
            onStateChange && onStateChange({ url: prevItem.url, isPlaying: true, currentTime: 0 }, true);
        }
    }, [currentPlaylistIndex, playlist, shuffle, onPlaylistChange, playlistState, onStateChange]);

    const handleRemoveFromPlaylist = useCallback((index: number) => {
        if (!onPlaylistChange || !playlistState) return;

        const newPlaylist = playlist.filter((_, i) => i !== index);
        let newIndex = currentPlaylistIndex;

        if (index === currentPlaylistIndex) {
            // If currently playing item is removed
            if (newPlaylist.length === 0) {
                newIndex = 0; // No items left
                onStateChange && onStateChange({ url: "", isPlaying: false, currentTime: 0 }, true);
            } else {
                newIndex = Math.min(currentPlaylistIndex, newPlaylist.length - 1);
                const nextItem = newPlaylist[newIndex];
                onStateChange && onStateChange({ url: nextItem.url, isPlaying: true, currentTime: 0 }, true);
            }
        } else if (index < currentPlaylistIndex) {
            newIndex--; // Adjust index if item before current was removed
        }
        onPlaylistChange({ ...playlistState, playlist: newPlaylist, current_index: newIndex }, true);
    }, [playlist, currentPlaylistIndex, onPlaylistChange, playlistState, onStateChange]);

    const handleToggleLoop = useCallback(() => {
        if (onPlaylistChange && playlistState) {
            onPlaylistChange({ ...playlistState, loop: !loop }, true);
        }
    }, [loop, onPlaylistChange, playlistState]);

    const handleToggleShuffle = useCallback(() => {
        if (onPlaylistChange && playlistState) {
            onPlaylistChange({ ...playlistState, shuffle: !shuffle }, true);
        }
    }, [shuffle, onPlaylistChange, playlistState]);

    const togglePlay = useCallback(() => {
        if (onStateChange) {
            const isYouTube = currentUrl.includes("youtube") || currentUrl.includes("youtu.be");
            const currentTime = isYouTube
                ? ytPlayerRef.current?.getCurrentTime() || 0
                : videoRef.current?.currentTime || 0;
            onStateChange({ isPlaying: !isPlaying, currentTime }, isHost);
        }
    }, [onStateChange, isPlaying, isHost, currentUrl]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (onStateChange) {
            if (isHost) {
                onStateChange({ currentTime: time }, true);
            } else {
                onStateChange({ currentTime: time }, false);
            }
        }
    }, [onStateChange, isHost]);

    // Adaptive periodic sync for hosts to keep everyone in sync with reduced drift
    useEffect(() => {
        if (!isHost || !currentUrl || !onStateChange) return;

        let syncInterval: NodeJS.Timeout;
        let lastSyncTime = 0;

        const performSync = () => {
            const isYouTube = currentUrl.includes("youtube") || currentUrl.includes("youtu.be");
            if (isYouTube) {
                if (ytPlayerRef.current && isYtReadyRef.current) {
                    const YT = (window as any).YT;
                    if (!YT || !YT.PlayerState) return;
                    
                    const currentTime = ytPlayerRef.current.getCurrentTime();
                    const now = Date.now();
                    const ytState = ytPlayerRef.current.getPlayerState();
                    const isPlaying = ytState === YT.PlayerState.PLAYING;

                    if (now - lastSyncTime >= 2000 || Math.abs(currentTime - (videoState?.currentTime || 0)) > 0.5) {
                        onStateChange({ currentTime, isPlaying, url: currentUrl }, true);
                        lastSyncTime = now;
                    }
                }
            } else if (videoRef.current) {
                const currentTime = videoRef.current.currentTime;
                const now = Date.now();
                const isPlaying = !videoRef.current.paused;

                if (now - lastSyncTime >= 2000 || Math.abs(currentTime - (videoState?.currentTime || 0)) > 0.5) {
                    onStateChange({ currentTime, isPlaying, url: currentUrl }, true);
                    lastSyncTime = now;
                }
            }
        };

        // Use adaptive sync frequency - more frequent when playing, less when paused
        const updateSyncFrequency = () => {
            if (syncInterval) clearInterval(syncInterval);

            const isYouTube = currentUrl.includes("youtube") || currentUrl.includes("youtu.be");
            let isVideoPlaying = false;

            if (isYouTube && ytPlayerRef.current && isYtReadyRef.current) {
                const YT = (window as any).YT;
                if (YT && YT.PlayerState) {
                    isVideoPlaying = ytPlayerRef.current.getPlayerState() === YT.PlayerState.PLAYING;
                }
            } else if (videoRef.current) {
                isVideoPlaying = !videoRef.current.paused;
            }

            const frequency = isVideoPlaying ? 1500 : 5000;
            syncInterval = setInterval(performSync, frequency);
        };

        updateSyncFrequency();

        // Listen for play/pause events to adjust sync frequency
        const video = videoRef.current;
        if (video) {
            video.addEventListener('play', updateSyncFrequency);
            video.addEventListener('pause', updateSyncFrequency);
        }

        return () => {
            if (syncInterval) clearInterval(syncInterval);
            if (video) {
                video.removeEventListener('play', updateSyncFrequency);
                video.removeEventListener('pause', updateSyncFrequency);
            }
        };
    }, [isHost, currentUrl, onStateChange, videoState?.currentTime]);

    const handleTimeUpdate = () => {
        // We generally rely on props, but for UI smooth progress bar we might need local state? 
        // For now let's just use ref for duration/time display in render if we wanted, 
        // OR simply don't update global state on every tick to avoid spamming network.
        // We only send updates on "Seek" or "Pause".
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // ... (Fullscreen, RemoveFromPlaylist logic remains similar)
    const handleFullscreen = () => {
        const container = document.querySelector(`.${styles.container}`); // Using container class directly
        if (container && document.fullscreenEnabled) {
            container.requestFullscreen();
        }
    };

    return (
        <div className={styles.container}>
            {/* URL Input (Only Host can change video usually, but we allow all for now or check isHost) */}
            <div className={styles.urlInput}>
                <div className={styles.inputWrapper}>
                    <LinkIcon size={18} className={styles.inputIcon} />
                    <Input
                        placeholder={ytApiLoaded === false ? "Paste direct video URL (.mp4, .webm)..." : "Paste YouTube or video URL..."}
                        value={localInputUrl}
                        onChange={(e) => setLocalInputUrl(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <Button onClick={handleLoadVideo} disabled={!localInputUrl.trim() || !isHost} className={styles.loadButton}>
                    Load Video {!isHost && "(Host Only)"}
                </Button>
                {isHost && process.env.NODE_ENV === 'development' && (
                    <Button 
                        variant="outline" 
                        onClick={() => setLocalInputUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
                        className={styles.testButton}
                    >
                        Test Video
                    </Button>
                )}
                <Button variant="outline" onClick={handleAddToPlaylist} disabled={!localInputUrl.trim()}>
                    <Plus size={18} />
                    Add to Playlist
                </Button>
                <button
                    className={`${styles.playlistToggle} ${showPlaylist ? styles.active : ""}`}
                    onClick={() => setShowPlaylist(!showPlaylist)}
                >
                    <List size={18} />
                    <span className={styles.playlistCount}>{playlist.length}</span>
                </button>
            </div>

            {/* Video Container & Playlist (Main Area) */}
            <div className={styles.mainArea}>
                <div className={styles.videoContainer}>
                    {/* Keep both elements in DOM to avoid destroying the YT IFrame on type switch */}
                    <div
                        id="yt-player-container"
                        ref={ytContainerRef}
                        className={styles.video}
                        style={{ display: currentUrl && (currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be")) ? 'block' : 'none' }}
                    />

                    {currentUrl && !currentUrl.includes("youtube") && !currentUrl.includes("youtu.be") && (
                        <video
                            ref={videoRef}
                            src={currentUrl}
                            className={styles.video}
                            onTimeUpdate={handleTimeUpdate}
                            onWaiting={() => {
                                if (isHost && onStateChange) {
                                    onStateChange({ isPlaying: false, currentTime: videoRef.current?.currentTime || 0 }, true);
                                }
                            }}
                            onPlaying={() => {
                                if (isHost && onStateChange) {
                                    onStateChange({ isPlaying: true, currentTime: videoRef.current?.currentTime || 0 }, true);
                                }
                            }}
                        />
                    )}

                    {!currentUrl && (
                        <div className={styles.placeholder}>
                            <Play size={48} className={styles.placeholderIcon} />
                            <h3>No video loaded</h3>
                            <p>Paste a YouTube or video URL above to get started</p>
                            {!isHost && (
                                <p className={styles.hostNote}>
                                    📝 Only the room host can load videos. Wait for the host to share a video.
                                </p>
                            )}
                            {ytApiLoaded === false && (
                                <p className={styles.apiWarning}>
                                    ⚠️ YouTube API failed to load. Only direct video files (.mp4, .webm, etc.) will work.
                                </p>
                            )}
                            {process.env.NODE_ENV === 'development' && (
                                <div className={styles.debugInfo}>
                                    <small>Debug: isHost={isHost ? 'true' : 'false'}, currentUrl="{currentUrl}", ytApiLoaded={ytApiLoaded === null ? 'loading' : ytApiLoaded ? 'true' : 'false'}</small>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Playlist Sidebar */}
                {showPlaylist && (
                    <div className={styles.playlistSidebar}>
                        <div className={styles.playlistHeader}>
                            <h3>Playlist</h3>
                            <span className={styles.itemCount}>{playlist.length} videos</span>
                        </div>
                        <div className={styles.playlistItems}>
                            {playlist.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`${styles.playlistItem} ${index === currentPlaylistIndex ? styles.playing : ''}`}
                                >
                                    {item.thumbnail && (
                                        <img src={item.thumbnail} alt={item.title} className={styles.playlistItemThumbnail} />
                                    )}
                                    <button className={styles.playlistItemPlay} onClick={() => handlePlayFromPlaylist(index)}>
                                        {index === currentPlaylistIndex && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                    </button>
                                    <div className={styles.playlistItemInfo}>
                                        <span className={styles.playlistItemTitle}>{item.title}</span>
                                        {item.duration > 0 && (
                                            <span className={styles.playlistItemDuration}>{formatTime(item.duration)}</span>
                                        )}
                                    </div>
                                    <button className={styles.playlistItemRemove} onClick={() => handleRemoveFromPlaylist(index)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            {currentUrl && (
                <div className={styles.controls}>
                    <div className={styles.controlsRow}>
                        <button className={styles.controlButton} onClick={handlePlayPrevious}>
                            <SkipBack size={20} />
                        </button>
                        <button className={styles.controlButton} onClick={togglePlay}>
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button className={styles.controlButton} onClick={handlePlayNext}>
                            <SkipForward size={20} />
                        </button>
                        {/* Current Time / Duration */}
                        <span className={styles.timeDisplay}>
                            {formatTime(videoState?.currentTime || 0)} / {formatTime(playlist[currentPlaylistIndex]?.duration || 0)}
                        </span>
                        {/* Progress Bar */}
                        <div className={styles.progressContainer}>
                            <input
                                type="range"
                                min={0}
                                max={playlist[currentPlaylistIndex]?.duration || 0}
                                value={videoState?.currentTime || 0}
                                onChange={handleSeek}
                                className={styles.progressBar}
                            />
                        </div>
                        {/* Loop/Shuffle */}
                        <button
                            className={`${styles.controlButton} ${loop ? styles.activeControl : ''}`}
                            onClick={handleToggleLoop}
                            title="Toggle Loop"
                        >
                            <Repeat size={20} />
                        </button>
                        <button
                            className={`${styles.controlButton} ${shuffle ? styles.activeControl : ''}`}
                            onClick={handleToggleShuffle}
                            title="Toggle Shuffle"
                        >
                            <Shuffle size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.syncStatus}>
                <div className={`${styles.syncDot} ${isHost ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>
                    {isHost ?
                        "🎬 Host - Your controls sync with the room" :
                        "👁️ Viewer - Local controls only (Host controls room sync)"
                    }
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        console.log("[VideoPlayer] Manual Player Reset Triggered");
                        
                        // Clean up existing player
                        if (ytPlayerRef.current) {
                            try {
                                ytPlayerRef.current.destroy();
                            } catch (err) {
                                console.warn("[VideoPlayer] Error destroying player during reset:", err);
                            }
                        }
                        
                        // Reset all state
                        ytPlayerRef.current = null;
                        isYtReadyRef.current = false;
                        
                        // Remove any existing YouTube scripts
                        const existingScripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
                        existingScripts.forEach(script => script.remove());
                        
                        // Reset API loading state to trigger fresh load
                        setYtApiLoaded(null);
                        
                        // Clear any existing global callback
                        if ((window as any).onYouTubeIframeAPIReady) {
                            delete (window as any).onYouTubeIframeAPIReady;
                        }
                        
                        console.log("[VideoPlayer] Player reset complete - will reload API");
                    }}
                    className="text-xs text-white/40 hover:text-white"
                >
                    Reset Player
                </Button>
            </div>
        </div>
    );
}
