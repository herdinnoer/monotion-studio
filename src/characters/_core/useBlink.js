"use client";

import { useEffect, useState } from "react";

// Kedip otomatis tiap 2,5–5 detik. Berhenti saat timeline di-pause.
export function useBlink(enabled, timeline) {
  const [isBlinking, setIsBlinking] = useState(false);
  const { isPlaying, isExporting } = timeline;

  useEffect(() => {
    if (!enabled || (!isPlaying && !isExporting)) return;
    let timerId;

    const runBlinkCycle = () => {
      const interval = 2500 + Math.random() * 2500;
      timerId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          runBlinkCycle();
        }, 130);
      }, interval);
    };

    runBlinkCycle();
    return () => clearTimeout(timerId);
  }, [enabled, isPlaying, isExporting]);

  return isBlinking;
}
