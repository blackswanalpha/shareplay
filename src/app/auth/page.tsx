"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { loginSchema, registerSchema } from "@/lib/validations";
import { ZodError } from "zod";

export default function AuthPage() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#1a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (tab === "login") {
        const data = loginSchema.parse({ email, password });
        setSubmitting(true);
        await login(data.email, data.password);
        router.push("/dashboard");
      } else {
        const data = registerSchema.parse({ username, email, password, confirmPassword });
        setSubmitting(true);
        await register(data.username, data.email, data.password);
        toast.success("Account created! Check the server console for the verification link.");
        switchTab("login");
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function switchTab(t: "login" | "signup") {
    setTab(t);
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#888",
    marginBottom: 8,
    fontFamily: "var(--font-inter), sans-serif",
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
      {/* Ambient orb 1 */}
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
      {/* Ambient orb 2 */}
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
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: "32px 28px 0", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#ff4242" strokeWidth="2.5" />
              <polygon points="13,10 13,22 23,16" fill="#ff4242" />
            </svg>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#f5f5f5",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              SharePlay
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              marginTop: 4,
            }}
          >
            Watch together. Listen together.
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            margin: "24px 28px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: "14px",
                background: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid #ff4242" : "2px solid transparent",
                color: tab === t ? "#f5f5f5" : "#666",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
          {tab === "signup" && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Username</label>
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
                  person
                </span>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Email</label>
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
                email
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Password</label>
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
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

          {tab === "signup" && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Confirm Password</label>
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
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 44 }}
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
          )}

          {tab === "login" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
                fontSize: 13,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#ff4242" }}
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                style={{
                  color: "#ff4242",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                }}
              >
                Forgot password?
              </a>
            </div>
          )}

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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background = "#e63535";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 30px rgba(255,66,66,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background = "#ff4242";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }
            }}
          >
            {submitting
              ? "Please wait..."
              : tab === "login"
                ? "Sign In"
                : "Create Account"}
            {!submitting && (
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            )}
          </button>


          {/* Terms footer */}
          <p
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "#555",
              textAlign: "center",
              fontFamily: "var(--font-inter), sans-serif",
              lineHeight: 1.5,
            }}
          >
            By continuing, you agree to our{" "}
            <span style={{ color: "#888", cursor: "pointer" }}>Terms of Service</span> and{" "}
            <span style={{ color: "#888", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
