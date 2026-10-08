"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { mochiConfig } from "./mochi.config";
import { getMochiMood } from "./mochi.moods";
import { generateSuperellipsePath } from "../_core/shapes";
import { useTimeline } from "../_core/useTimeline";
import { useBlink } from "../_core/useBlink";
import { useEyeTracking } from "../_core/useEyeTracking";
import { MOTIONS, getLoopAnimation } from "../_core/motions";
import { Eyes } from "../_core/parts/Eyes";
import { Blush } from "../_core/parts/Blush";
import { Badge } from "../_core/parts/Badge";
import { Particles } from "../_core/parts/Particles";
import { Accessory } from "../_core/parts/accessories";
import { resolveAnchors } from "../_core/anchors";
import { MochiBody } from "./MochiBody";
import {
  MOOD_TINT_OPACITY,
  MOOD_TINT_GRADIENT,
  MOOD_TINT_STOPS,
  MOOD_GLOW_OPACITY,
  getMoodColors,
} from "../_core/moodTint";

const { anatomy, anchors, allowedAccessories } = mochiConfig;

// Garis tepi badan (tipis). Nuansa mood datang dari lapisan tipis, bukan dari sini.
const BODY_STROKE = "#CBD5E1";

export function MochiMaster({
  state = "idle",
  shapePreset = "mochi",
  color = null,
  size = 280,
  enableTracking = true,
  enableBlink = true,
  showShadow = true,
  className = "",
  style = {},
  onClick,
}) {
  const containerRef = useRef(null);

  // Mesin gerak bersama dari _core: timeline, kedip, mata ikut mouse
  const timeline = useTimeline();
  const { shouldUseSeekPose } = timeline;
  const isBlinking = useBlink(enableBlink, timeline);
  const { eyeTrackX, eyeTrackY } = useEyeTracking(containerRef, enableTracking);

  const bodyControls = useAnimationControls();

  const bodyMotion = state === "dancing" ? "dance" : "float";

  // Kontrol Animasi Preview Normal (Hanya aktif jika sedang PLAY dan TIDAK sedang EXPORT)
  useEffect(() => {
    if (timeline.isPlaying && !timeline.isExporting) {
      bodyControls.start(getLoopAnimation(bodyMotion));
    } else {
      bodyControls.stop();
    }
  }, [timeline.isPlaying, timeline.isExporting, bodyMotion, state, bodyControls]);

  const cx = 200;
  const cy = 205;
  const R = 95;
  const rx = anatomy.rx * R;
  const ry = anatomy.ry * R;

  // Titik tempel (aksesori, Zzz, bintang, badge) dalam koordinat kanvas
  const points = resolveAnchors(anchors, { cx, cy, rx, ry });

  const eyeOffset = anatomy.eyeSpacing * rx;
  const eyeLeftX = points.face.x - eyeOffset;
  const eyeRightX = points.face.x + eyeOffset;
  const eyeBaseY = points.face.y;

  const blushLeftX = cx - anatomy.blushSpacing * rx;
  const blushRightX = cx + anatomy.blushSpacing * rx;
  const blushY = cy + 0.24 * ry;

  const bodyPath = useMemo(() => {
    return generateSuperellipsePath(cx, cy, rx, ry, shapePreset);
  }, [cx, cy, rx, ry, shapePreset]);

  const mood = getMochiMood(state);
  // Lapisan 1: warna dasar (gradient putih bawaan, atau warna pilihan user)
  const baseFill = color ? "url(#customBodyGrad)" : "url(#mochi3dGrad)";
  // Lapisan 3 & 4: nuansa mood (lapisan tipis + glow), dari _core/moodTint.js
  const moodColors = getMoodColors(mood);
  const tintFill = moodColors.tint ? "url(#moodTintGrad)" : null;

  // Pose frame deterministik saat EXPORT maupun SCRUBBING, dihitung dari progress
  const p = timeline.progress % 1;
  const seekBodyPose = MOTIONS[bodyMotion].seek(p);

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center select-none relative ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
    >
      <motion.svg
        key={state}
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        style={{ transformOrigin: "200px 205px" }}
        animate={shouldUseSeekPose ? seekBodyPose : bodyControls}
      >
        <defs>
          <radialGradient id="mochi3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F8FAFC" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          {moodColors.tint && (
            <radialGradient id="moodTintGrad" {...MOOD_TINT_GRADIENT}>
              {MOOD_TINT_STOPS.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={moodColors.tint}
                  stopOpacity={stop.opacity}
                />
              ))}
            </radialGradient>
          )}

          {color && (
            <radialGradient id="customBodyGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          )}

          <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <linearGradient id="witchPurpleGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="40%" stopColor="#9333EA" />
            <stop offset="80%" stopColor="#6B21A8" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          <linearGradient id="partyPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="45%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>

          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          <linearGradient id="sunglassesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3F3F46" />
            <stop offset="40%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          <linearGradient id="badgeGlossSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>

          <radialGradient id="specularGrad" cx="42%" cy="40%" r="56%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#FFA0B4" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFA0B4" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="eyeGloss" cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#4A4A4F" stopOpacity={1} />
            <stop offset="45%" stopColor="#1E1E22" stopOpacity={1} />
            <stop offset="85%" stopColor="#0B0B0E" stopOpacity={1} />
            <stop offset="100%" stopColor="#1F2028" stopOpacity={1} />
          </radialGradient>

          <filter id="eyeHighlightBloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="glow" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="softCore" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="softCore" />
            </feMerge>
          </filter>

          <filter id="dropShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity={0.35} />
          </filter>

          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="moodGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="groundShadowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>

        {showShadow && (
          <ellipse
            cx={cx}
            cy={cy + ry + 16}
            rx={rx * 0.88}
            ry={14}
            fill="#090A0F"
            opacity={0.18}
            filter="url(#groundShadowFilter)"
          />
        )}

        {moodColors.glow && (
          <path
            d={bodyPath}
            fill="none"
            stroke={moodColors.glow}
            strokeWidth={0.2}
            opacity={MOOD_GLOW_OPACITY}
            filter="url(#moodGlow)"
          />
        )}

        <Particles type={mood.particles} layer="back" anchor={points.stars} rx={rx} ry={ry} p={p} />

        <MochiBody
          bodyPath={bodyPath}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          baseFill={baseFill}
          stroke={BODY_STROKE}
          tintFill={tintFill}
          tintColor={moodColors.tint}
          partMotions={mood.parts}
          timeline={timeline}
        />

        <Blush variant={mood.blush} leftX={blushLeftX} rightX={blushRightX} y={blushY} />

        <Eyes
          variant={mood.eyes}
          leftX={eyeLeftX}
          rightX={eyeRightX}
          y={eyeBaseY}
          isBlinking={isBlinking && mood.blink !== false}
          eyeTrackX={eyeTrackX}
          eyeTrackY={eyeTrackY}
          p={p}
        />

        {/* Lapisan tipis mood: menimpa badan, garis tepi, mata & pipi */}
        {tintFill && (
          <path
            d={bodyPath}
            fill={tintFill}
            stroke={moodColors.tint}
            strokeWidth={0.1}
            opacity={MOOD_TINT_OPACITY}
            pointerEvents="none"
          />
        )}

        <Accessory
          type={mood.accessory}
          allowed={allowedAccessories}
          points={points}
          headWidth={2 * rx}
          eyeOffset={eyeOffset}
        />

        <Badge type={mood.badge?.type} color={mood.badge?.color} x={points.badge.x} y={points.badge.y} p={p} />

        <Particles type={mood.particles} layer="front" anchor={points.zzz} rx={rx} ry={ry} p={p} />
      </motion.svg>
    </div>
  );
}

export default MochiMaster;