export default function LobbyLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0505",
        backgroundImage: "radial-gradient(circle, rgba(255,66,66,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes lobby-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .lobby-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: lobby-shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <div className="lobby-skeleton" style={{ width: 200, height: 24, margin: "0 auto 16px" }} />
        <div className="lobby-skeleton" style={{ width: 300, height: 180, margin: "0 auto 20px", borderRadius: 12 }} />
        <div className="lobby-skeleton" style={{ width: 140, height: 40, margin: "0 auto", borderRadius: 8 }} />
      </div>
    </div>
  );
}
