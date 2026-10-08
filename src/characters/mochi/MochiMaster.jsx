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
import { MochiBody } from "./MochiBody";

const { anatomy } = mochiConfig;

const STATE_THEMES = {
  idle: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  working: { gradId: "working3dGrad", stroke: "#93C5FD", glow: null },
  thinking: { gradId: "thinking3dGrad", stroke: "#C4B5FD", glow: null },
  searching: { gradId: "searching3dGrad", stroke: "#A5B4FC", glow: null },
  approval: { gradId: "approval3dGrad", stroke: "#FCD34D", glow: null },
  question: { gradId: "question3dGrad", stroke: "#80DEEA", glow: null },
  error: { gradId: "error3dGrad", stroke: "#FDA4AF", glow: "glow-red" },
  finished: { gradId: "finished3dGrad", stroke: "#6EE7B7", glow: "glow-teal" },
  rate_limit: { gradId: "ratelimit3dGrad", stroke: "#FDBA74", glow: null },
  sleeping: { gradId: "sleeping3dGrad", stroke: "#D8B4FE", glow: null },
  dizzy: { gradId: "dizzy3dGrad", stroke: "#F472B6", glow: null },
  greeting: { gradId: "greeting3dGrad", stroke: "#FDE047", glow: null },
  love: { gradId: "love3dGrad", stroke: "#F43F5E", glow: "glow-pink" },
  surprised: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  proud: { gradId: "proud3dGrad", stroke: "#A7F3D0", glow: null },
  wink: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  yawn: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  annoyed: { gradId: "mochi3dGrad", stroke: "#94A3B8", glow: null },
  dancing: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  beanie: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  santa_hat: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  glasses: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
};

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

  const badgeX = cx - 0.96 * rx;
  const badgeY = cy - 1.0 * ry;

  const eyeLeftX = cx - anatomy.eyeSpacing * rx;
  const eyeRightX = cx + anatomy.eyeSpacing * rx;
  const eyeBaseY = cy - 0.02 * ry;

  const blushLeftX = cx - anatomy.blushSpacing * rx;
  const blushRightX = cx + anatomy.blushSpacing * rx;
  const blushY = cy + 0.24 * ry;

  const bodyPath = useMemo(() => {
    return generateSuperellipsePath(cx, cy, rx, ry, shapePreset);
  }, [cx, cy, rx, ry, shapePreset]);

  const mood = getMochiMood(state);
  const currentTheme = STATE_THEMES[state] || STATE_THEMES.idle;
  const gradId = color ? `customBodyGrad` : currentTheme.gradId;
  const strokeColor = currentTheme.stroke;
  const outerGlowFilter = currentTheme.glow;

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

          <radialGradient id="working3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E0F2FE" />
            <stop offset="80%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#93C5FD" />
          </radialGradient>

          <radialGradient id="thinking3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F3E8FF" />
            <stop offset="80%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </radialGradient>

          <radialGradient id="searching3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#EEF2FF" />
            <stop offset="80%" stopColor="#C7D2FE" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </radialGradient>

          <radialGradient id="approval3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF3C7" />
            <stop offset="80%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FCD34D" />
          </radialGradient>

          <radialGradient id="question3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E0F7FA" />
            <stop offset="80%" stopColor="#B2EBF2" />
            <stop offset="100%" stopColor="#80DEEA" />
          </radialGradient>

          <radialGradient id="error3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFE4E6" />
            <stop offset="80%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </radialGradient>

          <radialGradient id="finished3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#ECFDF5" />
            <stop offset="80%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </radialGradient>

          <radialGradient id="ratelimit3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFEDD5" />
            <stop offset="80%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </radialGradient>

          <radialGradient id="sleeping3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FAF5FF" />
            <stop offset="80%" stopColor="#E9D5FF" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </radialGradient>

          <radialGradient id="dizzy3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FCE7F3" />
            <stop offset="80%" stopColor="#FBCFE8" />
            <stop offset="100%" stopColor="#F472B6" />
          </radialGradient>

          <radialGradient id="greeting3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F8FAFC" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          <radialGradient id="love3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F0F9FF" />
            <stop offset="80%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </radialGradient>

          <radialGradient id="proud3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#ECFDF5" />
            <stop offset="80%" stopColor="#D1FAE5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>

          {color && (
            <radialGradient id="customBodyGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          )}

          <linearGradient id="santaRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D4D" />
            <stop offset="45%" stopColor="#DC2626" />
            <stop offset="85%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          <linearGradient id="beanieBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="40%" stopColor="#3B82F6" />
            <stop offset="85%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <linearGradient id="beanieBrimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

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

          <radialGradient id="furWhiteGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

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

          <filter id="glow-teal" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-red" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-pink" x="-25%" y="-25%" width="150%" height="150%">
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

        {outerGlowFilter && (
          <path
            d={bodyPath}
            fill="none"
            stroke={
              state === "finished"
                ? "#10B981"
                : state === "love"
                ? "#F43F5E"
                : "#EF4444"
            }
            strokeWidth={0.2}
            opacity={0.65}
            filter={`url(#${outerGlowFilter})`}
          />
        )}

        <Particles type={mood.particles} layer="back" cx={cx} cy={cy} rx={rx} ry={ry} p={p} />

        <MochiBody
          bodyPath={bodyPath}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          baseFill={`url(#${gradId})`}
          stroke={strokeColor}
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

        {renderAccessories({ state, cx, cy, rx, ry, R, eyeBaseY })}

        <Badge type={mood.badge?.type} color={mood.badge?.color} x={badgeX} y={badgeY} p={p} />

        <Particles type={mood.particles} layer="front" cx={cx} cy={cy} rx={rx} ry={ry} p={p} />
      </motion.svg>
    </div>
  );
}

function renderAccessories({ state, cx, cy, rx, ry, R, eyeBaseY }) {
  const eyeY = eyeBaseY ?? (cy - 0.02 * ry);

  switch (state) {
    case "beanie": {
      const eyeLevelY = eyeBaseY ?? (cy - 0.02 * ry);
      const brimWidth = 232;
      const brimHeight = 24;
      const brimX = cx - brimWidth / 2;
      const brimY = eyeLevelY - 29;
      const domeBaseY = brimY + 4;
      const domeTopY = cy - ry - 8;

      return (
        <g filter="url(#dropShadowFilter)">
          <ellipse
            cx={cx}
            cy={brimY + brimHeight + 1}
            rx={brimWidth / 2 - 8}
            ry={5}
            fill="#0F172A"
            opacity={0.24}
          />

          <path
            d={`M ${cx - 108} ${domeBaseY} 
               C ${cx - 114} ${domeBaseY - 42}, ${cx - 82} ${domeTopY}, ${cx} ${domeTopY} 
               C ${cx + 82} ${domeTopY}, ${cx + 114} ${domeBaseY - 42}, ${cx + 108} ${domeBaseY} 
               Q ${cx} ${domeBaseY + 4} ${cx - 108} ${domeBaseY} Z`}
            fill="url(#beanieBlueGrad)"
            stroke="#1E3A8A"
            strokeWidth={2}
          />

          <g fill="none" stroke="#93C5FD" strokeWidth={2} opacity={0.55}>
            <line x1={cx} y1={domeTopY} x2={cx} y2={domeBaseY} />
            <path d={`M ${cx - 8} ${domeTopY + 1} Q ${cx - 20} 145 ${cx - 26} ${domeBaseY}`} />
            <path d={`M ${cx - 16} ${domeTopY + 3} Q ${cx - 42} 146 ${cx - 52} ${domeBaseY}`} />
            <path d={`M ${cx - 24} ${domeTopY + 7} Q ${cx - 68} 149 ${cx - 78} ${domeBaseY}`} />
            <path d={`M ${cx - 32} ${domeTopY + 13} Q ${cx - 92} 153 ${cx - 102} ${domeBaseY}`} />
            <path d={`M ${cx + 8} ${domeTopY + 1} Q ${cx + 20} 145 ${cx + 22} ${domeBaseY}`} />
            <path d={`M ${cx + 16} ${domeTopY + 3} Q ${cx + 42} 146 ${cx + 52} ${domeBaseY}`} />
            <path d={`M ${cx + 24} ${domeTopY + 7} Q ${cx + 68} 149 ${cx + 78} ${domeBaseY}`} />
            <path d={`M ${cx + 32} ${domeTopY + 13} Q ${cx + 92} 153 ${cx + 102} ${domeBaseY}`} />
          </g>

          <rect
            x={brimX}
            y={brimY}
            width={brimWidth}
            height={brimHeight}
            rx={11}
            fill="url(#beanieBrimGrad)"
            stroke="#1E3A8A"
            strokeWidth={2}
          />

          <g stroke="#1E3A8A" strokeWidth={1.4} opacity={0.35}>
            {Array.from({ length: 28 }).map((_, i) => {
              const xPos = brimX + 10 + i * ((brimWidth - 20) / 27);
              return (
                <line
                  key={`brim-rib-${i}`}
                  x1={xPos}
                  y1={brimY + 3}
                  x2={xPos}
                  y2={brimY + brimHeight - 3}
                />
              );
            })}
          </g>

          <g>
            <circle cx={cx - 12} cy={domeTopY - 16} r={10} fill="#F8FAFC" />
            <circle cx={cx + 12} cy={domeTopY - 16} r={10} fill="#F8FAFC" />
            <circle cx={cx} cy={domeTopY - 26} r={10} fill="#F8FAFC" />
            <circle cx={cx - 8} cy={domeTopY - 24} r={10} fill="#F8FAFC" />
            <circle cx={cx + 8} cy={domeTopY - 24} r={10} fill="#F8FAFC" />
            <circle
              cx={cx}
              cy={domeTopY - 18}
              r={19}
              fill="url(#furWhiteGrad)"
              stroke="#CBD5E1"
              strokeWidth={1.8}
            />
            <circle
              cx={cx - 5}
              cy={domeTopY - 23}
              r={6}
              fill="#FFFFFF"
              opacity={0.85}
            />
          </g>
        </g>
      );
    }

    case "santa_hat": {
      const eyeLevelY = eyeBaseY ?? (cy - 0.02 * ry);
      const brimWidth = 232;
      const brimHeight = 28;
      const brimX = cx - brimWidth / 2;
      const brimY = eyeLevelY - 29;
      const domeBaseY = brimY + 6;
      const domeTopY = cy - ry - 12;

      return (
        <g filter="url(#dropShadowFilter)">
          <ellipse
            cx={cx}
            cy={brimY + brimHeight + 1}
            rx={brimWidth / 2 - 8}
            ry={5}
            fill="#0F172A"
            opacity={0.24}
          />

          <path
            d={`M ${cx - 108} ${domeBaseY} 
               C ${cx - 114} ${domeBaseY - 45}, ${cx - 70} ${domeTopY}, ${cx - 10} ${domeTopY} 
               C ${cx + 50} ${domeTopY - 5}, ${cx + 115} ${domeTopY + 25}, ${cx + 125} ${domeTopY + 50} 
               C ${cx + 112} ${domeTopY + 25}, ${cx + 114} ${domeBaseY - 20}, ${cx + 108} ${domeBaseY} 
               Q ${cx} ${domeBaseY + 4} ${cx - 108} ${domeBaseY} Z`}
            fill="url(#santaRedGrad)"
            stroke="#7F1D1D"
            strokeWidth={2}
          />

          <path
            d={`M ${cx - 80} ${domeBaseY - 25} Q ${cx - 20} ${domeTopY + 15} ${cx + 40} ${domeTopY + 10}`}
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.45}
            fill="none"
          />

          <rect
            x={brimX}
            y={brimY}
            width={brimWidth}
            height={brimHeight}
            rx={14}
            fill="url(#furWhiteGrad)"
            stroke="#CBD5E1"
            strokeWidth={1.8}
          />

          <g>
            <circle
              cx={cx + 125}
              cy={domeTopY + 52}
              r={18}
              fill="url(#furWhiteGrad)"
              stroke="#CBD5E1"
              strokeWidth={1.8}
            />
            <circle
              cx={cx + 120}
              cy={domeTopY + 47}
              r={6}
              fill="#FFFFFF"
              opacity={0.85}
            />
          </g>
        </g>
      );
    }

    case "glasses":
      return (
        <g stroke="#78350F" strokeWidth={3} fill="none" filter="url(#dropShadowFilter)">
          <circle cx={cx - 0.37 * rx} cy={eyeY} r={22.5} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
          <circle cx={cx + 0.37 * rx} cy={eyeY} r={22.5} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
          <path
            d={`M ${cx - 0.37 * rx - 12} ${eyeY - 12} Q ${cx - 0.37 * rx} ${eyeY - 18} ${cx - 0.37 * rx + 12} ${eyeY - 12}`}
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.7}
          />
          <path
            d={`M ${cx + 0.37 * rx - 12} ${eyeY - 12} Q ${cx + 0.37 * rx} ${eyeY - 18} ${cx + 0.37 * rx + 12} ${eyeY - 12}`}
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.7}
          />
          <path d={`M ${cx - 22} ${eyeY - 4} Q ${cx} ${eyeY - 10} ${cx + 22} ${eyeY - 4}`} stroke="#A16207" />
          <line x1={cx - 0.37 * rx - 22.5} y1={eyeY} x2={cx - rx * 0.72} y2={eyeY - 2} stroke="#A16207" />
          <line x1={cx + 0.37 * rx + 22.5} y1={eyeY} x2={cx + rx * 0.72} y2={eyeY - 2} stroke="#A16207" />
        </g>
      );

    default:
      return null;
  }
}

export { renderAccessories, renderAccessories as RenderAccessories };
export default MochiMaster;