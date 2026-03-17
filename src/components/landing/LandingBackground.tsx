"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LandingBackground() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Background image */}
      <Image
        src="/images/back.jpg"
        alt=""
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "center" }}
      />

      {/* Floating red orb 1 */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,59,59,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float-orb 8s ease-in-out infinite",
        }}
      />

      {/* Floating red orb 2 */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "25%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,59,59,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float-orb 10s ease-in-out infinite reverse",
        }}
      />

      {/* Dark vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Darken gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Red atmospheric glow at top */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,59,59,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </motion.div>
  );
}
