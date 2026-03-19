"use client";

export function LobbySkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0505",
        backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <style>{`
        @keyframes lobby-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .lby-skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: lobby-shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          height: 64,
          background: "rgba(0,0,0,0.7)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div className="lby-skel" style={{ width: 120, height: 28 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="lby-skel" style={{ width: 140, height: 32, borderRadius: 8 }} />
          <div className="lby-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div className="lby-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Two-column lobby layout */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "48px 24px",
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Preview */}
        <div style={{ flex: 1 }}>
          <div className="lby-skel" style={{ width: "100%", aspectRatio: "4/3", borderRadius: 16, marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div className="lby-skel" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            <div className="lby-skel" style={{ width: 44, height: 44, borderRadius: "50%" }} />
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="lby-skel" style={{ width: 200, height: 26 }} />
          <div className="lby-skel" style={{ width: 120, height: 14 }} />
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div className="lby-skel" style={{ width: "70%", height: 14 }} />
            <div className="lby-skel" style={{ width: "50%", height: 14 }} />
            <div className="lby-skel" style={{ width: "60%", height: 14 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="lby-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            ))}
          </div>
          <div className="lby-skel" style={{ width: "100%", height: 48, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
