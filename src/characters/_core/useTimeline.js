"use client";

import { useEffect, useState } from "react";

// Nama sinyal timeline bersama untuk semua karakter.
// Player bar & export mengirim sinyal ini; karakter mendengarkannya.
export const TIMELINE_EVENT = "character-timeline-update";

// Kirim posisi timeline ke karakter (dipakai player bar & export).
export function dispatchTimeline(detail) {
  window.dispatchEvent(new CustomEvent(TIMELINE_EVENT, { detail }));
}

/**
 * Dengarkan sinyal timeline.
 * - progress: posisi 0–1 dalam satu putaran
 * - shouldUseSeekPose: true saat pause/scrub/export → pose dihitung dari progress
 */
export function useTimeline() {
  const [timeline, setTimeline] = useState({ progress: 0, isPlaying: true, isExporting: false });

  useEffect(() => {
    const handleTimelineUpdate = (e) => {
      if (!e.detail) return;
      setTimeline((prev) => {
        // Jika sedang dalam proses export, abaikan event dari player biasa
        if (prev.isExporting && !e.detail.isExporting && e.detail.isPlaying) {
          return prev;
        }
        return {
          progress: e.detail.progress ?? 0,
          isPlaying: e.detail.isExporting ? false : (e.detail.isPlaying ?? true),
          isExporting: e.detail.isExporting ?? false,
        };
      });
    };
    window.addEventListener(TIMELINE_EVENT, handleTimelineUpdate);
    return () => window.removeEventListener(TIMELINE_EVENT, handleTimelineUpdate);
  }, []);

  const shouldUseSeekPose = !timeline.isPlaying || timeline.isExporting;

  return { ...timeline, shouldUseSeekPose };
}
