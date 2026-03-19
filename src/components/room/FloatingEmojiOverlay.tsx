"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { liveReactionsAtom } from "@/store/roomAtoms";

export function FloatingEmojiOverlay() {
  const reactions = useAtomValue(liveReactionsAtom);
  const setReactions = useSetAtom(liveReactionsAtom);
  const prefersReducedMotion = useReducedMotion();

  // Safety cleanup: prune reactions older than 4s every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 4000;
      setReactions((prev) => {
        const filtered = prev.filter((r) => r.createdAt > cutoff);
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [setReactions]);

  const handleComplete = (id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {reactions.map((reaction) => {
          const duration = 2.5 + Math.random() * 1;

          return (
            <motion.div
              key={reaction.id}
              initial={{
                opacity: 1,
                y: 0,
                scale: 0.5,
              }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0, scale: 1 }
                  : {
                      opacity: [1, 1, 0],
                      y: -400,
                      scale: [0.5, 1.2, 1],
                    }
              }
              exit={{ opacity: 0 }}
              transition={{
                duration,
                ease: "easeOut",
              }}
              onAnimationComplete={() => handleComplete(reaction.id)}
              style={{
                position: "absolute",
                bottom: 100,
                left: `${reaction.x}%`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  lineHeight: 1,
                }}
              >
                {reaction.emoji}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.5)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                }}
              >
                {reaction.username}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
