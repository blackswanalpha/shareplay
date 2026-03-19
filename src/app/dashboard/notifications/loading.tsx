export default function NotificationsLoading() {
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
        <div className="skeleton-pulse" style={{ width: 130, height: 22 }} />
      </div>

      {/* List */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div className="skeleton-pulse" style={{ width: 150, height: 22, marginBottom: 24 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}
          >
            <div className="skeleton-pulse" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-pulse" style={{ width: "70%", height: 14, marginBottom: 6 }} />
              <div className="skeleton-pulse" style={{ width: "45%", height: 12 }} />
            </div>
            <div className="skeleton-pulse" style={{ width: 60, height: 12, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
