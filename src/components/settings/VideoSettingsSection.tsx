"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { VideoCamera, Stop } from "@phosphor-icons/react";
import { cameraSettingsAtom, cameraConstraintsAtom } from "@/store/cameraSettingsAtom";
import { useAudioDevices } from "@/hooks/useAudioDevices";

export function VideoSettingsSection() {
  const [settings, setSettings] = useAtom(cameraSettingsAtom);
  const cameraConstraints = useAtomValue(cameraConstraintsAtom);
  const { videoInputs } = useAudioDevices();

  const [isTesting, setIsTesting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleTestCamera = useCallback(async () => {
    if (isTesting) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsTesting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraConstraints,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsTesting(true);
    } catch {
      console.error("Failed to access camera for test");
    }
  }, [isTesting, cameraConstraints]);

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: "var(--font-inter), sans-serif",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
  };

  const deviceLabel = (device: MediaDeviceInfo) =>
    device.label || `Device (${device.deviceId.slice(0, 8)}...)`;

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 24,
        }}
      >
        Video Settings
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#888",
              marginBottom: 6,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Camera
          </label>
          <select
            value={settings.video_device}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                video_device: e.target.value,
              }))
            }
            style={selectStyle}
          >
            <option value="">System Default</option>
            {videoInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {deviceLabel(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Camera */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={toggleTestCamera}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--font-inter), sans-serif",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            background: isTesting
              ? "rgba(239,68,68,0.15)"
              : "rgba(255,255,255,0.04)",
            color: isTesting ? "#ef4444" : "#f5f5f5",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isTesting
              ? "rgba(239,68,68,0.25)"
              : "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isTesting
              ? "rgba(239,68,68,0.15)"
              : "rgba(255,255,255,0.04)";
          }}
        >
          {isTesting ? <Stop size={16} /> : <VideoCamera size={16} />}
          {isTesting ? "Stop Preview" : "Test Camera"}
        </button>

        {isTesting && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#111",
              aspectRatio: "16/9",
              maxWidth: 480,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
