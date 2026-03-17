"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ActiveRoomCard } from "./ActiveRoomCard";
import type { Room } from "@/lib/types";

interface ActiveRoomsProps {
  rooms: Room[];
  onOpenRoom?: (roomId: string) => void;
}

export function ActiveRooms({ rooms, onOpenRoom }: ActiveRoomsProps) {
  const reducedMotion = useReducedMotion();

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

      <motion.div
        className="hide-scrollbar"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 0.3, delay: i * 0.06 }
            }
          >
            <ActiveRoomCard room={room} onOpen={onOpenRoom} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
