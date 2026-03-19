"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlobeHemisphereWest } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

const TIMEZONES = [
  { city: "New York", tz: "America/New_York" },
  { city: "Los Angeles", tz: "America/Los_Angeles" },
  { city: "Chicago", tz: "America/Chicago" },
  { city: "São Paulo", tz: "America/Sao_Paulo" },
  { city: "London", tz: "Europe/London" },
  { city: "Paris", tz: "Europe/Paris" },
  { city: "Berlin", tz: "Europe/Berlin" },
  { city: "Nairobi", tz: "Africa/Nairobi" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Mumbai", tz: "Asia/Kolkata" },
  { city: "Shanghai", tz: "Asia/Shanghai" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
  { city: "Sydney", tz: "Australia/Sydney" },
  { city: "Auckland", tz: "Pacific/Auckland" },
];

function formatTime(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatAbbr(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function WorldClock() {
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="World clock"
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          color: open ? "#f5f5f5" : "#888",
          transition: "background 0.15s ease, color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = open ? "rgba(255,255,255,0.08)" : "transparent";
          e.currentTarget.style.color = open ? "#f5f5f5" : "#888";
        }}
      >
        <GlobeHemisphereWest size={22} weight="duotone" />
      </button>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            color: "#f5f5f5",
            letterSpacing: "0.02em",
          }}
        >
          {formatTime(now, localTz)}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            color: "#888",
          }}
        >
          {formatDate(now, localTz)}
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 320,
              maxHeight: 400,
              overflowY: "auto",
              background: "rgba(17,17,17,0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              padding: 4,
              zIndex: 100,
            }}
          >
            {TIMEZONES.map(({ city, tz }) => (
              <div
                key={tz}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 6,
                  transition: "background 0.15s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#f5f5f5",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {city}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {formatAbbr(now, tz)} · {formatDate(now, tz)}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    color: "#ccc",
                    letterSpacing: "0.02em",
                  }}
                >
                  {formatTime(now, tz)}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
