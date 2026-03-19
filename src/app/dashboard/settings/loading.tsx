export default function SettingsLoading() {
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
          padding: "0 24px",
          gap: 16,
        }}
      >
        <div className="skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        <div className="skeleton-pulse" style={{ width: 80, height: 22 }} />
      </div>

      {/* Form skeleton */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div className="skeleton-pulse" style={{ width: 100, height: 22, marginBottom: 32 }} />

        {/* Profile section */}
        <div style={{ marginBottom: 32 }}>
          <div className="skeleton-pulse" style={{ width: 72, height: 72, borderRadius: "50%", marginBottom: 16 }} />
          <div className="skeleton-pulse" style={{ width: "100%", height: 40, marginBottom: 12 }} />
          <div className="skeleton-pulse" style={{ width: "100%", height: 40, marginBottom: 12 }} />
        </div>

        {/* Toggle sections */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <div className="skeleton-pulse" style={{ width: 160, height: 14, marginBottom: 6 }} />
              <div className="skeleton-pulse" style={{ width: 220, height: 12 }} />
            </div>
            <div className="skeleton-pulse" style={{ width: 44, height: 24, borderRadius: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
