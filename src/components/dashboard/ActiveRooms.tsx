"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ActiveRoomCard } from "./ActiveRoomCard";
import type { Room } from "@/lib/types";

interface ActiveRoomsProps {
  rooms: Room[];
  onOpenRoom?: (roomId: string) => void;
}

export function ActiveRooms({ rooms, onOpenRoom }: ActiveRoomsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !containerRef.current) return;

    const cards = containerRef.current.children;
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: "power2.out",
      }
    );
  }, [rooms]);

  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: "#f5f5f5",
          marginBottom: 16,
        }}
      >
        Active Rooms
      </h2>

      <div
        ref={containerRef}
        className="hide-scrollbar"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {rooms.map((room) => (
          <div key={room.id} style={{ opacity: 0 }}>
            <ActiveRoomCard room={room} onOpen={onOpenRoom} />
          </div>
        ))}
      </div>
    </section>
  );
}
