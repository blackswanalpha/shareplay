"use client";

import { useState, useCallback } from "react";
import { MagnifyingGlass, Play, Plus, SpinnerGap, X } from "@phosphor-icons/react";
import { apiGetVideoInfo } from "@/lib/api";
import type { VideoInfoResponse } from "@/lib/types";

interface YouTubeUrlBarProps {
  onPlayNow: (url: string, title: string) => void;
  onAddToQueue: (url: string) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function YouTubeUrlBar({ onPlayNow, onAddToQueue }: YouTubeUrlBarProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<VideoInfoResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const info = await apiGetVideoInfo(url.trim());
      setPreview(info);
    } catch {
      setError("Could not load video info. Check the URL.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePlayNow = () => {
    if (preview) {
      onPlayNow(url.trim(), preview.title);
      setPreview(null);
      setUrl("");
    }
  };

  const handleAddToQueue = () => {
    if (preview) {
      onAddToQueue(url.trim());
      setPreview(null);
      setUrl("");
    }
  };

  const handleClear = () => {
    setPreview(null);
    setUrl("");
    setError("");
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* URL Input */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "0 14px",
            transition: "border-color 0.2s ease",
          }}
        >
          <MagnifyingGlass size={18} style={{ color: "#666", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Paste a YouTube URL to watch together..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "12px 10px",
              background: "transparent",
              border: "none",
              color: "#f5f5f5",
              fontSize: 13,
              fontFamily: "var(--font-inter), sans-serif",
              outline: "none",
            }}
          />
          {url && (
            <button
              onClick={handleClear}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                color: "#555",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!url.trim() || loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            background: url.trim() ? "#ff4242" : "rgba(255,255,255,0.05)",
            border: url.trim() ? "none" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: url.trim() ? "#fff" : "#555",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            cursor: url.trim() ? "pointer" : "default",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
        >
          {loading ? <SpinnerGap size={18} className="animate-spin" /> : "Load"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#ff4242",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {error}
        </p>
      )}

      {/* Preview Card */}
      {preview && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 14,
            padding: 14,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {preview.thumbnail_url && (
            <img
              src={preview.thumbnail_url}
              alt={preview.title}
              style={{
                width: 120,
                height: 68,
                borderRadius: 8,
                objectFit: "cover",
                flexShrink: 0,
                background: "#111",
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#f5f5f5",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 4,
              }}
            >
              {preview.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {preview.uploader && (
                <span style={{ fontSize: 12, color: "#888", fontFamily: "var(--font-inter), sans-serif" }}>
                  {preview.uploader}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: "#666",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {formatDuration(preview.duration_seconds)}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handlePlayNow}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#ff4242",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-inter), sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Play size={14} weight="fill" />
              Play Now
            </button>
            <button
              onClick={handleAddToQueue}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#ccc",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-inter), sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Plus size={14} />
              Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
