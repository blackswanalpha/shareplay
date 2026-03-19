export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-pulse {
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
        <div className="skeleton-pulse" style={{ width: 120, height: 28 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton-pulse" style={{ width: 140, height: 32, borderRadius: 8 }} />
          <div className="skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div className="skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div className="skeleton-pulse" style={{ width: 280, height: 28, marginBottom: 12 }} />
          <div className="skeleton-pulse" style={{ width: 180, height: 16, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="skeleton-pulse" style={{ width: 140, height: 40, borderRadius: 8 }} />
            <div className="skeleton-pulse" style={{ width: 140, height: 40, borderRadius: 8 }} />
          </div>
        </div>

        {/* Active Rooms heading */}
        <div className="skeleton-pulse" style={{ width: 140, height: 22, marginBottom: 16 }} />

        {/* Room cards grid */}
        <div style={{ display: "flex", gap: 16, overflowX: "hidden", marginBottom: 32 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                minWidth: 280,
                height: 160,
                borderRadius: 12,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="skeleton-pulse" style={{ height: 200, borderRadius: 12 }} />
            <div className="skeleton-pulse" style={{ height: 200, borderRadius: 12 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="skeleton-pulse" style={{ height: 160, borderRadius: 12 }} />
            <div className="skeleton-pulse" style={{ height: 120, borderRadius: 12 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
