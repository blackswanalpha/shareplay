"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, LogOut, Moon, Sun, Monitor, Shield, Bell, User } from "lucide-react";
import styles from "./page.module.css";
import { useState } from "react";

export default function SettingsPage() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [theme, setTheme] = useState("system"); // Mock state for now

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className={styles.backButton}
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className={styles.title}>Settings & Preferences</h1>
                <p className={styles.subtitle}>Customize how SharePlay looks and feels for you.</p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <Monitor size={20} />
                    Appearance
                </h2>
                <div className={styles.grid}>
                    <div
                        className={`${styles.card} ${theme === 'light' ? styles.cardActive : ''}`}
                        onClick={() => setTheme('light')}
                    >
                        <div className={styles.cardIcon}>
                            <Sun />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Light Mode</h3>
                            <p>Clean and bright interface for daytime use.</p>
                        </div>
                    </div>

                    <div
                        className={`${styles.card} ${theme === 'dark' ? styles.cardActive : ''}`}
                        onClick={() => setTheme('dark')}
                    >
                        <div className={styles.cardIcon}>
                            <Moon />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Dark Mode</h3>
                            <p>Easy on the eyes, perfect for low-light environments.</p>
                        </div>
                    </div>

                    <div
                        className={`${styles.card} ${theme === 'system' ? styles.cardActive : ''}`}
                        onClick={() => setTheme('system')}
                    >
                        <div className={styles.cardIcon}>
                            <Monitor />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>System Default</h3>
                            <p>Automatically syncs with your device's appearance settings.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <Shield size={20} />
                    Account & Security
                </h2>
                <div className={styles.grid}>
                    <div
                        className={styles.card}
                        onClick={() => router.push('/dashboard/profile')}
                    >
                        <div className={styles.cardIcon}>
                            <User />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Profile Settings</h3>
                            <p>Update your personal information, email, and avatar.</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>
                            <Bell />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Notifications</h3>
                            <p>Manage how and when you want to be notified.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.dangerZone}>
                <div className={styles.dangerHeader}>
                    <div>
                        <h3 className={styles.dangerTitle}>Session Management</h3>
                        <p className="text-sm text-red-300/60 mt-1">End your current session on this device.</p>
                    </div>
                    <button
                        className={styles.logoutButton}
                        onClick={() => signOut({ redirectUrl: "/" })}
                    >
                        <LogOut size={18} className="inline mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="text-center mt-12 mb-8 text-white/20 text-xs">
                <p>SharePlay v1.0.0 • Build 2024.12</p>
            </div>
        </div>
    );
}
