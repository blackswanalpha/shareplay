"use client";

import { Play, Music, Gamepad2 } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import MusicPlayer from "./MusicPlayer";
import GamesSection from "./GamesSection";
import { VideoPlaylistState } from "./VideoPlayer"; // Import VideoPlaylistState
import styles from "./RoomMainContent.module.css";

type ActiveTab = "video" | "music" | "games";

interface RoomMainContentProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    availableTabs: ActiveTab[];
    isHost: boolean;
    videoState: any; // Define more specific types if possible
    onVideoStateChange: (newState: any, shouldSync?: boolean) => void;
    videoPlaylistState?: VideoPlaylistState; // Add for video playlist
    onVideoPlaylistChange?: (newPlaylistState: VideoPlaylistState, shouldSync?: boolean) => void; // Add for video playlist
    onPlaylistToggle?: (isOpen: boolean) => void;
    musicState: any; // Define more specific types if possible
    onMusicStateChange: (newState: any, shouldSync?: boolean) => void;
}

export default function RoomMainContent({
    activeTab,
    setActiveTab,
    availableTabs,
    isHost,
    videoState,
    onVideoStateChange,
    videoPlaylistState,
    onVideoPlaylistChange,
    onPlaylistToggle,
    musicState,
    onMusicStateChange,
}: RoomMainContentProps) {

    // Derived Video Title
    const currentVideoTitle = videoPlaylistState?.playlist[videoPlaylistState?.current_index]?.title || "Custom Stream";
    const displayTitle = videoState.url ? currentVideoTitle : "No Video Selected";

    return (
        <div className={styles.contentArea}>
            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                {availableTabs.includes("video") && (
                    <button
                        className={`${styles.tabButton} ${activeTab === "video" ? styles.active : ""}`}
                        onClick={() => setActiveTab("video")}
                    >
                        <Play size={18} />
                        <span>Live Stage</span>
                    </button>
                )}
                {availableTabs.includes("music") && (
                    <button
                        className={`${styles.tabButton} ${activeTab === "music" ? styles.active : ""}`}
                        onClick={() => setActiveTab("music")}
                    >
                        <Music size={18} />
                        <span>Music Queue</span>
                    </button>
                )}
                {availableTabs.includes("games") && (
                    <button
                        className={`${styles.tabButton} ${activeTab === "games" ? styles.active : ""}`}
                        onClick={() => setActiveTab("games")}
                    >
                        <Gamepad2 size={18} />
                        <span>Arcade</span>
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === "video" && (
                    <>
                        <VideoPlayer
                            isHost={isHost}
                            videoState={videoState}
                            onStateChange={onVideoStateChange}
                            playlistState={videoPlaylistState}
                            onPlaylistChange={onVideoPlaylistChange}
                            onPlaylistToggle={onPlaylistToggle}
                        />

                        {/* Meta Section */}
                        <div className={styles.metaSection}>
                            <div className={styles.metaCard}>
                                <div className={styles.playingInfo}>
                                    <div className={styles.playingIcon}>
                                        <Play size={24} />
                                    </div>
                                    <div className={styles.playingText}>
                                        <h3>Now Playing</h3>
                                        <p>{displayTitle}</p>
                                    </div>
                                </div>
                                <button className={styles.playlistBtn}>Playlist</button>
                            </div>

                            <div className={styles.linkCard}>
                                <span className={styles.playingText} style={{ minWidth: 'fit-content' }}>
                                    <h3>Room Link</h3>
                                </span>
                                <div className={styles.linkInput}>
                                    <span className={styles.linkCode}>{typeof window !== 'undefined' ? window.location.href : '...'}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {activeTab === "music" && (
                    <MusicPlayer
                        isHost={isHost}
                        musicState={musicState}
                        onStateChange={onMusicStateChange}
                    />
                )}
                {activeTab === "games" && <GamesSection />}
            </div>
        </div>
    );
}
