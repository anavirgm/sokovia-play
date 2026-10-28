"use client";

import { useCallback, useEffect, useRef } from "react";

import { saveWatchProgress } from "@/actions/watch-history";

type UseWatchProgressOptions = {
  tmdbId: number;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  throttleMs?: number;
};

export function useWatchProgress({ tmdbId, throttleMs = 1500 }: UseWatchProgressOptions) {
  const lastSaveRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const lastPositionRef = useRef<number>(0);

  const saveProgress = useCallback(
    async (currentTime: number, duration: number) => {
      if (!duration || duration <= 0) return;
      if (currentTime < 0) return;

      const now = Date.now();
      if (now - lastSaveRef.current < throttleMs) return;

      // No guardar si está muy cerca del inicio o muy cerca del final
      if (currentTime < 10) return;
      if (duration - currentTime < 10) return;

      lastSaveRef.current = now;
      lastPositionRef.current = currentTime;
      durationRef.current = duration;

      try {
        await saveWatchProgress({
          tmdbId,
          lastPositionSeconds: currentTime,
          durationSeconds: duration,
        });
      } catch (error) {
        console.error("Error saving watch progress:", error);
      }
    },
    [tmdbId, throttleMs],
  );

  // Intentar guardar antes de salir de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lastPositionRef.current > 10 && durationRef.current > 0) {
        // Usar sendBeacon para asegurar que se envíe
        const data = JSON.stringify({
          tmdbId,
          lastPositionSeconds: Math.floor(lastPositionRef.current),
          durationSeconds: Math.floor(durationRef.current),
        });
        navigator.sendBeacon?.(
          "/api/watch-progress",
          new Blob([data], { type: "application/json" }),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tmdbId]);

  return { saveProgress };
}
