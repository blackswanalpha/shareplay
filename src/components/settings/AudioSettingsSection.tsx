"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { Microphone, Stop } from "@phosphor-icons/react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { audioSettingsAtom, audioConstraintsAtom } from "@/store/audioSettingsAtom";
import { useAudioDevices } from "@/hooks/useAudioDevices";
import { useAtomValue } from "jotai";

export function AudioSettingsSection() {
  const [settings, setSettings] = useAtom(audioSettingsAtom);
  const audioConstraints = useAtomValue(audioConstraintsAtom);
  const { audioInputs, audioOutputs } = useAudioDevices();

  // --- Test Microphone state ---
  const [isTesting, setIsTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const testCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup test on unmount
  useEffect(() => {
    return () => {
      testCleanupRef.current?.();
    };
  }, []);

  const toggleTestMicrophone = useCallback(async () => {
    if (isTesting) {
      testCleanupRef.current?.();
      testCleanupRef.current = null;
      setIsTesting(false);
      setMicLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);

      // Analyser for level metering
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Delay node for playback monitoring (hear yourself with slight delay)
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.2;
      source.connect(delay);
      delay.connect(ctx.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // Normalize to 0-100
        setMicLevel(Math.min(100, (avg / 128) * 100));
      }, 50);

      const cleanup = () => {
        clearInterval(interval);
        source.disconnect();
        delay.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
        setMicLevel(0);
      };

      testCleanupRef.current = cleanup;
      setIsTesting(true);
    } catch {
      console.error("Failed to access microphone for test");
    }
  }, [isTesting, audioConstraints]);

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

  const toggleRow = (
    label: string,
    key: "echo_cancel" | "noise_suppress" | "auto_gain"
  ) => (
    <div
      key={key}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#f5f5f5",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {label}
      </span>
      <ToggleSwitch
        checked={settings[key]}
        onChange={(v) => setSettings((prev) => ({ ...prev, [key]: v }))}
      />
    </div>
  );

  const deviceLabel = (device: MediaDeviceInfo) =>
    device.label || `Device (${device.deviceId.slice(0, 8)}...)`;

  const levelColor =
    micLevel > 75 ? "#ef4444" : micLevel > 40 ? "#eab308" : "#22c55e";

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
        Audio Settings
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
            Input Device
          </label>
          <select
            value={settings.input_device}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                input_device: e.target.value,
              }))
            }
            style={selectStyle}
          >
            <option value="">System Default</option>
            {audioInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {deviceLabel(d)}
              </option>
            ))}
          </select>
        </div>

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
            Output Device
          </label>
          <select
            value={settings.output_device}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                output_device: e.target.value,
              }))
            }
            style={selectStyle}
          >
            <option value="">System Default</option>
            {audioOutputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {deviceLabel(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {toggleRow("Echo Cancellation", "echo_cancel")}
      {toggleRow("Noise Suppression", "noise_suppress")}
      {toggleRow("Auto Gain Control", "auto_gain")}

      {/* Test Microphone */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={toggleTestMicrophone}
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
          {isTesting ? <Stop size={16} /> : <Microphone size={16} />}
          {isTesting ? "Stop Test" : "Test Microphone"}
        </button>

        {isTesting && (
          <div
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${micLevel}%`,
                borderRadius: 4,
                background: levelColor,
                transition: "width 0.05s linear, background 0.15s ease",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
