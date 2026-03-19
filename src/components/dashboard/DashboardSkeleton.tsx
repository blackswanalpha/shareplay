"use client";

export function DashboardSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skel-pulse {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
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
        <div className="skel-pulse" style={{ width: 120, height: 28 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skel-pulse" style={{ width: 140, height: 32, borderRadius: 8 }} />
          <div className="skel-pulse" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div className="skel-pulse" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div className="skel-pulse" style={{ width: 280, height: 28, marginBottom: 12 }} />
          <div className="skel-pulse" style={{ width: 180, height: 16 }} />
        </div>
        <div style={{ display: "flex", gap: 16, overflow: "hidden", marginBottom: 32 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skel-pulse" style={{ minWidth: 280, height: 160, borderRadius: 12, flexShrink: 0 }} />
          ))}
        </div>
      </main>
    </div>
  );
}
