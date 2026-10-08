"use client";

import React, { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { MOTIONS, getLoopAnimation } from "./motions";

// Pembungkus "bagian bergerak" (tangan, telinga, dll), bersama untuk semua karakter.
//
// - motionId: nama preset di motions.js (misalnya "wave"). Kosong = bagian diam.
// - origin:   titik putar dalam piksel { x, y }
// - timeline: hasil useTimeline() milik karakter
//
// Saat preview diputar, gerakan diulang oleh framer-motion (versi loop).
// Saat pause/scrub/export, pose dihitung dari progress (versi seek) supaya
// hasil export sama persis dengan preview.
export function MovingPart({ motionId, origin, timeline, children, ...rest }) {
  const controls = useAnimationControls();
  const preset = motionId ? MOTIONS[motionId] : null;
  const isLooping = timeline.isPlaying && !timeline.isExporting;

  useEffect(() => {
    if (!preset) return;
    if (isLooping) {
      controls.start(getLoopAnimation(motionId));
    } else {
      controls.stop();
    }
  }, [preset, isLooping, motionId, controls]);

  if (!preset) return <g {...rest}>{children}</g>;

  return (
    <motion.g
      style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
      animate={timeline.shouldUseSeekPose ? preset.seek(timeline.progress % 1) : controls}
      {...rest}
    >
      {children}
    </motion.g>
  );
}
