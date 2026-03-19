export default function AdminDashboardLoading() {
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
            <div className="adm-skel" style={{ width: 160, height: 30, marginBottom: 8 }} />
            <div className="adm-skel" style={{ width: 320, height: 16 }} />
          </div>
          <div className="adm-skel" style={{ width: 70, height: 30, borderRadius: 8 }} />
        </div>
        <div style={{ height: 1, marginTop: 20, background: "linear-gradient(to right, rgba(255,59,59,0.15), rgba(255,255,255,0.04), transparent)" }} />
      </div>

      {/* KPI Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 110, borderRadius: 14 }} />
        ))}
      </div>

      {/* KPI Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[5, 6, 7, 8].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 110, borderRadius: 14 }} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="adm-skel" style={{ height: 220, borderRadius: 14 }} />
        <div className="adm-skel" style={{ height: 220, borderRadius: 14 }} />
      </div>

      {/* Full-width chart */}
      <div className="adm-skel" style={{ height: 220, borderRadius: 14 }} />

      {/* Bottom 3-column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="adm-skel" style={{ height: 200, borderRadius: 14 }} />
        <div className="adm-skel" style={{ height: 200, borderRadius: 14 }} />
        <div className="adm-skel" style={{ height: 200, borderRadius: 14 }} />
      </div>
    </div>
  );
}
