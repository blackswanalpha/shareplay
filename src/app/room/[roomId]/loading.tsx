export default function RoomLoading() {
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
        @keyframes room-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255, 59, 59, 0.15)",
          border: "2px solid rgba(255, 59, 59, 0.3)",
          animation: "room-pulse 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
