"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";

export function LandingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Fade in the background
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    // Organic floating orb 1 — random-feeling path
    gsap.to(orb1Ref.current, {
      x: 30,
      y: -20,
      scale: 1.05,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    gsap.to(orb1Ref.current, {
      x: -20,
      y: 15,
      duration: 6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2,
    });

    // Organic floating orb 2 — offset rhythm
    gsap.to(orb2Ref.current, {
      x: -25,
      y: 18,
      scale: 0.95,
      duration: 5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    gsap.to(orb2Ref.current, {
      x: 35,
      y: -12,
      duration: 7,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1.5,
    });

    // Pulsing atmospheric glow
    gsap.to(glowRef.current, {
      opacity: 0.12,
      scale: 1.1,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      gsap.killTweensOf([
        orb1Ref.current,
        orb2Ref.current,
        glowRef.current,
      ]);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "#000",
        opacity: 0,
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
        ref={orb1Ref}
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
          willChange: "transform",
        }}
      />

      {/* Floating red orb 2 */}
      <div
        ref={orb2Ref}
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
          willChange: "transform",
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
        ref={glowRef}
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
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
