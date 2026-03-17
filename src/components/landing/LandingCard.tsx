"use client";

import { useReducedMotion, motion } from "framer-motion";
import Image from "next/image";

export function LandingCard() {
  const reducedMotion = useReducedMotion();

  function anim(delay: number, extra?: Record<string, unknown>) {
    if (reducedMotion) return {};
    return {
      initial: { opacity: 0, ...extra },
      animate: { opacity: 1, y: 0, scale: 1 },
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
      }}
    >
      <motion.div
        {...anim(0.2, { y: 24 })}
        className="landing-card"
        style={{
          width: "100%",
          maxWidth: "400px",
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
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reducedMotion
              ? undefined
              : {
                  delay: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }
          }
        >
          <Image
            src="/logo.png"
            alt="SharePlay"
            width={180}
            height={180}
            priority
            style={{ objectFit: "contain" }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          {...anim(0.55)}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "16px",
            color: "#888",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Watch together. Listen together.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          {...anim(0.65, { y: 12 })}
          style={{ width: "100%", marginTop: "4px" }}
        >
          <a
            href="/auth"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "52px",
              background: "#ff3b3b",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "#e63535";
              el.style.boxShadow = "0 0 30px rgba(255,59,59,0.4)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "#ff3b3b";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
          >
            Get Started
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
