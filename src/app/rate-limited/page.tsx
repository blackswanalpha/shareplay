"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SharePlayMark } from "@/components/ui/Logo";
import { Timer, House, ArrowClockwise } from "@phosphor-icons/react";
import Link from "next/link";

export default function RateLimited() {
  const searchParams = useSearchParams();
  const retryParam = searchParams.get("retry");
  const initialSeconds = retryParam ? Math.min(parseInt(retryParam, 10), 300) : 60;
  const [countdown, setCountdown] = useState(
    isNaN(initialSeconds) ? 60 : initialSeconds
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric background */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          padding: "48px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Error code with timer icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ position: "relative" }}
        >
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "120px",
              fontWeight: 700,
              lineHeight: 1,
              color: "rgba(249,115,22,0.08)",
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            429
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Timer size={48} weight="duotone" color="#f97316" />
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "28px",
              fontWeight: 600,
              color: "#f5f5f5",
              letterSpacing: "-0.02em",
            }}
          >
            Slow down
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "15px",
              color: "#888",
              lineHeight: 1.6,
            }}
          >
            You&apos;re making requests too quickly. Take a breather and try
            again in a moment.
          </p>
        </div>

        {/* Countdown timer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            borderRadius: "12px",
            background: "rgba(249,115,22,0.06)",
            border: "1px solid rgba(249,115,22,0.15)",
          }}
        >
          <Timer size={20} weight="duotone" color="#f97316" />
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "20px",
              fontWeight: 600,
              color: countdown > 0 ? "#f97316" : "#22c55e",
              minWidth: "60px",
            }}
          >
            {countdown > 0 ? `${countdown}s` : "Ready"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "13px",
              color: "#888",
            }}
          >
            {countdown > 0 ? "until you can retry" : "to go!"}
          </span>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => window.location.reload()}
            disabled={countdown > 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              background: countdown > 0 ? "rgba(249,115,22,0.2)" : "#f97316",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: countdown > 0 ? "not-allowed" : "pointer",
              opacity: countdown > 0 ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <ArrowClockwise size={18} weight="bold" />
            {countdown > 0 ? "Wait..." : "Try again"}
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              color: "#f5f5f5",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <House size={18} weight="bold" />
            Go home
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: "16px" }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              opacity: 0.4,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.4";
            }}
          >
            <SharePlayMark size={20} />
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#888",
              }}
            >
              SharePlay
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
