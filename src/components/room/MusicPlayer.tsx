"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Plus, Music, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { withErrorBoundary } from "@/components/ui";
import styles from "./MusicPlayer.module.css";

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    url?: string;
    cover?: string;
}

interface MusicState {
    track: Track | null;
    isPlaying: boolean;
    currentTime: number;
    volume: number;
    timestamp: number;
}

interface MusicPlayerProps {
    isHost?: boolean;
    musicState?: MusicState;
    onStateChange?: (newState: Partial<MusicState>, shouldSync?: boolean) => void;
}

const mockPlaylist: Track[] = [
    { id: "1", title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", url: "https://example.com/track1.mp3" },
    { id: "2", title: "Levitating", artist: "Dua Lipa", duration: "3:23", url: "https://example.com/track2.mp3" },
    { id: "3", title: "Save Your Tears", artist: "The Weeknd", duration: "3:35", url: "https://example.com/track3.mp3" },
    { id: "4", title: "Peaches", artist: "Justin Bieber", duration: "3:18", url: "https://example.com/track4.mp3" },
    { id: "5", title: "Kiss Me More", artist: "Doja Cat", duration: "3:28", url: "https://example.com/track5.mp3" },
];

function MusicPlayer({ isHost = false, musicState, onStateChange }: MusicPlayerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>(mockPlaylist);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Derived state from props or fallback to defaults
    const currentTrack = musicState?.track || playlist[0];
    const isPlaying = musicState?.isPlaying || false;
    const progress = musicState?.currentTime || 0;
    const volume = musicState?.volume || 0.75;

    // Effect to sync audio element with state
    useEffect(() => {
        if (!audioRef.current || !musicState) return;

        const audio = audioRef.current;

        // Sync audio source
        if (currentTrack?.url && audio.src !== currentTrack.url) {
            audio.src = currentTrack.url;
        }

        // Sync time if there's a significant difference
        if (Math.abs(audio.currentTime - progress) > 0.5) {
            audio.currentTime = progress;
        }

        // Sync play/pause state
        if (isPlaying && audio.paused) {
            audio.play().catch(e => console.log("Autoplay blocked", e));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }

        // Sync volume
        if (Math.abs(audio.volume - volume) > 0.01) {
            audio.volume = volume;
        }
    }, [musicState?.timestamp, currentTrack, isPlaying, progress, volume]);

    const handleTrackSelect = (track: Track) => {
        if (onStateChange) {
            if (isHost) {
                onStateChange({ track, isPlaying: true, currentTime: 0 }, true);
            } else {
                onStateChange({ track, isPlaying: true, currentTime: 0 }, false);
            }
        }
    };

    const togglePlay = () => {
        if (onStateChange) {
            const currentTime = audioRef.current?.currentTime || 0;
            if (isHost) {
                onStateChange({ isPlaying: !isPlaying, currentTime }, true);
            } else {
                onStateChange({ isPlaying: !isPlaying, currentTime }, false);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (onStateChange) {
            if (isHost) {
                onStateChange({ currentTime: time }, true);
            } else {
                onStateChange({ currentTime: time }, false);
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value) / 100;
        if (onStateChange) {
            if (isHost) {
                onStateChange({ volume: newVolume }, true);
            } else {
                onStateChange({ volume: newVolume }, false);
            }
        }
    };

    const handlePrevious = () => {
        const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        const prevTrack = playlist[prevIndex];
        
        if (onStateChange && isHost) {
            onStateChange({ track: prevTrack, currentTime: 0, isPlaying: true }, true);
        }
    };

    const handleNext = () => {
        const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
        let nextIndex: number;
        
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
            nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
        }
        
        const nextTrack = playlist[nextIndex];
        
        if (onStateChange && isHost) {
            onStateChange({ track: nextTrack, currentTime: 0, isPlaying: true }, true);
        }
    };

    // Periodic sync for hosts
    useEffect(() => {
        if (!isHost || !currentTrack || !onStateChange) return;

        const syncInterval = setInterval(() => {
            if (audioRef.current && isPlaying) {
                const currentTime = audioRef.current.currentTime;
                const volume = audioRef.current.volume;
                onStateChange({
                    currentTime,
                    volume,
                    isPlaying: !audioRef.current.paused
                }, true);
            }
        }, 2000); // Sync every 2 seconds

        return () => clearInterval(syncInterval);
    }, [isHost, currentTrack, isPlaying, onStateChange]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const filteredTracks = mockPlaylist.filter(
        (track) =>
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            {/* Now Playing */}
            <div className={styles.nowPlaying}>
                <div className={styles.albumArt}>
                    <Music size={48} />
                </div>

                <div className={styles.trackInfo}>
                    <h2 className={styles.trackTitle}>{currentTrack.title}</h2>
                    <p className={styles.trackArtist}>{currentTrack.artist}</p>
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                    <span className={styles.time}>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min={0}
                        max={300} // 5 minutes max, adjust based on track duration
                        value={progress}
                        onChange={handleSeek}
                        className={styles.progressBar}
                        disabled={!isHost}
                    />
                    <span className={styles.time}>{currentTrack.duration}</span>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <button
                        className={`${styles.controlButton} ${isShuffle ? styles.active : ""}`}
                        onClick={() => setIsShuffle(!isShuffle)}
                        disabled={!isHost}
                    >
                        <Shuffle size={18} />
                    </button>
                    <button 
                        className={styles.controlButton}
                        onClick={handlePrevious}
                        disabled={!isHost}
                    >
                        <SkipBack size={22} />
                    </button>
                    <button
                        className={`${styles.controlButton} ${styles.playButton}`}
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button 
                        className={styles.controlButton}
                        onClick={handleNext}
                        disabled={!isHost}
                    >
                        <SkipForward size={22} />
                    </button>
                    <button
                        className={`${styles.controlButton} ${isRepeat ? styles.active : ""}`}
                        onClick={() => setIsRepeat(!isRepeat)}
                        disabled={!isHost}
                    >
                        <Repeat size={18} />
                    </button>
                </div>

                {/* Volume */}
                <div className={styles.volumeSection}>
                    <Volume2 size={18} />
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume * 100}
                        onChange={handleVolumeChange}
                        className={styles.volumeBar}
                    />
                </div>
            </div>

            {/* Playlist */}
            <div className={styles.playlist}>
                <div className={styles.playlistHeader}>
                    <h3>Queue</h3>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <Input
                            placeholder="Search tracks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.trackList}>
                    {filteredTracks.map((track) => (
                        <div
                            key={track.id}
                            className={`${styles.trackItem} ${currentTrack.id === track.id ? styles.activeTrack : ""}`}
                            onClick={() => handleTrackSelect(track)}
                        >
                            <div className={styles.trackItemArt}>
                                <Music size={16} />
                            </div>
                            <div className={styles.trackItemInfo}>
                                <span className={styles.trackItemTitle}>{track.title}</span>
                                <span className={styles.trackItemArtist}>{track.artist}</span>
                            </div>
                            <span className={styles.trackItemDuration}>{track.duration}</span>
                        </div>
                    ))}
                </div>

                <Button variant="glass" className={styles.addButton}>
                    <Plus size={18} />
                    Add to Queue
                </Button>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={() => {
                    // Update progress for smooth UI updates
                }}
                onEnded={handleNext}
                style={{ display: 'none' }}
            />

            {/* Sync Status */}
            <div className={styles.syncStatus}>
                <div className={`${styles.syncDot} ${isHost ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>
                    {isHost ?
                        "🎵 Host - Your controls sync with the room" :
                        "👂 Viewer - Local controls only (Host controls room sync)"
                    }
                </span>
            </div>
        </div>
    );
}

export default withErrorBoundary(MusicPlayer, {
    componentName: "MusicPlayer",
    onError: (error, errorInfo) => {
        console.error("MusicPlayer Error:", error, errorInfo);
    },
});
