"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css"; // Reuse existing styles for consistency
import { Home } from "lucide-react";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className={styles.onboarding}>
            {/* Background Reuse */}
            <div className={styles.videoOverlay} style={{ background: 'rgba(0,0,0,0.6)' }} />

            <div className={styles.welcomeCard} style={{ maxWidth: '400px', animation: 'fadeInUp 0.8s ease-out forwards' }}>

                {/* Animated 404 Text */}
                <h1 style={{
                    fontSize: '6rem',
                    fontWeight: '900',
                    lineHeight: '1',
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem',
                    opacity: 0,
                    animation: 'fadeInUp 0.8s ease-out 0.2s forwards'
                }}>
                    404
                </h1>

                <h2 className={styles.welcomeTitle} style={{
                    opacity: 0,
                    animation: 'fadeInUp 0.8s ease-out 0.4s forwards'
                }}>
                    Page Not Found
                </h2>

                <p className={styles.welcomeSubtitle} style={{
                    marginBottom: '32px',
                    opacity: 0,
                    animation: 'fadeInUp 0.8s ease-out 0.6s forwards'
                }}>
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div style={{ opacity: 0, animation: 'fadeInUp 0.8s ease-out 0.8s forwards' }}>
                    <Link href="/" className={styles.demoSubmitButton} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        width: '100%',
                        justifyContent: 'center'
                    }}>
                        <Home size={20} />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
