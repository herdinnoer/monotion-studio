"use client";

import { useEffect } from "react";
import { useSpring } from "framer-motion";

// Mata ikut posisi mouse. Geser maksimal 8px ke samping, 6px ke atas/bawah.
export function useEyeTracking(containerRef, enabled) {
  const eyeTrackX = useSpring(0, { stiffness: 140, damping: 16 });
  const eyeTrackY = useSpring(0, { stiffness: 140, damping: 16 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      const clampedX = Math.max(-1, Math.min(1, deltaX)) * 8;
      const clampedY = Math.max(-1, Math.min(1, deltaY)) * 6;

      eyeTrackX.set(clampedX);
      eyeTrackY.set(clampedY);
    };

    const handleMouseLeave = () => {
      eyeTrackX.set(0);
      eyeTrackY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      handleMouseLeave();
    };
  }, [enabled, containerRef, eyeTrackX, eyeTrackY]);

  return { eyeTrackX, eyeTrackY };
}
