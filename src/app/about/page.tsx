"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const reducedMotion = useReducedMotion();

  function anim(delay: number, extra?: Record<string, unknown>) {
    if (reducedMotion) return {};
    return {
      initial: { opacity: 0, ...extra },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay, ease: "easeOut" as const },
    };
  }

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: "#0a0a0a",
      }}
    >
      <motion.div
        {...anim(0.2, { y: 24 })}
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "48px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow:
            "0 0 30px rgba(255,59,59,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column" as const,
          gap: "20px",
        }}
      >
        <motion.h1
          {...anim(0.3)}
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
          }}
        >
          About Us
        </motion.h1>

        <motion.p
          {...anim(0.4)}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "15px",
            color: "#aaa",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          SharePlay is built for people who believe the best moments are shared.
          Whether it's a movie night with friends across the globe or discovering
          music together in real time, we make it feel like you're in the same
          room.
        </motion.p>

        <motion.p
          {...anim(0.5)}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "15px",
            color: "#aaa",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Our mission is simple: bring people closer through synchronized
          entertainment. No more countdowns, no more "are you ready?" — just
          press play and enjoy together.
        </motion.p>

        <motion.div {...anim(0.6, { y: 12 })} style={{ marginTop: "8px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ff3b3b",
              textDecoration: "none",
            }}
          >
            &larr; Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
