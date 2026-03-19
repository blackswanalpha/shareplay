export default function AdminAnalyticsLoading() {
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

      {/* Header + period buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="adm-skel" style={{ width: 220, height: 26 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="adm-skel" style={{ width: 44, height: 30, borderRadius: 6 }} />
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="adm-skel" style={{ height: 200, borderRadius: 12 }} />
        <div className="adm-skel" style={{ height: 200, borderRadius: 12 }} />
      </div>

      {/* Retention cohorts */}
      <div className="adm-skel" style={{ height: 180, borderRadius: 12 }} />

      {/* Export */}
      <div className="adm-skel" style={{ height: 90, borderRadius: 12 }} />
    </div>
  );
}
