"use client";

interface SharePlayMarkProps {
  size?: number;
  className?: string;
}

export function SharePlayMark({ size = 48, className }: SharePlayMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SharePlay"
      className={className}
    >
      {/* First play triangle */}
      <path
        d="M12 8L36 24L12 40V8Z"
        fill="#ff3b3b"
        rx="2"
      />
      {/* Second play triangle (offset) */}
      <path
        d="M18 8L42 24L18 40V8Z"
        fill="#ff3b3b"
        opacity="0.7"
        rx="2"
      />
      {/* Overlap zone */}
      <path
        d="M18 10.4L36 24L18 37.6V10.4Z"
        fill="#ff6b6b"
      />
    </svg>
  );
}

const sizeMap = {
  sm: { mark: 32, fontSize: "20px", gap: "8px" },
  md: { mark: 48, fontSize: "32px", gap: "12px" },
  lg: { mark: 64, fontSize: "44px", gap: "16px" },
} as const;

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

export function Logo({ size = "md", showWordmark = true }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: s.gap,
      }}
    >
      <SharePlayMark size={s.mark} />
      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: s.fontSize,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#f5f5f5" }}>Share</span>
          <span style={{ color: "#ff3b3b" }}>Play</span>
        </span>
      )}
    </div>
  );
}
