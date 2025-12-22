"use client";

import React from 'react';
import {
    Mic,
    Video,
    Settings,
    Grid,
    Bell,
    User,
    LogOut,
    CheckCircle2,
    Lock,
    Globe,
    Film,
    Music,
    Gamepad2
} from 'lucide-react';
import styles from './LobbyPage.module.css';

interface LobbyPageProps {
    room: {
        name: string;
        hostEmail?: string;
        features: {
            video: boolean;
            music: boolean;
            games: boolean;
        };
        isPublic?: boolean;
    };
    user?: {
        fullName?: string | null;
        imageUrl?: string;
        primaryEmailAddress?: { emailAddress: string } | null;
    } | null;
    onLeave: () => void;
}

export default function LobbyPage({ room, user, onLeave }: LobbyPageProps) {
    const hostDisplayName = room.hostEmail || "Host";

    return (
        <div className={styles.lobbyContainer}>
            {/* Background Blobs */}
            <div className={`${styles.blob} ${styles.blob1}`}></div>
            <div className={`${styles.blob} ${styles.blob2}`}></div>

            <div className={styles.contentWrapper}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}>
                            <Grid size={24} />
                        </div>
                        <h1 className={styles.appTitle}>SharePlay</h1>
                    </div>

                    <div className={styles.userArea}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        {user ? (
                            <img
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatar}></div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.lobbyGrid}>

                        {/* Room Info Card */}
                        <div className={styles.glassPanel}>
                            <div className={styles.roomTag}>
                                <div className={styles.pulseDot}></div>
                                Lobby Mode
                            </div>
                            <h2 className={styles.roomTitle}>{room.name}</h2>
                            <div className={styles.hostInfo}>
                                <User size={18} />
                                <span>Hosted by <strong>@{hostDisplayName}</strong></span>
                            </div>

                            <div className={styles.statusArea}>
                                <div className={styles.statusMessage}>
                                    <CheckCircle2 size={24} className="text-emerald-400" />
                                    <div className={styles.statusText}>
                                        <span className={styles.primaryStatus}>Waiting for Host</span>
                                        <span className={styles.secondaryStatus}>You'll be admitted automatically once approved.</span>
                                    </div>
                                </div>

                                <button onClick={onLeave} className={styles.leaveBtn}>
                                    <LogOut size={18} />
                                    <span>Leave Lobby</span>
                                </button>
                            </div>

                            {/* Features Section (Real Data) */}
                            <div className={styles.participantsSection}>
                                <h3 className={styles.sectionTitle}>Room Features</h3>
                                <div className={styles.tags}>
                                    {room.features.video && (
                                        <div className={styles.tag}>
                                            <Film size={14} /> Video Sync
                                        </div>
                                    )}
                                    {room.features.music && (
                                        <div className={styles.tag}>
                                            <Music size={14} /> Audio Sharing
                                        </div>
                                    )}
                                    {room.features.games && (
                                        <div className={styles.tag}>
                                            <Gamepad2 size={14} /> Interactive Games
                                        </div>
                                    )}
                                    {room.isPublic ? (
                                        <div className={styles.tag}>
                                            <Globe size={14} /> Public Room
                                        </div>
                                    ) : (
                                        <div className={styles.tag}>
                                            <Lock size={14} /> Private
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Media Preview (Visual only for now, but real styling) */}
                        <div className={styles.previewPanel}>
                            <div className={styles.previewContainer}>
                                <div className={styles.previewPlaceholder}>
                                    {/* Abstract visual representing 'Ready to Join' */}
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
                                        <Video size={48} strokeWidth={1} />
                                        <p className="text-sm font-medium">Camera Preview (Admittance Pending)</p>
                                    </div>
                                </div>
                                <div className={styles.previewControls}>
                                    <button className={styles.controlBtn}>
                                        <Mic size={20} />
                                    </button>
                                    <button className={styles.controlBtn}>
                                        <Video size={20} />
                                    </button>
                                    <button className={styles.controlBtn}>
                                        <Settings size={20} />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-xs font-bold text-white backdrop-blur border border-white/10 uppercase tracking-widest">
                                    Local Stage
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
