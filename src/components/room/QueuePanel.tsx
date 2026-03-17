"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  MusicNotes,
  Shuffle,
  Trash,
  Link,
  Plus,
  DotsSixVertical,
  CaretUp,
  CaretDown,
  X,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import { queueAtom, playerStateAtom } from "@/store/roomAtoms";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import type { SocketActions } from "@/hooks/useSocket";

interface QueuePanelProps {
  actions: SocketActions;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QueuePanel({ actions }: QueuePanelProps) {
  const queue = useAtomValue(queueAtom);
  const playerState = useAtomValue(playerStateAtom);
  const { canSubmitMedia } = useCurrentRole();
  const [urlInput, setUrlInput] = useState("");
  const [recentExpanded, setRecentExpanded] = useState(false);

  const upNextItems = queue.filter(
    (t) => t.status !== "played" && t.status !== "skipped"
  );
  const recentlyPlayed = queue.filter(
    (t) => t.status === "played" || t.status === "skipped"
  );
  const hasNowPlaying = !!playerState.videoUrl;
  const progressPct =
    playerState.duration > 0
      ? (playerState.currentTime / playerState.duration) * 100
      : 0;

  const handleAdd = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    actions.addToPlaylist(trimmed);
    setUrlInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 8,
        overflowY: "auto",
        flex: 1,
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MusicNotes size={20} weight="fill" style={{ color: "#ff4242" }} />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#f5f5f5",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            Playlist
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#555",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            ({queue.length})
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            aria-label="Shuffle"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: "rgba(255,66,66,0.1)",
              border: "1px solid rgba(255,66,66,0.2)",
              borderRadius: 8,
              color: "#ff4242",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,66,66,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,66,66,0.1)";
            }}
          >
            <Shuffle size={16} weight="bold" />
          </button>
          <button
            aria-label="Clear played"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#888",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* Now Playing Card */}
      {hasNowPlaying && (
        <div
          style={{
            background: "rgba(255,66,66,0.08)",
            border: "1px solid rgba(255,66,66,0.15)",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#ff4242",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            NOW PLAYING
          </span>
          <div style={{ display: "flex", gap: 12 }}>
            {playerState.thumbnailUrl && (
              <img
                src={playerState.thumbnailUrl}
                alt={playerState.title}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  objectFit: "cover",
                  background: "#1a1a1a",
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#f5f5f5",
                  fontFamily: "var(--font-inter), sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {playerState.title || "Untitled"}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  fontFamily: "var(--font-inter), sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {playerState.subtitle}
              </p>
              <span
                style={{
                  fontSize: 11,
                  color: "#555",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {formatDuration(playerState.currentTime)} /{" "}
                {formatDuration(playerState.duration)}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "#ff4242",
                borderRadius: 2,
                transition: "width 0.3s linear",
              }}
            />
          </div>
          {playerState.subtitle && (
            <span
              style={{
                fontSize: 11,
                color: "#555",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Added by {playerState.subtitle}
            </span>
          )}
        </div>
      )}

      {/* Add to Queue */}
      {canSubmitMedia && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "0 12px",
              height: 40,
            }}
          >
            <Link size={16} style={{ color: "#555", flexShrink: 0 }} />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste video URL..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f5f5f5",
                fontSize: 13,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
          </div>
          <button
            onClick={handleAdd}
            aria-label="Add to playlist"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "rgba(255,66,66,0.15)",
              border: "1px solid rgba(255,66,66,0.3)",
              borderRadius: 10,
              color: "#ff4242",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,66,66,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,66,66,0.15)";
            }}
          >
            <Plus size={20} weight="bold" />
          </button>
        </div>
      )}

      {/* Up Next Section */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#888",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        UP NEXT
      </p>

      {upNextItems.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MusicNotes size={24} weight="duotone" style={{ color: "#333" }} />
          <p
            style={{
              fontSize: 12,
              color: "#555",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Queue is empty.{canSubmitMedia ? " Add a URL above." : ""}
          </p>
        </div>
      )}

      {upNextItems.map((track) => (
        <div
          key={track.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 4px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
          }}
        >
          <DotsSixVertical
            size={16}
            style={{ color: "#333", flexShrink: 0, cursor: "grab" }}
          />
          {track.album_art_url && (
            <img
              src={track.album_art_url}
              alt={track.title}
              style={{
                width: 48,
                height: 36,
                borderRadius: 6,
                objectFit: "cover",
                background: "#1a1a1a",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#f5f5f5",
                fontFamily: "var(--font-inter), sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {track.title}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#555",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {track.artist}
              {track.duration_seconds > 0 &&
                ` · ${formatDuration(track.duration_seconds)}`}
            </p>
          </div>

          {/* Vote column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => actions.votePlaylistItem(track.id, "up")}
              aria-label="Vote up"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 20,
                background: "transparent",
                border: "none",
                color: "#555",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#22c55e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#555";
              }}
            >
              <CaretUp size={14} weight="bold" />
            </button>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#888",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                lineHeight: 1,
              }}
            >
              {track.vote_score ?? 0}
            </span>
            <button
              onClick={() => actions.votePlaylistItem(track.id, "down")}
              aria-label="Vote down"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 20,
                background: "transparent",
                border: "none",
                color: "#555",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ff4242";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#555";
              }}
            >
              <CaretDown size={14} weight="bold" />
            </button>
          </div>

          {/* Remove button */}
          <button
            aria-label="Remove"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              background: "transparent",
              border: "none",
              color: "#333",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff4242";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#333";
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Recently Played */}
      <button
        onClick={() => setRecentExpanded((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
          color: "#888",
          width: "100%",
        }}
      >
        <ClockCounterClockwise size={16} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            flex: 1,
            textAlign: "left",
          }}
        >
          Recently Played
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#555",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          {recentlyPlayed.length}
        </span>
        <CaretDown
          size={14}
          style={{
            transform: recentExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {recentExpanded &&
        recentlyPlayed.map((track) => (
          <div
            key={track.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 4px",
              opacity: 0.5,
            }}
          >
            {track.album_art_url && (
              <img
                src={track.album_art_url}
                alt={track.title}
                style={{
                  width: 36,
                  height: 28,
                  borderRadius: 4,
                  objectFit: "cover",
                  background: "#1a1a1a",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#888",
                  fontFamily: "var(--font-inter), sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {track.title}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#555",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {track.artist}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
