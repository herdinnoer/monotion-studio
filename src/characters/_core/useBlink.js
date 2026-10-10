"use client";

import { useEffect, useState } from "react";

// Kedip otomatis tiap 2,5–5 detik, hanya saat preview diputar.
// Berhenti saat timeline di-pause DAN saat export (Fase 3 F1c), karena kedip acak tidak
// bisa diulang persis: hasil export harus sama dengan preview yang di-pause.
export function useBlink(enabled, timeline) {
  const [isBlinking, setIsBlinking] = useState(false);
  const { isPlaying, isExporting } = timeline;

  useEffect(() => {
    if (!enabled || !isPlaying || isExporting) return;
    let timerId;

    const runBlinkCycle = () => {
      const interval = 2500 + Math.random() * 2500;
      timerId = setTimeout(() => {
        setIsBlinking(true);
        // Timer "buka mata" ikut disimpan, supaya ikut dibatalkan kalau berhenti di tengah kedip
        timerId = setTimeout(() => {
          setIsBlinking(false);
          runBlinkCycle();
        }, 130);
      }, interval);
    };

    runBlinkCycle();
    return () => {
      clearTimeout(timerId);
      // Berhenti tepat saat mata terpejam → buka lagi, jangan beku terpejam
      setIsBlinking(false);
    };
  }, [enabled, isPlaying, isExporting]);

  return isBlinking;
}
