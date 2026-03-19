export default function AdminNotificationsLoading() {
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

      <div className="adm-skel" style={{ width: 260, height: 26 }} />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>

      {/* Broadcast form */}
      <div className="adm-skel" style={{ height: 200, borderRadius: 12 }} />

      {/* Templates header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="adm-skel" style={{ width: 110, height: 20 }} />
        <div className="adm-skel" style={{ width: 120, height: 34, borderRadius: 6 }} />
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div className="adm-skel" style={{ height: 40, borderRadius: 0 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="adm-skel" style={{ width: 120, height: 14 }} />
            <div className="adm-skel" style={{ width: 70, height: 14 }} />
            <div className="adm-skel" style={{ flex: 1, height: 14 }} />
            <div className="adm-skel" style={{ width: 60, height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
