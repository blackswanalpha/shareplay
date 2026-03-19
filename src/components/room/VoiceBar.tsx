"use client";

import { useContext, useRef, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Microphone,
  MicrophoneSlash,
  SpeakerX,
  SpeakerHigh,
  Screencast,
  Phone,
  PhoneDisconnect,
  VideoCamera,
  VideoCameraSlash,
} from "@phosphor-icons/react";
import gsap from "gsap";
import {
  participantsAtom,
  audioStateAtom,
  speakingParticipantsAtom,
  screenShareAtom,
} from "@/store/roomAtoms";
import { ScreenShareContext, CameraShareContext, VoiceChatContext } from "./RoomPage";
import type { SocketActions } from "@/hooks/useSocket";
import { toast } from "sonner";

/* ─── GSAP-powered speaking waveform ─── */
function SpeakingWave() {
  const bar1 = useRef<HTMLDivElement>(null);
  const bar2 = useRef<HTMLDivElement>(null);
  const bar3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bars = [bar1.current, bar2.current, bar3.current].filter(Boolean);
    if (bars.length === 0) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(bars[0]!, { height: 12, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(bars[1]!, { height: 4, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.1)
      .to(bars[2]!, { height: 10, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.2);

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: -4,
        right: -4,
        display: "flex",
        gap: 1,
        alignItems: "flex-end",
      }}
    >
      <div ref={bar1} style={{ width: 2, height: 6, background: "#ff4242", borderRadius: 1 }} />
      <div ref={bar2} style={{ width: 2, height: 10, background: "#ff4242", borderRadius: 1 }} />
      <div ref={bar3} style={{ width: 2, height: 4, background: "#ff4242", borderRadius: 1 }} />
    </div>
  );
}

/* ─── Main VoiceBar ─── */

interface VoiceBarProps {
  userAvatar: string;
  actions: SocketActions;
}

export function VoiceBar({ userAvatar, actions }: VoiceBarProps) {
  const participants = useAtomValue(participantsAtom);
  const audioState = useAtomValue(audioStateAtom);
  const setAudioState = useSetAtom(audioStateAtom);
  const speakingUsers = useAtomValue(speakingParticipantsAtom);

  const screenShare = useAtomValue(screenShareAtom);
  const { startSharing, stopSharing, isLocalSharing } = useContext(ScreenShareContext);
  const { startCamera, stopCamera, isLocalSharing: isCameraOn } = useContext(CameraShareContext);
  const { joinVoice, leaveVoice, isInVoice } = useContext(VoiceChatContext);
  const onlineParticipants = participants.filter((p) => p.is_online);

  const screenBtnRef = useRef<HTMLButtonElement>(null);

  // GSAP screen-share pulse
  useEffect(() => {
    if (!isLocalSharing || !screenBtnRef.current) return;
    const tween = gsap.to(screenBtnRef.current, {
      boxShadow: "0 0 0 6px rgba(255,66,66,0)",
      duration: 1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => { tween.kill(); };
  }, [isLocalSharing]);

  const handleToggleVoice = () => {
    if (isInVoice) {
      leaveVoice();
    } else {
      joinVoice();
    }
  };

  const handleToggleMute = () => {
    const newMuted = !audioState.isMuted;
    setAudioState((prev) => ({ ...prev, isMuted: newMuted }));
    actions.toggleMute(newMuted);
  };

  const handleToggleDeafen = () => {
    setAudioState((prev) => ({ ...prev, isDeafened: !prev.isDeafened }));
  };

  const handleToggleScreenShare = () => {
    if (!audioState.isInAudio) {
      toast("Join voice chat first", { description: "You need to be in voice chat to share your screen." });
      return;
    }
    if (isLocalSharing) {
      stopSharing();
      return;
    }
    if (screenShare.isSharing) {
      toast("Screen share in progress", { description: "Someone is already sharing their screen." });
      return;
    }
    startSharing();
  };

  const handleToggleCamera = () => {
    if (!audioState.isInAudio) {
      toast("Join voice chat first", { description: "You need to be in voice chat to share your camera." });
      return;
    }
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const someoneElseSharing = screenShare.isSharing && !isLocalSharing;

  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 50,
        height: 68,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      {/* Participant avatars */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {onlineParticipants.slice(0, 5).map((p) => {
          const isSpeaking = speakingUsers.some((s) => s.id === p.id);
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: isSpeaking
                      ? "2px solid #ff4242"
                      : "1px solid rgba(255,255,255,0.1)",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: p.is_muted && !isSpeaking ? "grayscale(0.5)" : "none",
                    opacity: p.is_muted && !isSpeaking ? 0.6 : 1,
                  }}
                >
                  <img
                    src={p.avatar_url}
                    alt={p.username}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#222",
                    }}
                  />
                </div>
                {/* GSAP-powered speaking waveform */}
                {isSpeaking && <SpeakingWave />}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isSpeaking ? "#ff4242" : "#f5f5f5",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                  }}
                >
                  {p.username}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isSpeaking ? "#ff4242" : "#555",
                    fontFamily: "var(--font-inter), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {isSpeaking ? "Speaking" : p.is_muted ? "Muted" : "Listening"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleToggleVoice}
          aria-label={isInVoice ? "Leave voice chat" : "Join voice chat"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 40,
            padding: isInVoice ? "0 14px" : "0 16px",
            background: isInVoice
              ? "rgba(255,66,66,0.15)"
              : "rgba(76,175,80,0.15)",
            border: isInVoice
              ? "1px solid rgba(255,66,66,0.3)"
              : "1px solid rgba(76,175,80,0.3)",
            borderRadius: 20,
            color: isInVoice ? "#ff4242" : "#4caf50",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isInVoice
              ? "rgba(255,66,66,0.25)"
              : "rgba(76,175,80,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isInVoice
              ? "rgba(255,66,66,0.15)"
              : "rgba(76,175,80,0.15)";
          }}
        >
          {isInVoice ? <PhoneDisconnect size={18} /> : <Phone size={18} />}
          {isInVoice ? "Leave" : "Join Voice"}
        </button>

        {isInVoice && (
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
        )}

        {isInVoice && (
          <>
            <button
              onClick={handleToggleMute}
              aria-label={audioState.isMuted ? "Unmute" : "Mute"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                background: audioState.isMuted ? "rgba(255,66,66,0.2)" : "rgba(255,255,255,0.05)",
                border: audioState.isMuted ? "1px solid rgba(255,66,66,0.3)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                color: audioState.isMuted ? "#ff4242" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = audioState.isMuted
                  ? "rgba(255,66,66,0.3)"
                  : "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = audioState.isMuted
                  ? "rgba(255,66,66,0.2)"
                  : "rgba(255,255,255,0.05)";
              }}
            >
              {audioState.isMuted ? <MicrophoneSlash size={20} /> : <Microphone size={20} />}
            </button>

            <button
              onClick={handleToggleDeafen}
              aria-label={audioState.isDeafened ? "Undeafen" : "Deafen"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                background: audioState.isDeafened ? "rgba(255,66,66,0.2)" : "rgba(255,255,255,0.05)",
                border: audioState.isDeafened ? "1px solid rgba(255,66,66,0.3)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                color: audioState.isDeafened ? "#ff4242" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = audioState.isDeafened
                  ? "rgba(255,66,66,0.3)"
                  : "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = audioState.isDeafened
                  ? "rgba(255,66,66,0.2)"
                  : "rgba(255,255,255,0.05)";
              }}
            >
              {audioState.isDeafened ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </button>
          </>
        )}

        <button
          onClick={handleToggleCamera}
          aria-label={isCameraOn ? "Stop camera" : "Start camera"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: isCameraOn ? "rgba(255,66,66,0.2)" : "rgba(255,255,255,0.05)",
            border: isCameraOn ? "1px solid rgba(255,66,66,0.3)" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            color: isCameraOn ? "#ff4242" : "#fff",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isCameraOn
              ? "rgba(255,66,66,0.3)"
              : "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isCameraOn
              ? "rgba(255,66,66,0.2)"
              : "rgba(255,255,255,0.05)";
          }}
        >
          {isCameraOn ? <VideoCameraSlash size={20} /> : <VideoCamera size={20} />}
        </button>

        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

        <button
          ref={screenBtnRef}
          onClick={handleToggleScreenShare}
          aria-label={isLocalSharing ? "Stop screen share" : "Screen share"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: isLocalSharing
              ? "rgba(255,66,66,0.2)"
              : someoneElseSharing
                ? "rgba(255,255,255,0.02)"
                : "rgba(255,255,255,0.05)",
            border: isLocalSharing
              ? "1px solid rgba(255,66,66,0.3)"
              : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            color: isLocalSharing ? "#ff4242" : someoneElseSharing ? "#555" : "#fff",
            cursor: someoneElseSharing ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!someoneElseSharing) {
              e.currentTarget.style.background = isLocalSharing
                ? "rgba(255,66,66,0.3)"
                : "rgba(255,255,255,0.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isLocalSharing
              ? "rgba(255,66,66,0.2)"
              : someoneElseSharing
                ? "rgba(255,255,255,0.02)"
                : "rgba(255,255,255,0.05)";
          }}
        >
          <Screencast size={20} />
        </button>
      </div>
    </footer>
  );
}
