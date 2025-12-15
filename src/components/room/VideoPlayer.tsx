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

    // Derived state from props or fallback to local defaults if needed (but we aim for controlled)
    const currentUrl = videoState?.url || "";
    const isPlaying = videoState?.isPlaying || false;
    const playlist = playlistState?.playlist || [];
    const currentPlaylistIndex = playlistState?.current_index || 0;
    const loop = playlistState?.loop || false;
    const shuffle = playlistState?.shuffle || false;


    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        // If the URL has changed, update the video source and load it
        if (video.src !== currentUrl) {
            video.src = currentUrl;
            video.load(); // Important for HTML5 video element to pick up new source
            if (isPlaying) {
                video.play().catch(e => console.log("Autoplay blocked on URL change", e));
            }
        }
    }, [currentUrl, isPlaying]); // React only when currentUrl changes

    // Effect to sync video element with props
    useEffect(() => {
        if (!videoRef.current || !videoState) return;

        const video = videoRef.current;

        // Sync time if there's a significant difference
        if (Math.abs(video.currentTime - videoState.currentTime) > 0.5) {
            video.currentTime = videoState.currentTime;
        }

        // Sync play/pause state
        if (isPlaying && video.paused) {
            video.play().catch(e => console.log("Autoplay blocked", e));
        } else if (!isPlaying && !video.paused) {
            video.pause();
        }
    }, [videoState?.timestamp, isPlaying]); // React to timestamp changes for forced updates

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
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            // In a real app, you'd fetch duration and thumbnail from YouTube API
            // For now, using placeholders
            return {
                url: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
                title: `YouTube Video (${videoId})`,
                type: "youtube",
                duration: 0, // Placeholder
                thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`, // Placeholder thumbnail
            };
        }
        return {
            url: url,
            title: url.split("/").pop() || "Direct Video",
            type: "direct",
            duration: 0, // Placeholder
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
            const currentTime = videoRef.current?.currentTime || 0;
            if (isHost) {
                onStateChange({ isPlaying: !isPlaying, currentTime }, true);
            } else {
                onStateChange({ isPlaying: !isPlaying, currentTime }, false);
            }
        }
    }, [onStateChange, isPlaying, isHost]);

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

    // Periodic sync for hosts to keep everyone in sync and override non-host changes
    useEffect(() => {
        if (!isHost || !currentUrl || !onStateChange) return;

        const syncInterval = setInterval(() => {
            if (videoRef.current) {
                const currentTime = videoRef.current.currentTime;
                // Broadcast current state every 3 seconds to override any non-host interference
                onStateChange({
                    currentTime,
                    isPlaying: !videoRef.current.paused,
                    url: currentUrl
                }, true);
            }
        }, 3000); // Sync every 3 seconds (more frequent to override interference)

        return () => clearInterval(syncInterval);
    }, [isHost, currentUrl, onStateChange]);

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
                        placeholder="Paste YouTube or video URL..."
                        value={localInputUrl}
                        onChange={(e) => setLocalInputUrl(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <Button onClick={handleLoadVideo} disabled={!localInputUrl.trim() || !isHost} className={styles.loadButton}>
                    Load Video {!isHost && "(Host Only)"}
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

            {/* Video Container & Playlist (Main Area) */}
            <div className={styles.mainArea}>
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
            {currentUrl && !currentUrl.includes("youtube.com/embed") && (
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
            </div>
        </div>
    );
}
