"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerHigh,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { playerStateAtom } from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";

// Using Howler.js for audio
let Howl: typeof import("howler").Howl | null = null;
if (typeof window !== "undefined") {
  import("howler").then((mod) => {
    Howl = mod.Howl;
  });
}

interface MusicPlayerProps {
  actions: SocketActions;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer({ actions }: MusicPlayerProps) {
  const playerState = useAtomValue(playerStateAtom);
  const setPlayerState = useSetAtom(playerStateAtom);
  const [localTime, setLocalTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const howlRef = useRef<InstanceType<typeof import("howler").Howl> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRemoteRef = useRef(false);

  const albumArtRef = useRef<HTMLDivElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const glowTweenRef = useRef<gsap.core.Tween | null>(null);

  const { videoUrl, isPlaying, currentTime, title, subtitle, thumbnailUrl, duration, sequenceId } = playerState;
  const progress = duration > 0 ? (localTime / duration) * 100 : 0;

  // Load new Howl when URL changes
  useEffect(() => {
    if (!videoUrl || !Howl) return;

    howlRef.current?.unload();
    const sound = new Howl!({
      src: [videoUrl],
      html5: true,
      volume,
      onend: () => {
        actions.skipTrack();
      },
      onload: () => {
        const d = sound.duration();
        if (d && d !== duration) {
          setPlayerState((prev) => ({ ...prev, duration: d }));
        }
      },
    });
    howlRef.current = sound;

    return () => {
      sound.unload();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoUrl]);

  // Play/pause control
  useEffect(() => {
    const sound = howlRef.current;
    if (!sound) return;

    if (isPlaying && !sound.playing()) {
      sound.play();
    } else if (!isPlaying && sound.playing()) {
      sound.pause();
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  // Progress tracking
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const sound = howlRef.current;
        if (sound && sound.playing()) {
          setLocalTime(sound.seek() as number);
        }
      }, 500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Remote sync seek
  useEffect(() => {
    const sound = howlRef.current;
    if (!sound) return;
    const local = sound.seek() as number;
    const delta = Math.abs(local - currentTime);
    if (delta > 2) {
      isRemoteRef.current = true;
      sound.seek(currentTime);
      setLocalTime(currentTime);
      setTimeout(() => { isRemoteRef.current = false; }, 500);
    }
  }, [currentTime, sequenceId]);

  const handleTogglePlay = useCallback(() => {
    if (isRemoteRef.current) return;
    const time = (howlRef.current?.seek() as number) || 0;
    if (isPlaying) {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      actions.emitPause(time);
    } else {
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      actions.emitPlay(time);
    }
  }, [isPlaying, actions, setPlayerState]);

  const handleSeekBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.floor(ratio * duration);
    howlRef.current?.seek(seekTime);
    setLocalTime(seekTime);
    actions.emitSeek(seekTime);
  }, [duration, actions]);

  // GSAP vinyl spin + glow pulse when playing
  useEffect(() => {
    const art = albumArtRef.current;
    if (!art) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    if (isPlaying) {
      if (!spinTweenRef.current) {
        spinTweenRef.current = gsap.to(art, {
          rotation: "+=360",
          duration: 8,
          ease: "none",
          repeat: -1,
        });
      } else {
        spinTweenRef.current.resume();
      }
      if (!glowTweenRef.current) {
        glowTweenRef.current = gsap.to(art, {
          boxShadow: "0 8px 50px rgba(255,66,66,0.4)",
          duration: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      } else {
        glowTweenRef.current.resume();
      }
    } else {
      spinTweenRef.current?.pause();
      glowTweenRef.current?.pause();
    }

    return () => {
      spinTweenRef.current?.kill();
      spinTweenRef.current = null;
      glowTweenRef.current?.kill();
      glowTweenRef.current = null;
    };
  }, [isPlaying]);

  const handleNext = () => actions.skipTrack();
  const handlePrevious = () => {
    howlRef.current?.seek(0);
    setLocalTime(0);
    actions.emitSeek(0);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
      }}
    >
      {/* Album art */}
      {thumbnailUrl ? (
        <div
          ref={albumArtRef}
          style={{
            width: 280,
            height: 280,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 32,
            boxShadow: "0 8px 40px rgba(255,66,66,0.2)",
            position: "relative",
          }}
        >
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#222",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 14,
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <SpeakerHigh size={48} style={{ color: "#333" }} />
        </div>
      )}

      {/* Title / Subtitle */}
      {title && (
        <>
          <h3
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#f5f5f5",
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            {subtitle}
          </p>
        </>
      )}

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 20 }}>
        <div
          onClick={handleSeekBarClick}
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#ff4242",
              borderRadius: 2,
              transition: "width 0.3s linear",
              boxShadow: "0 0 8px rgba(255,66,66,0.6)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#888" }}>
            {formatTime(localTime)}
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#888" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Playback controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <button
          onClick={handlePrevious}
          aria-label="Previous track"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: 8,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f5f5f5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}
        >
          <SkipBack size={24} weight="fill" />
        </button>

        <button
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: "#ff4242",
            border: "none",
            borderRadius: "50%",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e63535";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,66,66,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ff4242";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isPlaying ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
        </button>

        <button
          onClick={handleNext}
          aria-label="Next track"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: 8,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f5f5f5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}
        >
          <SkipForward size={24} weight="fill" />
        </button>
      </div>
    </div>
  );
}
