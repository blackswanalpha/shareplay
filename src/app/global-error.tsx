"use client";

/**
 * Root-level error boundary — catches errors in the root layout itself.
 * Must render its own <html> and <body> since the root layout may have failed.
 * Cannot use providers or theme — keep this self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#f5f5f5",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            padding: "48px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Error code */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: "120px",
                fontWeight: 700,
                lineHeight: 1,
                color: "rgba(239,68,68,0.08)",
                letterSpacing: "-0.04em",
                userSelect: "none",
              }}
            >
              500
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Simple SVG lightning since we can't load icons */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 256 256"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M160 16L64 136H120L96 240L192 120H136L160 16Z"
                  fill="#ef4444"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 600,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Critical error
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#888",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Something went seriously wrong. We&apos;re on it.
            </p>
          </div>

          {/* Error digest */}
          {error.digest && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: "12px", color: "#555" }}>
                Error ID:{" "}
              </span>
              <code
                style={{
                  fontSize: "12px",
                  color: "#888",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {error.digest}
              </code>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                background: "#ff3b3b",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                color: "#f5f5f5",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Go home
            </a>
          </div>

          {/* Logo (inline SVG since components may not load) */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              opacity: 0.4,
              marginTop: "16px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 8L36 24L12 40V8Z" fill="#ff3b3b" />
              <path d="M18 8L42 24L18 40V8Z" fill="#ff3b3b" opacity="0.7" />
              <path d="M18 10.4L36 24L18 37.6V10.4Z" fill="#ff6b6b" />
            </svg>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#888",
              }}
            >
              SharePlay
            </span>
          </a>
        </div>
      </body>
    </html>
  );
}
