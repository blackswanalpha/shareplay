"use client";

import { useAtom } from "jotai";
import { appearanceSettingsAtom } from "@/store/appearanceSettingsAtom";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeMode, AccentColor, FontSize } from "@/lib/types";

const themeModes: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

const accentColors: { value: AccentColor; hex: string }[] = [
  { value: "red", hex: "#ff3b3b" },
  { value: "blue", hex: "#3b82f6" },
  { value: "green", hex: "#22c55e" },
  { value: "purple", hex: "#a855f7" },
  { value: "orange", hex: "#f97316" },
];

const fontSizes: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function AppearanceSection() {
  const [settings, setSettings] = useAtom(appearanceSettingsAtom);

  function updateSetting<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings({ ...settings, [key]: value });
  }

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
        Appearance
      </h2>

      {/* Theme Mode */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 4,
          }}
        >
          Theme
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 12,
          }}
        >
          Choose your preferred color scheme
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          {themeModes.map((mode) => {
            const isActive = settings.theme_mode === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => updateSetting("theme_mode", mode.value)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "none",
                  background: isActive ? "rgba(255,59,59,0.15)" : "transparent",
                  color: isActive ? "#ff3b3b" : "#888",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--font-inter), sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 4,
          }}
        >
          Accent Color
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 12,
          }}
        >
          Select a highlight color for buttons and accents
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {accentColors.map((color) => {
            const isActive = settings.accent_color === color.value;
            return (
              <button
                key={color.value}
                onClick={() => updateSetting("accent_color", color.value)}
                aria-label={color.value}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: color.hex,
                  border: isActive ? "3px solid #f5f5f5" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? `0 0 12px ${color.hex}60` : "none",
                  outline: "none",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 4,
          }}
        >
          Font Size
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 12,
          }}
        >
          Adjust the text size across the application
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          {fontSizes.map((size) => {
            const isActive = settings.font_size === size.value;
            return (
              <button
                key={size.value}
                onClick={() => updateSetting("font_size", size.value)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "none",
                  background: isActive ? "rgba(255,59,59,0.15)" : "transparent",
                  color: isActive ? "#ff3b3b" : "#888",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--font-inter), sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "16px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
                fontFamily: "var(--font-inter), sans-serif",
                marginBottom: 2,
              }}
            >
              Reduced Motion
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Minimize animations and transitions
            </div>
          </div>
          <ToggleSwitch
            checked={settings.reduced_motion}
            onChange={(v) => updateSetting("reduced_motion", v)}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "16px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#f5f5f5",
                fontFamily: "var(--font-inter), sans-serif",
                marginBottom: 2,
              }}
            >
              Compact Mode
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Reduce spacing and padding for a denser layout
            </div>
          </div>
          <ToggleSwitch
            checked={settings.compact_mode}
            onChange={(v) => updateSetting("compact_mode", v)}
          />
        </div>
      </div>
    </div>
  );
}
