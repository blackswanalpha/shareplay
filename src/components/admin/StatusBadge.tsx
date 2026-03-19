"use client";

const colorMap: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  online: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  resolved: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  enabled: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  pending: { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
  acknowledged: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  warned: { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
  banned: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
  inactive: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
  closed: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
  dismissed: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" },
  critical: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
  high: { bg: "rgba(251,146,60,0.15)", text: "#fb923c" },
  normal: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  low: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.5)" },
};

export function StatusBadge({ status }: { status: string }) {
  const colors = colorMap[status.toLowerCase()] || colorMap.low;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}
