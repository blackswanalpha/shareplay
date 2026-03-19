export default function AdminSettingsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes admin-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .adm-skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: admin-shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      <div className="adm-skel" style={{ width: 190, height: 26 }} />

      {/* Maintenance mode */}
      <div className="adm-skel" style={{ height: 80, borderRadius: 12 }} />

      {/* Feature flags */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="adm-skel" style={{ width: 130, height: 18, marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="adm-skel" style={{ height: 40, borderRadius: 8 }} />
          ))}
        </div>
      </div>

      {/* Settings categories */}
      {[1, 2].map((cat) => (
        <div key={cat} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="adm-skel" style={{ width: 100, height: 18, marginBottom: 16 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <div className="adm-skel" style={{ width: 140, height: 14, marginBottom: 4 }} />
                <div className="adm-skel" style={{ width: 200, height: 12 }} />
              </div>
              <div className="adm-skel" style={{ width: 100, height: 14 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
