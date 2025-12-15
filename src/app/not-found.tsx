"use client";

import Link from "next/link";
import { useEffect, useRef } from "react"; // Added useRef
import styles from "./not-found.module.css"; // Using new CSS module
import { Home, Compass, Bug } from "lucide-react"; // Added new icons
import { gsap } from "gsap"; // Added gsap import

export default function NotFound() {
  const errorRef = useRef<Array<HTMLSpanElement | null>>([]); // Initialized with correct type
  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const buttonGroupRef = useRef<HTMLDivElement>(null); // Explicitly typed useRef

  useEffect(() => {
    // GSAP Animation for 404 page elements
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      errorRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
    )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        messageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      );

    if (buttonGroupRef.current) { // Added null check
      const children = Array.from(buttonGroupRef.current.children) as HTMLElement[]; // Type assertion
      tl.fromTo(
        children, // Animate children (buttons)
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );
    }
  }, []);

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.cosmicBackground}>
        <div className={styles.stars}></div>
      </div>

      <div className={styles.notFoundContent}>
        {/* Animated 404 Text */}
        <h1 className={styles.errorCode}>
          {"404".split("").map((char, index) => (
            <span key={index} ref={(el: HTMLSpanElement | null) => {
              if (el) {
                errorRef.current[index] = el;
              }
            }}>
              {char}
            </span>
          ))}
        </h1>

        <h2 className={styles.title} ref={titleRef}>
          Lost in the Digital Cosmos
        </h2>

        <p className={styles.message} ref={messageRef}>
          It seems you&#39;ve ventured into uncharted territory. The page you&#39;re looking for has
          either moved to another galaxy or never existed.
        </p>

        <div className={styles.buttonGroup} ref={buttonGroupRef}>
          <Link href="/" className={styles.primaryButton}>
            <Home size={20} />
            Return to Civilization
          </Link>
          <Link href="/dashboard" className={styles.secondaryButton}>
            <Compass size={20} />
            Explore SharePlay
          </Link>
          <a href="mailto:support@shareplay.com" className={styles.secondaryButton}>
            <Bug size={20} />
            Report an Anomaly
          </a>
        </div>
      </div>
    </div>
  );
}
