"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { AdSenseUnit } from "@/components/ui/AdSenseUnit";

export function AdSensePanel() {
  return (
    <GlassPanel hoverEffect={false} style={{ minHeight: 100 }}>
      <p
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: 12,
          color: "#666",
          marginBottom: 8,
        }}
      >
        Sponsored
      </p>
      <AdSenseUnit
        adClient="ca-pub-2766229284991442"
        adSlot="XXXXXXXXXX"
      />
    </GlassPanel>
  );
}
