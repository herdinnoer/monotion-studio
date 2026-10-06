"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useSpring, useAnimationControls } from "framer-motion";

/**
 * Superellipse generator: |x/rx|^n + |y/ry|^n = 1
 */
function generateSuperellipsePath(cx, cy, rx, ry, preset = "mochi", segments = 160) {
  let n = 2.7;
  if (preset === "round") n = 2.0;
  else if (preset === "boxy") n = 4.5;

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const exponent = 2 / n;
    const x = cx + rx * Math.sign(cosT) * Math.pow(Math.abs(cosT), exponent);
    const y = cy + ry * Math.sign(sinT) * Math.pow(Math.abs(sinT), exponent);

    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ") + " Z";
}

function generateSpiralPath(cx, cy, maxR = 15.5, turns = 2.5) {
  const points = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * 2 * Math.PI;
    const r = t * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join(" ");
}

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
  const [isBlinking, setIsBlinking] = useState(false);
  const [timeline, setTimeline] = useState({ progress: 0, isPlaying: true, isExporting: false });

  const bodyControls = useAnimationControls();
  const greetingControls = useAnimationControls();

  const eyeTrackX = useSpring(0, { stiffness: 140, damping: 16 });
  const eyeTrackY = useSpring(0, { stiffness: 140, damping: 16 });

  // Di MochiMaster useEffect untuk listen timeline update
useEffect(() => {
  const handleTimelineUpdate = (e) => {
    if (e.detail) {
      setTimeline({
        progress: e.detail.progress ?? 0,
        isPlaying: e.detail.isPlaying ?? true,
        isExporting: e.detail.isExporting ?? false, // ← Add this
      });
    }
  };
  window.addEventListener("mochi-timeline-update", handleTimelineUpdate);
  return () => window.removeEventListener("mochi-timeline-update", handleTimelineUpdate);
}, []);

// Update shouldUseSeekPose logic
const shouldUseSeekPose = !timeline.isPlaying || timeline.isExporting;
// ✅ Now when exporting, akan gunakan seekBodyPose yang deterministic

  const isDancing = state === "dancing";

  // Kontrol Animasi Preview Normal (Hanya aktif jika sedang PLAY dan TIDAK sedang EXPORT)
  useEffect(() => {
    if (timeline.isPlaying && !timeline.isExporting) {
      bodyControls.start(
        isDancing
          ? {
              y: [0, -12, 0],
              rotate: [-6, 6, -6],
              scaleX: [1, 0.96, 1],
              scaleY: [1, 1.05, 1],
              transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
            }
          : {
              y: [0, -6, 0],
              rotate: 0,
              scaleX: 1,
              scaleY: 1,
              scale: [1, 1.012, 1],
              transition: { repeat: Infinity, duration: 3.6, ease: "easeInOut" },
            }
      );
    } else {
      bodyControls.stop();
    }
  }, [timeline.isPlaying, timeline.isExporting, isDancing, state, bodyControls]);

  useEffect(() => {
    if (state === "greeting") {
      if (timeline.isPlaying && !timeline.isExporting) {
        greetingControls.start({
          rotate: [-10, 24, -10],
          transition: { repeat: Infinity, duration: 0.75, ease: "easeInOut" },
        });
      } else {
        greetingControls.stop();
      }
    }
  }, [timeline.isPlaying, timeline.isExporting, state, greetingControls]);

  const cx = 200;
  const cy = 205;
  const R = 95;
  const rx = 1.14 * R;
  const ry = 0.88 * R;

  const badgeX = cx - 0.96 * rx;
  const badgeY = cy - 1.0 * ry;

  const eyeLeftX = cx - 0.37 * rx;
  const eyeRightX = cx + 0.37 * rx;
  const eyeBaseY = cy - 0.02 * ry;

  const blushLeftX = cx - 0.52 * rx;
  const blushRightX = cx + 0.52 * rx;
  const blushY = cy + 0.24 * ry;

  const bodyPath = useMemo(() => {
    return generateSuperellipsePath(cx, cy, rx, ry, shapePreset);
  }, [cx, cy, rx, ry, shapePreset]);

  const currentTheme = STATE_THEMES[state] || STATE_THEMES.idle;
  const gradId = color ? `customBodyGrad` : currentTheme.gradId;
  const strokeColor = currentTheme.stroke;
  const outerGlowFilter = currentTheme.glow;

  // Auto-Blink timer
  useEffect(() => {
    if (!enableBlink || (!timeline.isPlaying && !timeline.isExporting)) return;
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
  }, [enableBlink, timeline.isPlaying, timeline.isExporting]);

  // Mouse Tracking
  useEffect(() => {
    if (!enableTracking) return;

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
  }, [enableTracking, eyeTrackX, eyeTrackY]);

  // PERBAIKAN UTAMA: Perhitungan pose frame deterministik saat EXPORT maupun SCRUBBING
  const p = timeline.progress % 1;
  const bounce = (1 - Math.cos(p * Math.PI * 2)) / 2;

  const seekBodyPose = isDancing
    ? {
        y: -12 * bounce,
        rotate: Math.sin(p * Math.PI * 2) * 6,
        scaleX: 1 - 0.04 * bounce,
        scaleY: 1 + 0.05 * bounce,
      }
    : {
        y: -6 * bounce,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        scale: 1 + 0.012 * bounce,
      };

  // ✅ ADD: Function untuk get actual animation duration per state
const getAnimationDuration = () => {
  const durationMap = {
    dancing: 0.8 * 1000,      // 800ms
    greeting: 0.75 * 1000,    // 750ms
    idle: 3.6 * 1000,         // 3600ms
    working: 3.6 * 1000,
    thinking: 3.6 * 1000,
    searching: 3.6 * 1000,
    approval: 3.6 * 1000,
    question: 3.6 * 1000,
    error: 3.6 * 1000,
    finished: 3.6 * 1000,
    rate_limit: 3.6 * 1000,
    sleeping: 3.6 * 1000,
    dizzy: 3.6 * 1000,
    love: 3.6 * 1000,
    surprised: 3.6 * 1000,
    proud: 3.6 * 1000,
    wink: 3.6 * 1000,
    yawn: 3.6 * 1000,
    annoyed: 3.6 * 1000,
    beanie: 3.6 * 1000,
    santa_hat: 3.6 * 1000,
    glasses: 3.6 * 1000,
  };
  const duration = durationMap[state] || 3600; // ← Ini jadi default kalau state salah
  console.log("🎯 MochiMaster state:", state, "duration:", duration);
  return duration;
};

// ✅ ADD: Expose ke window global
useEffect(() => {
  window.getMochiAnimationDuration = getAnimationDuration;
}, [getAnimationDuration]);

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

        {state === "greeting" && (
          <motion.g
            style={{ transformOrigin: `${cx + rx * 0.80}px ${cy + 5}px` }}
            animate={
              shouldUseSeekPose
                ? { rotate: -10 + 34 * bounce }
                : greetingControls
            }
            filter="url(#dropShadowFilter)"
          >
            <path
              d={`M ${cx + rx * 0.70} ${cy - 8}
                 C ${cx + rx * 1.05} ${cy - 28}, ${cx + rx * 1.28} ${cy - 16}, ${cx + rx * 1.28} ${cy + 5}
                 C ${cx + rx * 1.28} ${cy + 22}, ${cx + rx * 1.05} ${cy + 24}, ${cx + rx * 0.70} ${cy + 16} Z`}
              fill="url(#mochi3dGrad)"
            />
            <ellipse
              cx={cx + rx * 1.08}
              cy={cy - 2}
              rx={10}
              ry={5}
              fill="#FFFFFF"
              opacity={0.55}
              transform={`rotate(-22, ${cx + rx * 1.08}, ${cy - 2})`}
            />
          </motion.g>
        )}

        {state === "finished" && renderFinishedStars(cx, cy, rx, ry, bounce)}

        <path
          d={bodyPath}
          fill={`url(#${gradId})`}
          stroke={strokeColor}
          strokeWidth={0.1}
        />

        <path
          d={bodyPath}
          fill={`url(#${gradId})`}
          stroke={strokeColor}
          strokeWidth={0.1}
        />

        {renderBlush(state, blushLeftX, blushRightX, blushY)}

        {renderEyes({
          state,
          leftX: eyeLeftX,
          rightX: eyeRightX,
          baseY: eyeBaseY,
          isBlinking,
          eyeTrackX,
          eyeTrackY,
          bounce,
          p,
        })}

        {renderAccessories({ state, cx, cy, rx, ry, R, eyeBaseY })}

        {renderBadge(state, badgeX, badgeY, bounce)}

        {renderParticles(state, cx, cy, rx, ry, p)}
      </motion.svg>
    </div>
  );
}

function renderBlush(state, leftX, rightX, y) {
  if (state === "sleeping" || state === "annoyed") return null;

  if (state === "love") {
    return (
      <g fill="#F43F5E" opacity={0.82} filter="url(#dropShadowFilter)">
        <path
          d={`M ${leftX} ${y} C ${leftX - 8} ${y - 8}, ${leftX - 14} ${y + 4}, ${leftX} ${y + 12} C ${leftX + 14} ${y + 4}, ${leftX + 8} ${y - 8}, ${leftX} ${y} Z`}
          transform={`scale(0.9) translate(${leftX * 0.11}, ${y * 0.11})`}
        />
        <path
          d={`M ${rightX} ${y} C ${rightX - 8} ${y - 8}, ${rightX - 14} ${y + 4}, ${rightX} ${y + 12} C ${rightX + 14} ${y + 4}, ${rightX + 8} ${y - 8}, ${rightX} ${y} Z`}
          transform={`scale(0.9) translate(${rightX * 0.11}, ${y * 0.11})`}
        />
      </g>
    );
  }

  if (state === "proud") {
    return (
      <g fill="#F59E0B" opacity={0.92}>
        <text x={leftX} y={y + 5} fontSize="17" textAnchor="middle">✨</text>
        <text x={rightX} y={y + 5} fontSize="17" textAnchor="middle">✨</text>
      </g>
    );
  }

  return (
    <g>
      <ellipse cx={leftX} cy={y} rx={17} ry={9.5} fill="url(#blushGrad)" />
      <ellipse cx={rightX} cy={y} rx={17} ry={9.5} fill="url(#blushGrad)" />
    </g>
  );
}

function renderEyes({
  state,
  leftX,
  rightX,
  baseY,
  isBlinking,
  eyeTrackX,
  eyeTrackY,
  p = 0,
}) {
  if (isBlinking && !["sleeping", "wink", "finished", "dancing"].includes(state)) {
    return (
      <g stroke="#18181B" strokeWidth={6.8} strokeLinecap="round">
        <line x1={leftX - 13} y1={baseY} x2={leftX + 13} y2={baseY} />
        <line x1={rightX - 13} y1={baseY} x2={rightX + 13} y2={baseY} />
      </g>
    );
  }

  if (["finished", "dancing", "proud"].includes(state)) {
    return (
      <g stroke="#111827" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY + 5} Q ${leftX} ${baseY - 9} ${leftX + 14} ${baseY + 5}`} />
        <path d={`M ${rightX - 14} ${baseY + 5} Q ${rightX} ${baseY - 9} ${rightX + 14} ${baseY + 5}`} />
      </g>
    );
  }

  if (state === "sleeping") {
    return (
      <g stroke="#1F2937" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY - 3} Q ${leftX} ${baseY + 11} ${leftX + 14} ${baseY - 3}`} />
        <path d={`M ${rightX - 14} ${baseY - 3} Q ${rightX} ${baseY + 11} ${rightX + 14} ${baseY - 3}`} />
      </g>
    );
  }

  if (state === "dizzy") {
    const leftSpiral = generateSpiralPath(leftX, baseY, 18, 2.5);
    const rightSpiral = generateSpiralPath(rightX, baseY, 18, 2.5);

    return (
      <g stroke="#1F2937" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <motion.path
          d={leftSpiral}
          animate={{ rotate: p * 360 }}
          style={{ transformOrigin: `${leftX}px ${baseY}px` }}
        />
        <motion.path
          d={rightSpiral}
          animate={{ rotate: -p * 360 }}
          style={{ transformOrigin: `${rightX}px ${baseY}px` }}
        />
      </g>
    );
  }

  if (state === "wink") {
    return (
      <g>
        <path
          d={`M ${leftX - 14} ${baseY + 5} Q ${leftX} ${baseY - 9} ${leftX + 14} ${baseY + 5}`}
          stroke="#18181B"
          strokeWidth={6.8}
          strokeLinecap="round"
          fill="none"
        />
        <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
          <circle cx={rightX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
          <circle
            cx={rightX - 4.8}
            cy={baseY - 4.8}
            r={5.2}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={rightX + 4.2}
            cy={baseY + 4.2}
            r={2.4}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
        </motion.g>
      </g>
    );
  }

  if (state === "yawn") {
    return (
      <g>
        <path
          d={`M ${leftX - 13} ${baseY - 7} L ${leftX} ${baseY} L ${leftX - 13} ${baseY + 7}`}
          stroke="#1F2937"
          strokeWidth={6.0}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={`M ${rightX + 13} ${baseY - 7} L ${rightX} ${baseY} L ${rightX + 13} ${baseY + 7}`}
          stroke="#1F2937"
          strokeWidth={6.0}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx={(leftX + rightX) / 2} cy={baseY + 15} rx={7} ry={11} fill="#E11D48" />
      </g>
    );
  }

  if (state === "annoyed" || state === "error" || state === "rate_limit") {
    return (
      <g stroke="#18181B" strokeWidth={6.8} strokeLinecap="round">
        <line
          x1={leftX - 15}
          y1={state === "error" ? baseY + 2.5 : baseY}
          x2={leftX + 15}
          y2={state === "error" ? baseY - 2.5 : baseY}
        />
        <line
          x1={rightX - 15}
          y1={state === "error" ? baseY - 2.5 : baseY}
          x2={rightX + 15}
          y2={state === "error" ? baseY + 2.5 : baseY}
        />
        {state === "error" && (
          <ellipse cx={(leftX + rightX) / 2} cy={baseY + 16} rx={8} ry={5} fill="#BE123C" />
        )}
      </g>
    );
  }

  if (state === "surprised") {
    return (
      <g>
        <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
          <circle cx={leftX} cy={baseY} r={18} fill="url(#eyeGloss)" />
          <circle
            cx={leftX - 5.2}
            cy={baseY - 5.2}
            r={5.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={leftX + 4.5}
            cy={baseY + 4.5}
            r={2.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />

          <circle cx={rightX} cy={baseY} r={18} fill="url(#eyeGloss)" />
          <circle
            cx={rightX - 5.2}
            cy={baseY - 5.2}
            r={5.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={rightX + 4.5}
            cy={baseY + 4.5}
            r={2.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
        </motion.g>

        <circle
          cx={(leftX + rightX) / 2}
          cy={baseY + 18}
          r={8.5}
          fill="#18181B"
        />
      </g>
    );
  }

  if (state === "love") {
    return (
      <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
        <circle cx={leftX} cy={baseY} r={17} fill="#BE123C" />
        <text x={leftX} y={baseY + 6} fontSize="17" textAnchor="middle" fill="#FFFFFF">❤️</text>
        <circle cx={rightX} cy={baseY} r={17} fill="#BE123C" />
        <text x={rightX} y={baseY + 6} fontSize="17" textAnchor="middle" fill="#FFFFFF">❤️</text>
      </motion.g>
    );
  }

  return (
    <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
      <circle cx={leftX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      <circle
        cx={leftX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      <circle
        cx={leftX + 4.2}
        cy={baseY + 4.2}
        r={2.4}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />

      <circle cx={rightX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      <circle
        cx={rightX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      <circle
        cx={rightX + 4.2}
        cy={baseY + 4.2}
        r={2.4}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
    </motion.g>
  );
}

function renderFinishedStars(cx, cy, rx, ry, bounce = 0) {
  const starPath = "M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z";
  const stars = [
    { id: 1, x: cx - 75, y: cy - ry * 0.1, scale: 0.85 },
    { id: 2, x: cx - 40, y: cy - ry * 0.3, scale: 1.3 },
    { id: 3, x: cx + 20, y: cy - ry * 0.2, scale: 0.95 },
    { id: 4, x: cx + 70, y: cy - ry * 0.1, scale: 1.15 },
    { id: 5, x: cx - 95, y: cy + ry * 0.1, scale: 0.75 },
    { id: 6, x: cx + 95, y: cy + ry * 0.1, scale: 0.85 },
    { id: 7, x: cx - 5, y: cy - ry * 0.4, scale: 1.4 },
  ];

  return (
    <g filter="url(#dropShadowFilter)">
      {stars.map((star) => (
        <g key={`finished-star-${star.id}`} transform={`translate(${star.x}, ${star.y})`}>
          <motion.path
            d={starPath}
            fill="#F59E0B"
            animate={{
              y: 20 - 170 * bounce,
              opacity: Math.sin(bounce * Math.PI),
              scale: star.scale * Math.sin(bounce * Math.PI),
              rotate: 120 * bounce,
            }}
          />
        </g>
      ))}
    </g>
  );
}

function renderBadge(state, bx, by, bounce = 0) {
  const badgeMap = {
    working: { bg: "#3B82F6", border: "#1D4ED8", type: "dots", shape: "pill" },
    thinking: { bg: "#8B5CF6", border: "#6D28D9", type: "dots", shape: "pill" },
    searching: { bg: "#4F46E5", border: "#3730A3", type: "dots", shape: "pill" },
    approval: { bg: "#FCD34D", border: "#FCD34D", type: "exclamation", shape: "circle" },
    question: { bg: "#06B6D4", border: "#0E7490", type: "question", shape: "circle" },
    rate_limit: { bg: "#EA580C", border: "#C2410C", type: "exclamation", shape: "circle" },
    love: { bg: "#F43F5E", border: "#BE123C", type: "heart", shape: "circle" },
    error: { bg: "#EF4444", border: "#B91C1C", type: "exclamation", shape: "circle" },
    finished: { bg: "#10B981", border: "#047857", type: "check", shape: "circle" },
    proud: { bg: "#10B981", border: "#047857", type: "check", shape: "circle" },
  };

  const badge = badgeMap[state];
  if (!badge) return null;

  if (badge.shape === "circle") {
    return (
      <g
        transform={`translate(${bx - -10}, ${by - 0}) scale(1.2)`}
        filter="url(#dropShadowFilter)"
      >
        <circle cx={14} cy={14} r={14} fill={badge.bg} stroke={badge.border} strokeWidth={0.2} />
        <circle cx={14} cy={14} r={14} fill="url(#badgeGlossSheen)" />

        <text
          x={14}
          y={19}
          fill="#FFFFFF"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {badge.type === "exclamation"
            ? "!"
            : badge.type === "question"
            ? "?"
            : badge.type === "check"
            ? "✓"
            : badge.type === "heart"
            ? "♥"
            : "•"}
        </text>
      </g>
    );
  }

  return (
    <g
      transform={`translate(${bx - -2}, ${by - 0}) scale(1.1)`}
      filter="url(#dropShadowFilter)"
    >
      <rect
        x={0}
        y={0}
        width={52}
        height={28}
        rx={14}
        fill={badge.bg}
        stroke={badge.border}
        strokeWidth={0.2}
      />
      <rect x={0} y={0} width={52} height={28} rx={14} fill="url(#badgeGlossSheen)" />

      <g fill="#FFFFFF">
        <motion.circle
          cx={15}
          cy={14}
          r={4.0}
          animate={{
            opacity: 0.35 + 0.65 * Math.sin(bounce * Math.PI),
            scale: 0.85 + 0.3 * Math.sin(bounce * Math.PI),
          }}
        />
        <motion.circle
          cx={26}
          cy={14}
          r={3.0}
          animate={{
            opacity: 0.35 + 0.65 * Math.sin((bounce + 0.25) * Math.PI),
            scale: 0.85 + 0.3 * Math.sin((bounce + 0.25) * Math.PI),
          }}
        />
        <motion.circle
          cx={37}
          cy={14}
          r={2.0}
          animate={{
            opacity: 0.35 + 0.65 * Math.sin((bounce + 0.5) * Math.PI),
            scale: 0.85 + 0.3 * Math.sin((bounce + 0.5) * Math.PI),
          }}
        />
      </g>
    </g>
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

function renderParticles(state, cx, cy, rx, ry, p = 0) {
  if (state === "sleeping") {
    return (
      <g fill="#A855F7" fontWeight="bold" fontFamily="sans-serif">
        <motion.text
          x={cx + rx * 0.65}
          y={cy - ry * 0.45}
          fontSize="18"
          animate={{ y: -18 * (p % 1), opacity: Math.sin((p % 1) * Math.PI) }}
        >
          Z
        </motion.text>
        <motion.text
          x={cx + rx * 0.82}
          y={cy - ry * 0.65}
          fontSize="14"
          animate={{
            y: -18 * ((p + 0.33) % 1),
            opacity: Math.sin(((p + 0.33) % 1) * Math.PI),
          }}
        >
          z
        </motion.text>
        <motion.text
          x={cx + rx * 0.95}
          y={cy - ry * 0.85}
          fontSize="11"
          animate={{
            y: -18 * ((p + 0.66) % 1),
            opacity: Math.sin(((p + 0.66) % 1) * Math.PI),
          }}
        >
          z
        </motion.text>
      </g>
    );
  }

  return null;
}

export { renderAccessories, renderAccessories as RenderAccessories };
export default MochiMaster;