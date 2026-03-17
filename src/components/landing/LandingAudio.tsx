"use client";

import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { SpeakerHigh, SpeakerX } from "@phosphor-icons/react";

export function LandingAudio() {
  const { toggle, isPlaying, hasError } = useAmbientAudio("/audio/ambient.mp3");

  if (hasError) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isPlaying ? "Mute ambient audio" : "Play ambient audio"}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 10,
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%",
        color: "#f5f5f5",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      {isPlaying ? (
        <SpeakerHigh size={20} weight="bold" />
      ) : (
        <SpeakerX size={20} weight="bold" />
      )}
    </button>
  );
}
