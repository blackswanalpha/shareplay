"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { apiVerifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    apiVerifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
        toast.success("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
        toast.error("Email verification failed");
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "20%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255, 66, 66, 0.15)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          right: "15%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(96, 16, 16, 0.25)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? undefined : { duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(40, 20, 20, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 66, 66, 0.15)",
          borderRadius: 20,
          boxShadow: "0 0 40px rgba(255,66,66,0.08), 0 16px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          padding: "48px 28px",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 48,
                color: "#ff4242",
                marginBottom: 16,
                display: "block",
                animation: "spin 1s linear infinite",
              }}
            >
              progress_activity
            </span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f5f5f5",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                margin: 0,
              }}
            >
              Verifying Email...
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
                marginTop: 8,
              }}
            >
              Please wait while we verify your email address.
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === "success" && (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: "#34d399", marginBottom: 16, display: "block" }}
            >
              check_circle
            </span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f5f5f5",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                margin: 0,
              }}
            >
              Email Verified!
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: "#ef4444", marginBottom: 16, display: "block" }}
            >
              error
            </span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f5f5f5",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                margin: 0,
              }}
            >
              Verification Failed
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                fontFamily: "var(--font-inter), sans-serif",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
          </>
        )}

        <div style={{ marginTop: 28 }}>
          <a
            href="/auth"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#ff4242",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            &larr; Back to sign in
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#1a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
          }}
        >
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
