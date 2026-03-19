"use client";

export function RoomSkeleton() {
  return (
    <div
      style={{
        height: "100vh",
        background: "#0a0505",
        backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes room-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .rm-skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: room-shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* Header — 64px */}
      <header
        style={{
          height: 64,
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="rm-skel" style={{ width: 40, height: 40, borderRadius: "50%" }} />
          <div>
            <div className="rm-skel" style={{ width: 140, height: 18, marginBottom: 6 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <div className="rm-skel" style={{ width: 70, height: 12 }} />
              <div className="rm-skel" style={{ width: 50, height: 12 }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="rm-skel" style={{ width: 160, height: 32, borderRadius: 8 }} />
          <div className="rm-skel" style={{ width: 90, height: 40, borderRadius: 8 }} />
        </div>
      </header>

      {/* Main area — flex row */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Main content */}
        <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* URL bar */}
          <div className="rm-skel" style={{ width: "100%", height: 44, borderRadius: 10 }} />

          {/* Video player area */}
          <div className="rm-skel" style={{ width: "100%", flex: 1, minHeight: 300, borderRadius: 12 }} />

          {/* Now playing bar */}
          <div className="rm-skel" style={{ width: "100%", height: 52, borderRadius: 12 }} />

          {/* Ad banner */}
          <div className="rm-skel" style={{ width: "100%", height: 80, borderRadius: 12 }} />
        </div>

        {/* Sidebar — 340px */}
        <div
          style={{
            width: 340,
            background: "rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px 0 0 0",
            flexShrink: 0,
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              padding: "0 4px",
            }}
          >
            {["Chat", "People", "Playlist"].map((tab, i) => (
              <div
                key={tab}
                style={{
                  flex: 1,
                  padding: "16px 0",
                  display: "flex",
                  justifyContent: "center",
                  borderBottom: i === 0 ? "2px solid rgba(255,66,66,0.3)" : "2px solid transparent",
                }}
              >
                <div className="rm-skel" style={{ width: 50, height: 14 }} />
              </div>
            ))}
          </div>

          {/* Chat messages skeleton */}
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div className="rm-skel" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="rm-skel" style={{ width: 70 + (i % 3) * 20, height: 12, marginBottom: 6 }} />
                  <div className="rm-skel" style={{ width: "60%", height: 12, marginBottom: 4 }} />
                  {i % 3 === 0 && <div className="rm-skel" style={{ width: "40%", height: 12 }} />}
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="rm-skel" style={{ width: "100%", height: 40, borderRadius: 10 }} />
          </div>
        </div>
      </div>

      {/* Voice bar — bottom */}
      <div
        style={{
          height: 56,
          background: "rgba(255,255,255,0.04)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div className="rm-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rm-skel" style={{ width: 36, height: 36, borderRadius: "50%" }} />
        ))}
        <div className="rm-skel" style={{ width: 80, height: 30, borderRadius: 6 }} />
      </div>
    </div>
  );
}
