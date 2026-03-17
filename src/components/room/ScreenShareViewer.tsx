"use client";

import { useRef, useEffect, useState } from "react";

interface ScreenShareViewerProps {
  stream: MediaStream;
  sharerUsername: string;
  isSharer: boolean;
  onStop: () => void;
}

export function ScreenShareViewer({
  stream,
  sharerUsername,
  isSharer,
  onStop,
}: ScreenShareViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        background: "#000",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxHeight: isFullscreen ? "100vh" : "60vh",
          objectFit: "contain",
          background: "#000",
          display: "block",
        }}
      />

      {/* Top overlay bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "3px 8px",
              background: "rgba(255,66,66,0.9)",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: "var(--font-inter), sans-serif",
              animation: "pulse-badge 2s ease-in-out infinite",
            }}
          >
            LIVE
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            {sharerUsername} is sharing their screen
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isSharer && (
            <button
              onClick={onStop}
              style={{
                padding: "6px 14px",
                background: "#ff4242",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e63535")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ff4242")}
            >
              Stop Sharing
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {isFullscreen ? (
                <>
                  <polyline points="4 1 4 4 1 4" />
                  <polyline points="12 1 12 4 15 4" />
                  <polyline points="4 15 4 12 1 12" />
                  <polyline points="12 15 12 12 15 12" />
                </>
              ) : (
                <>
                  <polyline points="1 5 1 1 5 1" />
                  <polyline points="11 1 15 1 15 5" />
                  <polyline points="15 11 15 15 11 15" />
                  <polyline points="5 15 1 15 1 11" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
