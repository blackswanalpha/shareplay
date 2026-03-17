"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Howl } from "howler";

export function useAmbientAudio(src: string) {
  const howlRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getHowl = useCallback(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: [src],
        loop: true,
        volume: 0,
        html5: true,
        preload: false,
        onplayerror: () => {
          // Browser blocked autoplay — retry on next user gesture
          setIsPlaying(false);
          howlRef.current?.once("unlock", () => {
            howlRef.current?.play();
          });
        },
        onloaderror: () => {
          setHasError(true);
          setIsPlaying(false);
        },
        onplay: () => {
          setIsPlaying(true);
        },
      });
    }
    return howlRef.current;
  }, [src]);

  const play = useCallback(() => {
    const howl = getHowl();
    howl.load();
    howl.play();
    howl.fade(0, 0.3, 2000);
  }, [getHowl]);

  const stop = useCallback(() => {
    const howl = howlRef.current;
    if (howl && isPlaying) {
      const currentVol = howl.volume();
      howl.fade(currentVol, 0, 1000);
      setTimeout(() => {
        howl.pause();
        setIsPlaying(false);
      }, 1000);
    }
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  useEffect(() => {
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  return { toggle, isPlaying, hasError };
}
