"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseUnitProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  responsive?: boolean;
  style?: CSSProperties;
}

export function AdSenseUnit({
  adClient,
  adSlot,
  adFormat = "auto",
  responsive = true,
  style,
}: AdSenseUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or script not loaded — fail silently
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
