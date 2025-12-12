"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Play, Music, Gamepad2, Users, ArrowRight, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import CreateRoomDialog from "@/components/room/CreateRoomDialog";
import JoinRoomDialog from "@/components/room/JoinRoomDialog";
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
    const { data: session, status } = useSession();
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const handleJoinWithCode = () => {
        if (roomCode.trim()) {
            setJoinDialogOpen(true);
        }
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    if (status === "loading" || !session) {
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
            <div className={styles.backgroundEffects}>
                <div className={styles.blob1} />
                <div className={styles.blob2} />
                <div className={styles.blob3} />
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
                    <span className={styles.logoText}>SharePlay</span>
                </div>

                <div className={styles.userSection}>
                    {session.user?.image && (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={36}
                            height={36}
                            className={styles.avatar}
                            unoptimized
                        />
                    )}
                    <span className={styles.userName}>{session.user?.name}</span>
                    <button className={styles.signOutButton} onClick={handleSignOut}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                {/* Badge */}
                <div className={styles.badge}>
                    <Sparkles size={14} />
                    <span>Experience entertainment together</span>
                </div>

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
                        <Button variant="glass" size="lg" onClick={handleJoinWithCode}>
                            Join
                        </Button>
                    </div>
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
            <div className={`${styles.floatingElement} ${styles.floatTopRight}`}>
                <Users size={24} />
            </div>
            <div className={`${styles.floatingElement} ${styles.floatBottomLeft}`}>
                <Music size={24} />
            </div>
        </div >
    );
}
