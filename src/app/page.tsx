"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"; // Added useRef
import Link from "next/link";
import styles from "./page.module.css";
import { gsap } from "gsap"; // Added gsap import
console.log("Lucid.jpg"); // Force usage to ensure it is not tree-shaken if imported (though using public path)

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Play Icon for Logo (Replaced by Image)
// const PlayIcon = () => ( ... );

// Feature Icons
const GameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-9 9H9v-2H7v2H5v-2H7v-2h2v2h2v2zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
);

const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M4 6h16v2H4zm2 4h12v10H6zm4 3v4l3-2z" />
  </svg>
);

// Loading Spinner
const Spinner = () => (
  <svg className={styles.spinner} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
  </svg>
);

// Demo Icon
const DemoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showDemoInput, setShowDemoInput] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const welcomeCardRef = useRef(null); // Added useRef

  useEffect(() => {
    // Play sound on mount
    const audio = new Audio("/launch.mp3");
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio autoplay blocked:", e));

    if (isLoaded && user) {
      router.push("/dashboard");
    }

    // GSAP Animation for welcomeCard
    if (welcomeCardRef.current) {
      gsap.fromTo(
        welcomeCardRef.current,
        { autoAlpha: 0, y: 50 }, // from opacity 0, y 50px
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 } // to opacity 1, y 0px
      );
    }
  }, [user, isLoaded, router]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className={styles.onboarding}>
        <div className={styles.videoOverlay} />
        <div className={styles.welcomeCard}>
          <div className={styles.loadingContainer}>
            <Spinner />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.onboarding}>
      {/* Video Background (optional - shows animated gradient if no video) */}
      <video
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className={styles.videoOverlay} />

      {/* Welcome Card */}
      <div ref={welcomeCardRef} className={styles.welcomeCard}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            {/* <PlayIcon /> */}
            <img src="/logo.png" alt="SharePlay Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className={styles.logo}>SharePlay</h1>
        </div>

        {/* Welcome Text */}
        <h2 className={styles.welcomeTitle}>
          Watch, Listen & Play Together
        </h2>
        <p className={styles.welcomeSubtitle}>
          Create virtual rooms to enjoy videos, music, and games with friends — all perfectly synced in real-time.
        </p>

        {/* Google Login Button - Only show when user is not signed in */}
        {!user && (
          <SignInButton mode="modal">
            <button
              className={styles.googleButtonWhiteTheme}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </SignInButton>
        )}



        {/* Footer Links */}
        <div className={styles.footerLinks}>
          <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
          <span className={styles.footerSeparator}>•</span>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
