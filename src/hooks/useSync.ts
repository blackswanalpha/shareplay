"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAtomValue } from "jotai";
import { playerStateAtom, syncStatusAtom } from "@/store/roomAtoms";
import type { SocketActions } from "./useSocket";

interface UseSyncOptions {
  actions: SocketActions;
  playerRef: React.RefObject<{ seekTo: (seconds: number) => void; getCurrentTime: () => number } | null>;
}

export function useSync({ actions, playerRef }: UseSyncOptions) {
  const playerState = useAtomValue(playerStateAtom);
  const syncStatus = useAtomValue(syncStatusAtom);
  const lastSyncRef = useRef(0);
  const isRemoteUpdateRef = useRef(false);

  // When remote sync_update arrives, imperatively seek player if delta > 2s
  useEffect(() => {
    if (!playerRef.current) return;

    const localTime = playerRef.current.getCurrentTime?.() ?? 0;
    const delta = Math.abs(localTime - playerState.currentTime);

    if (delta > 2) {
      isRemoteUpdateRef.current = true;
      playerRef.current.seekTo(playerState.currentTime);
      // Reset flag after a short delay
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 500);
    }
  }, [playerState.currentTime, playerState.sequenceId, playerRef]);

  const handlePlay = useCallback(() => {
    if (isRemoteUpdateRef.current) return;
    const time = playerRef.current?.getCurrentTime?.() ?? 0;
    actions.emitPlay(time);
  }, [actions, playerRef]);

  const handlePause = useCallback(() => {
    if (isRemoteUpdateRef.current) return;
    const time = playerRef.current?.getCurrentTime?.() ?? 0;
    actions.emitPause(time);
  }, [actions, playerRef]);

  const handleSeek = useCallback((seconds: number) => {
    if (isRemoteUpdateRef.current) return;
    actions.emitSeek(seconds);
  }, [actions]);

  const handleEnded = useCallback(() => {
    actions.playNext();
  }, [actions]);

  return {
    handlePlay,
    handlePause,
    handleSeek,
    handleEnded,
    isRemoteUpdate: isRemoteUpdateRef,
    syncStatus,
  };
}
