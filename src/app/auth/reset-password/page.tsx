"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { apiResetPassword } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import { ZodError } from "zod";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    try {
      const data = resetPasswordSchema.parse({ password, confirmPassword });
      setSubmitting(true);
      await apiResetPassword({ token, new_password: data.password });
      toast.success("Password reset successfully! You can now sign in.");
      router.push("/auth");
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputWrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    transition: "border-color 0.2s ease",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 14,
    fontSize: 20,
    color: "#666",
    pointerEvents: "none",
    userSelect: "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px 13px 44px",
    background: "transparent",
    border: "none",
    color: "#f5f5f5",
    fontSize: 15,
    fontFamily: "var(--font-inter), sans-serif",
    outline: "none",
    paddingRight: 44,
  };

  const toggleBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    fontSize: 20,
  };

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
          padding: "36px 28px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 48, color: "#ff4242", marginBottom: 12, display: "block" }}
          >
            password
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
            Reset Password
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              marginTop: 8,
            }}
          >
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#888",
                marginBottom: 8,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              New Password
            </label>
            <div
              style={inputWrapperStyle}
              onFocus={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,66,66,0.4)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <span className="material-symbols-outlined" style={iconStyle}>
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={toggleBtnStyle}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#888",
                marginBottom: 8,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Confirm Password
            </label>
            <div
              style={inputWrapperStyle}
              onFocus={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,66,66,0.4)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <span className="material-symbols-outlined" style={iconStyle}>
                lock
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={toggleBtnStyle}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              background: submitting ? "rgba(255,66,66,0.5)" : "#ff4242",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              borderRadius: 10,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a
            href="/auth"
            style={{
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

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
