"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Plus, Music, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./MusicPlayer.module.css";

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    cover?: string;
}

const mockPlaylist: Track[] = [
    { id: "1", title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
    { id: "2", title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
    { id: "3", title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" },
    { id: "4", title: "Peaches", artist: "Justin Bieber", duration: "3:18" },
    { id: "5", title: "Kiss Me More", artist: "Doja Cat", duration: "3:28" },
];

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track>(mockPlaylist[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [progress, setProgress] = useState(45);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    const handleTrackSelect = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
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
                    <span className={styles.time}>1:32</span>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value))}
                        className={styles.progressBar}
                    />
                    <span className={styles.time}>{currentTrack.duration}</span>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <button
                        className={`${styles.controlButton} ${isShuffle ? styles.active : ""}`}
                        onClick={() => setIsShuffle(!isShuffle)}
                    >
                        <Shuffle size={18} />
                    </button>
                    <button className={styles.controlButton}>
                        <SkipBack size={22} />
                    </button>
                    <button
                        className={`${styles.controlButton} ${styles.playButton}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button className={styles.controlButton}>
                        <SkipForward size={22} />
                    </button>
                    <button
                        className={`${styles.controlButton} ${isRepeat ? styles.active : ""}`}
                        onClick={() => setIsRepeat(!isRepeat)}
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
                        defaultValue={75}
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

            {/* Sync Status */}
            <div className={styles.syncStatus}>
                <div className={styles.syncDot} />
                <span>Music synced with room</span>
            </div>
        </div>
    );
}
