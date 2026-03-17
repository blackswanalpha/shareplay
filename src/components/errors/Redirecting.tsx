"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SharePlayMark } from "@/components/ui/Logo";
import { ArrowBendUpRight, ArrowSquareOut } from "@phosphor-icons/react";
import Link from "next/link";

interface RedirectingProps {
  /** Where the user is being redirected to */
  destination: string;
  /** Optional human-readable label for the destination */
  label?: string;
  /** Reason for the redirect */
  reason?: string;
  /** HTTP status code (301, 302, 307, 308) */
  code?: 301 | 302 | 307 | 308;
  /** Auto-redirect delay in seconds (0 = no auto-redirect) */
  delay?: number;
}

const codeLabels: Record<number, string> = {
  301: "Permanently moved",
  302: "Temporarily moved",
  307: "Temporary redirect",
  308: "Permanent redirect",
};

export function Redirecting({
  destination,
  label,
  reason,
  code = 301,
  delay = 5,
}: RedirectingProps) {
  const [countdown, setCountdown] = useState(delay);

  useEffect(() => {
    if (delay <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = destination;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [delay, destination]);

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
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
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
        {/* Code with redirect icon */}
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
              color: "rgba(59,130,246,0.08)",
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            {code}
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
              animate={{ x: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowBendUpRight size={48} weight="duotone" color="#3b82f6" />
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
            Moving the party
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "15px",
              color: "#888",
              lineHeight: 1.6,
            }}
          >
            {reason ||
              `This content has been ${code === 301 || code === 308 ? "permanently" : "temporarily"} moved to a new location.`}
          </p>
        </div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "12px",
              color: "#3b82f6",
              fontWeight: 500,
            }}
          >
            {code}
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12px",
              color: "rgba(59,130,246,0.7)",
            }}
          >
            {codeLabels[code]}
          </span>
        </motion.div>

        {/* Destination panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              textAlign: "left",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#555",
              }}
            >
              Redirecting to
            </span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "13px",
                color: "#f5f5f5",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label || destination}
            </span>
          </div>
          <ArrowSquareOut
            size={18}
            color="#555"
            style={{ flexShrink: 0 }}
          />
        </motion.div>

        {/* Countdown + actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          {delay > 0 && countdown > 0 && (
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "13px",
                color: "#555",
              }}
            >
              Redirecting in{" "}
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  color: "#888",
                }}
              >
                {countdown}s
              </span>
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <a
              href={destination}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                background: "#ff3b3b",
                color: "#fff",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e63535";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(255,59,59,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ff3b3b";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Go now
            </a>
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
              Stay here
            </Link>
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: "8px" }}
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
