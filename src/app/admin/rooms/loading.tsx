export default function AdminRoomsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

      <div className="adm-skel" style={{ width: 210, height: 26 }} />

      <div style={{ display: "flex", gap: 12 }}>
        <div className="adm-skel" style={{ width: 300, height: 36 }} />
        <div className="adm-skel" style={{ width: 100, height: 36 }} />
      </div>

      <div style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div className="adm-skel" style={{ height: 40, borderRadius: 0 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="adm-skel" style={{ width: 70, height: 14 }} />
            <div className="adm-skel" style={{ width: 140, height: 14 }} />
            <div className="adm-skel" style={{ flex: 1, height: 14 }} />
            <div className="adm-skel" style={{ width: 60, height: 14 }} />
            <div className="adm-skel" style={{ width: 50, height: 14 }} />
            <div className="adm-skel" style={{ width: 80, height: 14 }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <div className="adm-skel" style={{ width: 80, height: 30, borderRadius: 6 }} />
        <div className="adm-skel" style={{ width: 60, height: 30, borderRadius: 6 }} />
        <div className="adm-skel" style={{ width: 60, height: 30, borderRadius: 6 }} />
      </div>
    </div>
  );
}
