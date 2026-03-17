"use client";

import { motion, useReducedMotion } from "framer-motion";

interface StatusDotProps {
  status: "online" | "away" | "offline";
  size?: number;
}

const colors = {
  online: "#22c55e",
  away: "#eab308",
  offline: "#555",
};

export function StatusDot({ status, size = 10 }: StatusDotProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        status === "online" && !reducedMotion
          ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
          : undefined
      }
      transition={
        status === "online" && !reducedMotion
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors[status],
        flexShrink: 0,
      }}
    />
  );
}
