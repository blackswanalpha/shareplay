"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { useAtomValue, useSetAtom } from "jotai";
import { Play, Pause, CornersOut, SpeakerHigh, SpeakerLow, SpeakerX } from "@phosphor-icons/react";
import { playerStateAtom } from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";

// react-player v3 renders a native <video> (or custom element like
// youtube-video-element that extends HTMLVideoElement), so the ref is
// an HTMLVideoElement and we use standard DOM events / properties.
/* eslint-disable @typescript-eslint/no-explicit-any */
const Player = ReactPlayer as any;

interface VideoPlayerProps {
  actions: SocketActions;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ actions }: VideoPlayerProps) {
  const playerState = useAtomValue(playerStateAtom);
  const setPlayerState = useSetAtom(playerStateAtom);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [localTime, setLocalTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const isRemoteRef = useRef(false);

  const { videoUrl, isPlaying, currentTime, title, subtitle, duration, sequenceId } = playerState;
  const progress = duration > 0 ? (localTime / duration) * 100 : 0;

  // Sync remote seek
  useEffect(() => {
    if (!playerRef.current) return;
    const localCurrent = playerRef.current.currentTime || 0;
    const delta = Math.abs(localCurrent - currentTime);
    if (delta > 2 && !seeking) {
      isRemoteRef.current = true;
      playerRef.current.currentTime = currentTime;
      setLocalTime(currentTime);
      setTimeout(() => { isRemoteRef.current = false; }, 500);
    }
  }, [currentTime, sequenceId, seeking]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!seeking) {
      setLocalTime(e.currentTarget.currentTime);
    }
  }, [seeking]);

  const handlePlay = useCallback(() => {
    if (isRemoteRef.current) return;
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    actions.emitPlay(playerRef.current?.currentTime || 0);
  }, [actions, setPlayerState]);

  const handlePause = useCallback(() => {
    if (isRemoteRef.current) return;
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    actions.emitPause(playerRef.current?.currentTime || 0);
  }, [actions, setPlayerState]);

  const handleSeekBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.floor(ratio * duration);
    if (playerRef.current) playerRef.current.currentTime = seekTime;
    setLocalTime(seekTime);
    actions.emitSeek(seekTime);
  }, [duration, actions]);

  const handleEnded = useCallback(() => {
    actions.skipTrack();
  }, [actions]);

  const handleDurationChange = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration;
    if (d && isFinite(d)) {
      setPlayerState((prev) => ({ ...prev, duration: d }));
    }
  }, [setPlayerState]);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const VolumeIcon = volume === 0 ? SpeakerX : volume < 0.5 ? SpeakerLow : SpeakerHigh;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{
        aspectRatio: "16/9",
        background: "#000",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: videoUrl ? "0 0 50px -10px rgba(255,66,66,0.2)" : "none",
      }}
    >
      {videoUrl ? (
        <Player
          ref={playerRef}
          src={videoUrl}
          playing={isPlaying}
          volume={volume}
          width="100%"
          height="100%"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onDurationChange={handleDurationChange}
          config={{ youtube: { rel: 0 } }}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p style={{ color: "#555", fontSize: 16, fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            No content playing
          </p>
          <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-inter), sans-serif" }}>
            Paste a YouTube URL above to get started
          </p>
        </div>
      )}

      {/* Large centered play button overlay */}
      {videoUrl && (
        <div
          onClick={handleTogglePlay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.2)",
            opacity: showControls && !isPlaying ? 1 : showControls ? 0 : 0,
            transition: "opacity 0.3s ease",
            cursor: "pointer",
            pointerEvents: showControls || !isPlaying ? "auto" : "none",
          }}
        >
          {!isPlaying && (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,66,66,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(255,66,66,0.4)",
                transition: "transform 0.2s ease",
              }}
            >
              <Play size={36} weight="fill" style={{ color: "#fff", marginLeft: 4 }} />
            </div>
          )}
        </div>
      )}

      {/* Bottom controls overlay */}
      {videoUrl && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 20px 16px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Progress bar */}
          <div
            onClick={handleSeekBarClick}
            style={{
              width: "100%",
              height: 6,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 3,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#ff4242",
                borderRadius: 3,
                transition: seeking ? "none" : "width 0.3s linear",
                boxShadow: "0 0 10px rgba(255,66,66,0.8)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${progress}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #ff4242",
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            />
          </div>

          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={handleTogglePlay}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 0.2s ease",
                }}
              >
                {isPlaying ? <Pause size={28} weight="fill" /> : <Play size={28} weight="fill" />}
              </button>

              {/* Volume */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setVolume((v) => v === 0 ? 0.8 : 0)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <VolumeIcon size={20} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{
                    width: 80,
                    accentColor: "#ff4242",
                    height: 4,
                    cursor: "pointer",
                  }}
                />
              </div>

              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {formatTime(localTime)} / {formatTime(duration)}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Quality badge */}
              <span
                style={{
                  padding: "2px 8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                HD
              </span>

              <button
                onClick={handleFullscreen}
                aria-label="Fullscreen"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 4,
                  transition: "color 0.2s ease",
                }}
              >
                <CornersOut size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
