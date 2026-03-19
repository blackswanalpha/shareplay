"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export function LandingCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.2
    )
      .fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        0.4
      )
      .fromTo(
        taglineRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0.55
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.65
      )
      .fromTo(
        aboutRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0.75
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        ref={cardRef}
        className="landing-card"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "48px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow:
            "0 0 30px rgba(255,59,59,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          gap: "20px",
          opacity: 0,
        }}
      >
        {/* Logo */}
        <div ref={logoRef} style={{ opacity: 0 }}>
          <Image
            src="/logo.png"
            alt="SharePlay"
            width={180}
            height={180}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "16px",
            color: "#888",
            textAlign: "center",
            lineHeight: 1.5,
            opacity: 0,
          }}
        >
          Watch together. Listen together.
        </p>

        {/* CTA Button */}
        <div
          ref={ctaRef}
          style={{ width: "100%", marginTop: "4px", opacity: 0 }}
        >
          <a
            href="/auth"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "52px",
              background: "#ff3b3b",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "#e63535";
              el.style.boxShadow = "0 0 30px rgba(255,59,59,0.4)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "#ff3b3b";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
          >
            Get Started
          </a>
        </div>

        {/* About link */}
        <p
          ref={aboutRef}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "14px",
            color: "#888",
            textAlign: "center",
            lineHeight: 1.5,
            opacity: 0,
          }}
        >
          If you want to know more{" "}
          <Link
            href="/about"
            style={{
              color: "#ff3b3b",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            about Us click here
          </Link>
        </p>
      </div>
    </div>
  );
}
