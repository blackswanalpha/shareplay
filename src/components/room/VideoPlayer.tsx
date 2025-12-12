"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Link as LinkIcon, Plus, Trash2, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./VideoPlayer.module.css";

interface VideoItem {
    id: string;
    url: string;
    title: string;
    type: "youtube" | "direct";
}

interface VideoPlayerProps {
    isHost?: boolean;
    videoState?: {
        url: string;
        isPlaying: boolean;
        currentTime: number;
        timestamp: number; // To force updates even if value is same
    };
    onStateChange?: (newState: any) => void; // Partial state update
}

export default function VideoPlayer({ isHost = false, videoState, onStateChange }: VideoPlayerProps) {
    const [localInputUrl, setLocalInputUrl] = useState("");
    const [playlist, setPlaylist] = useState<VideoItem[]>([]);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Derived state from props or fallback to local defaults if needed (but we aim for controlled)
    const currentUrl = videoState?.url || "";
    const isPlaying = videoState?.isPlaying || false;

    // Effect to sync video element with props
    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        if (Math.abs(video.currentTime - (videoState?.currentTime || 0)) > 2) {
            video.currentTime = videoState?.currentTime || 0;
        }

        if (isPlaying && video.paused) {
            video.play().catch(e => console.log("Autoplay blocked", e));
        } else if (!isPlaying && !video.paused) {
            video.pause();
        }
    }, [videoState]);

    const extractVideoInfo = (url: string): { embedUrl: string; title: string; type: "youtube" | "direct" } => {
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (youtubeMatch) {
            return {
                embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&enablejsapi=1`,
                title: `YouTube Video (${youtubeMatch[1]})`,
                type: "youtube",
            };
        }
        return {
            embedUrl: url,
            title: url.split("/").pop() || "Video",
            type: "direct",
        };
    };

    const handleLoadVideo = () => {
        if (localInputUrl.trim() && onStateChange) {
            const { embedUrl } = extractVideoInfo(localInputUrl);
            onStateChange({ url: embedUrl, isPlaying: true, currentTime: 0 });
            setLocalInputUrl("");
        }
    };

    const handleAddToPlaylist = () => {
        if (localInputUrl.trim()) {
            const { embedUrl, title, type } = extractVideoInfo(localInputUrl);
            const newItem: VideoItem = {
                id: Date.now().toString(),
                url: embedUrl,
                title,
                type,
            };
            setPlaylist([...playlist, newItem]);
            setLocalInputUrl("");
        }
    };

    const handlePlayFromPlaylist = (index: number) => {
        const item = playlist[index];
        if (item && onStateChange) {
            onStateChange({ url: item.url, isPlaying: true, currentTime: 0 });
        }
    };

    const togglePlay = () => {
        if (onStateChange) {
            onStateChange({ isPlaying: !isPlaying, currentTime: videoRef.current?.currentTime || 0 });
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (onStateChange) {
            onStateChange({ currentTime: time });
        }
    };

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
    const handleRemoveFromPlaylist = (index: number) => {
        setPlaylist(playlist.filter((_, i) => i !== index));
    };

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
                        placeholder="Paste YouTube or video URL..."
                        value={localInputUrl}
                        onChange={(e) => setLocalInputUrl(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <Button onClick={handleLoadVideo} disabled={!localInputUrl.trim()}>
                    Load Video
                </Button>
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

            <div className={styles.mainArea}>
                {/* Video Container */}
                <div className={styles.videoContainer}>
                    {currentUrl ? (
                        currentUrl.includes("youtube.com/embed") ? (
                            <iframe
                                src={currentUrl}
                                className={styles.video}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                src={currentUrl}
                                className={styles.video}
                                onTimeUpdate={handleTimeUpdate}
                            />
                        )
                    ) : (
                        <div className={styles.placeholder}>
                            <Play size={48} className={styles.placeholderIcon} />
                            <h3>No video loaded</h3>
                            <p>Paste a YouTube or video URL above to get started</p>
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
                        {/* Playlist mapping logic... same as before but using handlePlayFromPlaylist */}
                        <div className={styles.playlistItems}>
                            {playlist.map((item, index) => (
                                <div key={item.id} className={styles.playlistItem}>
                                    <button className={styles.playlistItemPlay} onClick={() => handlePlayFromPlaylist(index)}>
                                        <Play size={14} />
                                    </button>
                                    <div className={styles.playlistItemInfo}>
                                        <span className={styles.playlistItemTitle}>{item.title}</span>
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
            {currentUrl && !currentUrl.includes("youtube.com/embed") && (
                <div className={styles.controls}>
                    <div className={styles.controlsRow}>
                        <button className={styles.controlButton} onClick={togglePlay}>
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        {/* Progress Bar */}
                        <div className={styles.progressContainer}>
                            <input
                                type="range"
                                min={0}
                                max={videoRef.current?.duration || 100}
                                value={videoRef.current?.currentTime || 0} // Sync visual with local DOM state for smoothness, but updates trigger sync
                                onChange={handleSeek}
                                className={styles.progressBar}
                            />
                        </div>
                        {/* ... Mute/Fullscreen ... */}
                    </div>
                </div>
            )}

            <div className={styles.syncStatus}>
                <div className={styles.syncDot} />
                <span>Synced with room</span>
            </div>
        </div>
    );
}
