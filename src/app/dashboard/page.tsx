"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Play, Music, Gamepad2, Users, ArrowRight, Sparkles, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import CreateRoomDialog from "@/components/room/CreateRoomDialog";
import JoinRoomDialog from "@/components/room/JoinRoomDialog";
import { api } from "@/lib/api";
import { sessionManager } from "@/lib/sessionManager";
import UserMenu from "@/components/ui/UserMenu"; // New import
import styles from "./page.module.css";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: "primary" | "accent";
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
    return (
        <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles[color]}`}>
                {icon}
            </div>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDescription}>{description}</p>
        </div>
    );
};

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/");
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        if (isLoaded && user && user.primaryEmailAddress?.emailAddress) {
            const email = user.primaryEmailAddress.emailAddress;
            const checkActiveSession = async () => {
                try {
                    // First get auth token for sessionManager
                    console.log("Getting token for email:", email);
                    const token = await api.getTokenForEmail(email);
                    console.log("Token obtained successfully");
                    
                    sessionManager.setAuthToken(token);
                    console.log("Token set in sessionManager");

                    // Check if user has any active sessions
                    console.log("Checking for active sessions...");
                    const activeSessions = await sessionManager.getUserSessions(true);
                    console.log("Active sessions retrieved:", activeSessions);

                    // Only redirect if user has an active session (is currently in a room)
                    if (activeSessions && activeSessions.length > 0) {
                        // Get the room for the active session
                        const hostedRooms = await api.getHostedRooms(email);
                        const activeRoom = hostedRooms.find(room =>
                            activeSessions.some(session => session.room_id === room.id)
                        );

                        if (activeRoom) {
                            console.log("Redirecting to active room:", activeRoom.code);
                            router.push(`/room/${activeRoom.code}`);
                        }
                    }
                } catch (error) {
                    console.error("Failed to check for active sessions", error);
                    
                    // Log additional details about the error
                    if (error instanceof Error) {
                        console.error("Error message:", error.message);
                        console.error("Error status:", (error as any).status);
                    }
                    
                    // Don't redirect on authentication errors - user can still use dashboard
                    // This prevents the dashboard from being unusable if there are auth issues
                }
            };
            checkActiveSession();
        }
    }, [isLoaded, user, router]);

    const handleJoinWithCode = () => {
        if (roomCode.trim()) {
            setJoinDialogOpen(true);
        }
    };


    const handleSignOut = async () => {
        await signOut({ redirectUrl: "/" });
    };

    if (!isLoaded || !user) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Background Effects */}
            {/* Background Effects */}
            <div className={styles.backgroundEffects}>
                <div className={`${styles.blob} ${styles.type1}`} />
                <div className={`${styles.blob} ${styles.type2}`} />
                <div className={`${styles.blob} ${styles.type3}`} />
            </div>

            {/* Grid Pattern */}
            <div className={styles.gridPattern} />

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <div className={styles.logoIcon}>
                        {/* <Play size={20} /> */}
                        <img src="/logo.png" alt="SharePlay Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                </div>

                <UserMenu />
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                {/* Main Heading */}
                <h1 className={styles.heroTitle}>
                    <span className={styles.gradientText}>SharePlay</span>
                </h1>

                <p className={styles.heroSubtitle}>
                    Create a room, invite your friends, and enjoy movies, music, and games together in perfect sync — no matter the distance.
                </p>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <Button variant="hero" size="xl" onClick={() => setCreateDialogOpen(true)}>
                        Create Room
                        <ArrowRight size={20} />
                    </Button>

                    <div className={styles.actionSeparator}></div>

                    <div className={styles.joinSection}>
                        <Input
                            placeholder="Enter room code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className={styles.codeInput}
                            maxLength={6}
                        />

                    </div>
                    <Button variant="darkHero" size="xl" onClick={handleJoinWithCode}>
                        Join
                    </Button>
                </div>

                {/* Dialogs */}
                <CreateRoomDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
                <JoinRoomDialog
                    open={joinDialogOpen}
                    onOpenChange={setJoinDialogOpen}
                    initialCode={roomCode}
                />

                {/* Feature Cards */}
                <div className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<Play size={24} />}
                        title="Watch Together"
                        description="Sync YouTube and video content with everyone in your room"
                        color="primary"
                    />
                    <FeatureCard
                        icon={<Music size={24} />}
                        title="Listen Together"
                        description="Share Spotify playlists and vibe to the same beat"
                        color="accent"
                    />
                    <FeatureCard
                        icon={<Gamepad2 size={24} />}
                        title="Play Together"
                        description="Enjoy multiplayer games right in your browser"
                        color="primary"
                    />
                </div>
            </section>

            {/* Floating Elements */}
            <div className={`${styles.floatingElement} ${styles.type1}`} />
            <div className={`${styles.floatingElement} ${styles.type2}`} />
            <div className={`${styles.floatingElement} ${styles.type3}`} />

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} SharePlay. All rights reserved.</p>
            </footer>
        </div >
    );
}
