"use client";

export function AdminSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
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

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          minHeight: "100vh",
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
          <div className="adm-skel" style={{ width: 140, height: 22 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 8px" }}>
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="adm-skel" style={{ height: 38, borderRadius: 8 }} />
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            height: 56,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div className="adm-skel" style={{ width: 120, height: 16 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="adm-skel" style={{ width: 80, height: 14 }} />
            <div className="adm-skel" style={{ width: 60, height: 14 }} />
            <div className="adm-skel" style={{ width: 60, height: 28, borderRadius: 6 }} />
          </div>
        </div>

        {/* Content placeholder */}
        <main style={{ flex: 1, padding: 24 }}>
          <div className="adm-skel" style={{ width: 200, height: 28, marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="adm-skel" style={{ height: 110, borderRadius: 14 }} />
            ))}
          </div>
          <div className="adm-skel" style={{ height: 260, borderRadius: 14 }} />
        </main>
      </div>
    </div>
  );
}
