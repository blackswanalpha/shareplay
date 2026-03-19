export default function AdminRetentionLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1280 }}>
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

      {/* Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="adm-skel" style={{ width: 200, height: 30, marginBottom: 8 }} />
            <div className="adm-skel" style={{ width: 380, height: 16 }} />
          </div>
          <div className="adm-skel" style={{ width: 110, height: 34, borderRadius: 8 }} />
        </div>
        <div style={{ height: 1, marginTop: 20, background: "linear-gradient(to right, rgba(255,59,59,0.15), rgba(255,255,255,0.04), transparent)" }} />
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 110, borderRadius: 14 }} />
        ))}
      </div>

      {/* Risk distribution */}
      <div className="adm-skel" style={{ height: 120, borderRadius: 14 }} />

      {/* Score trend */}
      <div className="adm-skel" style={{ height: 180, borderRadius: 14 }} />

      {/* Two-column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="adm-skel" style={{ height: 300, borderRadius: 14 }} />
        <div className="adm-skel" style={{ height: 300, borderRadius: 14 }} />
      </div>

      {/* Campaigns */}
      <div className="adm-skel" style={{ height: 200, borderRadius: 14 }} />
    </div>
  );
}
