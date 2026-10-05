"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useSpring } from "framer-motion";

/**
 * Superellipse generator: |x/rx|^n + |y/ry|^n = 1
 * Parametric:
 *   x = cx + rx * sgn(cos t) * |cos t|^(2/n)
 *   y = cy + ry * sgn(sin t) * |sin t|^(2/n)
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

// 3D Color theme mapping per state for Claymorphic rendering
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
  party_hat: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  crown: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  witch_hat: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
  sunglasses: { gradId: "mochi3dGrad", stroke: "#CBD5E1", glow: null },
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

  // Smooth mouse tracking spring physics (stiffness: 140, damping: 16)
  const eyeTrackX = useSpring(0, { stiffness: 140, damping: 16 });
  const eyeTrackY = useSpring(0, { stiffness: 140, damping: 16 });

  // Geometry configuration constants based on specs
  const cx = 200;
  const cy = 205;
  const R = 95;
  const rx = 1.14 * R; // 108.3
  const ry = 0.88 * R; // 83.6

  // Specular coordinates: cx + 0.34*rx, cy - 0.46*ry, r = 0.42*R
  const specX = cx + 0.34 * rx;
  const specY = cy - 0.46 * ry;
  const specR = 0.42 * R;

  // Badge Top-Left corner coordinates: cx - 0.88*rx, cy - 1.12*ry
  const badgeX = cx - 0.78 * rx;
  const badgeY = cy - 1.0 * ry;

  // Eyes base position: Yaw ±0.37*rx, Pitch -0.02*ry (positioned higher up & naturally scaled)
  const eyeLeftX = cx - 0.37 * rx;
  const eyeRightX = cx + 0.37 * rx;
  const eyeBaseY = cy - 0.02 * ry;

  // Blush coordinates: ±0.52*rx, +0.24*ry
  const blushLeftX = cx - 0.52 * rx;
  const blushRightX = cx + 0.52 * rx;
  const blushY = cy + 0.24 * ry;

  // Generate body superellipse SVG path
  const bodyPath = useMemo(() => {
    return generateSuperellipsePath(cx, cy, rx, ry, shapePreset);
  }, [cx, cy, rx, ry, shapePreset]);

  // Color theme
  const currentTheme = STATE_THEMES[state] || STATE_THEMES.idle;
  const gradId = color ? `customBodyGrad` : currentTheme.gradId;
  const strokeColor = currentTheme.stroke;
  const outerGlowFilter = currentTheme.glow;

  // Auto-Blink timer (every 2.5 - 5 seconds)
  useEffect(() => {
    if (!enableBlink) return;
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
  }, [enableBlink]);

  // Mouse Tracking listener
  useEffect(() => {
    if (!enableTracking) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Clamp max eye movement to stay realistically inside eye sockets
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

  // Is dancing state?
  const isDancing = state === "dancing";

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center select-none relative ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
    >
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        animate={
          isDancing
            ? {
                y: [0, -12, 0],
                rotate: [-6, 6, -6],
                scaleX: [1, 0.96, 1],
                scaleY: [1, 1.05, 1],
              }
            : {
                y: [0, -6, 0],
                scale: [1, 1.012, 1],
              }
        }
        transition={
          isDancing
            ? {
                repeat: Infinity,
                duration: 0.8,
                ease: "easeInOut",
              }
            : {
                repeat: Infinity,
                duration: 3.6,
                ease: "easeInOut",
              }
        }
      >
        <defs>
          {/* ========================================================= */}
          {/* 1. SOFT 3D / CLAYMORPHISM BODY RADIAL GRADIENTS */}
          {/* ========================================================= */}
          {/* Default Mochi White 3D Clay */}
          <radialGradient id="mochi3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F8FAFC" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          {/* Working (Sky Blue 3D Clay) */}
          <radialGradient id="working3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E0F2FE" />
            <stop offset="80%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#93C5FD" />
          </radialGradient>

          {/* Thinking (Lilac / Lavender 3D Clay) */}
          <radialGradient id="thinking3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F3E8FF" />
            <stop offset="80%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </radialGradient>

          {/* Searching (Slate Indigo 3D Clay) */}
          <radialGradient id="searching3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#EEF2FF" />
            <stop offset="80%" stopColor="#C7D2FE" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </radialGradient>

          {/* Approval (Warm Cream Honey 3D Clay) */}
          <radialGradient id="approval3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF3C7" />
            <stop offset="80%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FCD34D" />
          </radialGradient>

          {/* Question (Cyan / Aqua 3D Clay) */}
          <radialGradient id="question3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E0F7FA" />
            <stop offset="80%" stopColor="#B2EBF2" />
            <stop offset="100%" stopColor="#80DEEA" />
          </radialGradient>

          {/* Error (Soft Coral Red 3D Clay) */}
          <radialGradient id="error3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFE4E6" />
            <stop offset="80%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </radialGradient>

          {/* Finished (Mint Jade 3D Clay) */}
          <radialGradient id="finished3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#ECFDF5" />
            <stop offset="80%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </radialGradient>

          {/* Rate Limit (Peach Amber 3D Clay) */}
          <radialGradient id="ratelimit3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFEDD5" />
            <stop offset="80%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </radialGradient>

          {/* Sleeping (Pastel Violet 3D Clay) */}
          <radialGradient id="sleeping3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FAF5FF" />
            <stop offset="80%" stopColor="#E9D5FF" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </radialGradient>

          {/* Dizzy (Bubblegum Pink 3D Clay) */}
          <radialGradient id="dizzy3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FCE7F3" />
            <stop offset="80%" stopColor="#FBCFE8" />
            <stop offset="100%" stopColor="#F472B6" />
          </radialGradient>

          {/* Greeting (Sunny Soft 3D Clay) */}
          <radialGradient id="greeting3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF9C3" />
            <stop offset="80%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FACC15" />
          </radialGradient>

          {/* Love (Pastel Sky / Heart Tint 3D Clay) */}
          <radialGradient id="love3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F0F9FF" />
            <stop offset="80%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </radialGradient>

          {/* Proud (Jade Mint 3D Clay) */}
          <radialGradient id="proud3dGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#ECFDF5" />
            <stop offset="80%" stopColor="#D1FAE5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>

          {/* Custom Color Body Fallback Gradient */}
          {color && (
            <radialGradient id="customBodyGrad" cx="36%" cy="28%" r="72%" fx="34%" fy="24%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          )}

          {/* ========================================================= */}
          {/* 2. ACCESSORIES & 3D OBJECT GRADIENTS */}
          {/* ========================================================= */}
          {/* Santa Hat Red Gradient */}
          <linearGradient id="santaRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D4D" />
            <stop offset="45%" stopColor="#DC2626" />
            <stop offset="85%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          {/* Beanie Knit Blue Gradient */}
          <linearGradient id="beanieBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="40%" stopColor="#3B82F6" />
            <stop offset="85%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Beanie Brim Gradient */}
          <linearGradient id="beanieBrimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          {/* Crown Gold Metallic Gradient */}
          <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Witch Hat Purple Gradient */}
          <linearGradient id="witchPurpleGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="40%" stopColor="#9333EA" />
            <stop offset="80%" stopColor="#6B21A8" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          {/* Party Hat Pink Gradient */}
          <linearGradient id="partyPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="45%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>

          {/* Fluffy White Trim & Pom-pom Radial Gradient */}
          <radialGradient id="furWhiteGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          {/* Gold Buckle / Ribbon Gradient */}
          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          {/* Sunglasses Deep Glossy Gradient */}
          <linearGradient id="sunglassesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3F3F46" />
            <stop offset="40%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          {/* 3D Badge Gloss Sheen Gradient */}
          <linearGradient id="badgeGlossSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>

          {/* Specular Highlight Gradient */}
          <radialGradient id="specularGrad" cx="42%" cy="40%" r="56%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Blush Gradient */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#FFA0B4" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFA0B4" stopOpacity="0" />
          </radialGradient>

          {/* Eye Gloss Radial Gradient with bottom rim reflection */}
          <radialGradient id="eyeGloss" cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#4A4A4F" stopOpacity={1} />
            <stop offset="45%" stopColor="#1E1E22" stopOpacity={1} />
            <stop offset="85%" stopColor="#0B0B0E" stopOpacity={1} />
            <stop offset="100%" stopColor="#1F2028" stopOpacity={1} />
          </radialGradient>

          {/* ========================================================= */}
          {/* 3. FILTERS (feDropShadow & GLOWS) */}
          {/* ========================================================= */}
          {/* Eye Catchlight Soft Blur & Bloom Filter (Soft 3D Reflection, Non-Flat) */}
          <filter id="eyeHighlightBloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="glow" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="softCore" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="softCore" />
            </feMerge>
          </filter>

          {/* Required feDropShadow filter (dx=0, dy=4, stdDeviation=4, opacity=0.35) for accessories */}
          <filter id="dropShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity={0.35} />
          </filter>

          {/* Subtle Clay Occlusion Shadow */}
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

          {/* Outer Glow Filters */}
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

          {/* Soft Ground Contact Shadow */}
          <filter id="groundShadowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>

        {/* 1. Ground Contact Shadow */}
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

        {/* 2. Outer Glow Layer for Finished / Love / Error */}
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

        {/* 3. Main Body Superellipse with Soft 3D Claymorphic Shading */}
        <path
          d={bodyPath}
          fill={`url(#${gradId})`}
          stroke={strokeColor}
          strokeWidth={0.1}
        />

        {/* 4. 3D Specular Highlight: (cx + 0.34*rx, cy - 0.46*ry), r = 0.42*R, angle = -18deg */}
        <g transform={`rotate(-18, ${specX}, ${specY})`}>
          <ellipse
            cx={specX}
            cy={specY}
            rx={specR * 0.98}
            ry={specR * 0.54}
            fill="url(#specularGrad)"
            style={{ pointerEvents: "none" }}
          />
        </g>

        {/* 5. Blush Tint Layer: ±0.52*rx, +0.24*ry */}
        {renderBlush(state, blushLeftX, blushRightX, blushY)}

        {/* 6. Eyes System (Spherical, Tracking, Blink, Large & Expressive) */}
        {renderEyes({
          state,
          leftX: eyeLeftX,
          rightX: eyeRightX,
          baseY: eyeBaseY,
          isBlinking,
          eyeTrackX,
          eyeTrackY,
        })}

        {/* 7. Accessories Overlays with url(#dropShadowFilter) and 3D Gradients */}
        {renderAccessories({ state, cx, cy, rx, ry, R, eyeBaseY })}

        {/* 8. Badge Top-Left: cx - 0.72*R, cy - 0.72*R with 3D Depth */}
        {renderBadge(state, badgeX, badgeY)}

        {/* 9. Floating Particle Effects (Twinkling Stars, Zzz, Greeting Wave) */}
        {renderParticles(state, cx, cy, rx, ry)}
      </motion.svg>
    </div>
  );
}

// ==========================================
// RENDER BLUSH
// ==========================================
function renderBlush(state, leftX, rightX, y) {
  if (state === "sleeping" || state === "annoyed") return null;

  if (state === "love") {
    // Heart blush
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
    // Star sparkles on cheeks
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

// ==========================================
// RENDER EYES SYSTEM
// ==========================================
function renderEyes({
  state,
  leftX,
  rightX,
  baseY,
  isBlinking,
  eyeTrackX,
  eyeTrackY,
}) {
  // If blinking, eyes scale down vertically to thin line
  if (isBlinking && !["sleeping", "wink", "finished", "dancing"].includes(state)) {
    return (
      <g stroke="#18181B" strokeWidth={6.8} strokeLinecap="round">
        <line x1={leftX - 13} y1={baseY} x2={leftX + 13} y2={baseY} />
        <line x1={rightX - 13} y1={baseY} x2={rightX + 13} y2={baseY} />
      </g>
    );
  }

  // 1. Happy closed curved eyes: ^ ^
  if (["finished", "dancing", "proud"].includes(state)) {
    return (
      <g stroke="#111827" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY + 5} Q ${leftX} ${baseY - 9} ${leftX + 14} ${baseY + 5}`} />
        <path d={`M ${rightX - 14} ${baseY + 5} Q ${rightX} ${baseY - 9} ${rightX + 14} ${baseY + 5}`} />
      </g>
    );
  }

  // 2. Sleeping relaxed eyes: u u
  if (state === "sleeping") {
    return (
      <g stroke="#1F2937" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY - 3} Q ${leftX} ${baseY + 11} ${leftX + 14} ${baseY - 3}`} />
        <path d={`M ${rightX - 14} ${baseY - 3} Q ${rightX} ${baseY + 11} ${rightX + 14} ${baseY - 3}`} />
      </g>
    );
  }

  // 3. Dizzy spiral eyes
  if (state === "dizzy") {
    return (
      <g stroke="#4338CA" strokeWidth={3.8} fill="none">
        <motion.circle
          cx={leftX}
          cy={baseY}
          r={14.5}
          strokeDasharray="5 3.5"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          style={{ transformOrigin: `${leftX}px ${baseY}px` }}
        />
        <motion.circle
          cx={rightX}
          cy={baseY}
          r={14.5}
          strokeDasharray="5 3.5"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          style={{ transformOrigin: `${rightX}px ${baseY}px` }}
        />
        <circle cx={leftX} cy={baseY} r={4.5} fill="#4338CA" />
        <circle cx={rightX} cy={baseY} r={4.5} fill="#4338CA" />
      </g>
    );
  }

  // 4. Wink: Left eye closed curve, Right eye round glossy
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
          {/* Primary Catchlight (Soft Blurred / Bloom) */}
          <circle
            cx={rightX - 4.8}
            cy={baseY - 4.8}
            r={5.2}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          {/* Secondary Catchlight (Soft Blurred) */}
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

  // 5. Yawn: Squint eyes > < and small round open yawn mouth
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

  // 6. Annoyed / Error: Flat squint bar eyes
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

  // 7. Surprised: Wide round eyes & open circular mouth
  if (state === "surprised") {
    return (
      <g>
        <circle cx={leftX} cy={baseY} r={18.5} fill="#FFFFFF" stroke="#18181B" strokeWidth={3.2} />
        <motion.circle
          cx={leftX}
          cy={baseY}
          r={8.5}
          fill="#18181B"
          style={{ x: eyeTrackX, y: eyeTrackY }}
        />
        <circle cx={rightX} cy={baseY} r={18.5} fill="#FFFFFF" stroke="#18181B" strokeWidth={3.2} />
        <motion.circle
          cx={rightX}
          cy={baseY}
          r={8.5}
          fill="#18181B"
          style={{ x: eyeTrackX, y: eyeTrackY }}
        />
        <circle cx={(leftX + rightX) / 2} cy={baseY + 18} r={8.5} fill="#18181B" />
      </g>
    );
  }

  // 8. Love: Heart in reflection
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

  // Default: Large spherical 3D eyes with Mouse Tracking and Soft Blurred Catchlights
  return (
    <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
      {/* Left Eye */}
      <circle cx={leftX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      {/* Primary Catchlight (Soft Blurred / Bloom) */}
      <circle
        cx={leftX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      {/* Secondary Catchlight (Soft Blurred) */}
      <circle
        cx={leftX + 4.2}
        cy={baseY + 4.2}
        r={2.4}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />

      {/* Right Eye */}
      <circle cx={rightX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      {/* Primary Catchlight (Soft Blurred / Bloom) */}
      <circle
        cx={rightX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      {/* Secondary Catchlight (Soft Blurred) */}
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

// ==========================================
// ==========================================
// RENDER BADGE TOP-LEFT CORNER WITH 3D DEPTH
// ==========================================
function renderBadge(state, bx, by) {
  const badgeMap = {
    working: { bg: "#3B82F6", border: "#1D4ED8", type: "dots", shape: "pill" },
    thinking: { bg: "#8B5CF6", border: "#6D28D9", type: "dots", shape: "pill" },
    searching: { bg: "#4F46E5", border: "#3730A3", type: "dots", shape: "pill" },
    approval: { bg: "#10B981", border: "#047857", type: "check", shape: "circle" },
    question: { bg: "#06B6D4", border: "#0E7490", type: "question", shape: "circle" },
    rate_limit: { bg: "#EA580C", border: "#C2410C", type: "exclamation", shape: "circle" },
    love: { bg: "#F43F5E", border: "#BE123C", type: "heart", shape: "circle" },
    error: { bg: "#EF4444", border: "#B91C1C", type: "exclamation", shape: "circle" },
    finished: { bg: "#10B981", border: "#047857", type: "check", shape: "circle" },
    proud: { bg: "#10B981", border: "#047857", type: "check", shape: "circle" },
  };

  const badge = badgeMap[state];
  if (!badge) return null;

  // Circle badges (approval, question, error, finished, proud, rate_limit, love) - Enlarged
  if (badge.shape === "circle") {
    return (
      <g transform={`translate(${bx - 2}, ${by - 4})`} filter="url(#dropShadowFilter)">
        <circle cx={14} cy={14} r={14} fill={badge.bg} stroke={badge.border} strokeWidth={1.5} />
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

  // Pill badges (working, thinking, searching) - Enlarged
  return (
    <g transform={`translate(${bx - 4}, ${by - 4})`} filter="url(#dropShadowFilter)">
      {/* 3D Pill Base */}
      <rect
        x={0}
        y={0}
        width={52}
        height={28}
        rx={14}
        fill={badge.bg}
        stroke={badge.border}
        strokeWidth={1.2}
      />
      {/* 3D Gloss Sheen */}
      <rect x={0} y={0} width={52} height={28} rx={14} fill="url(#badgeGlossSheen)" />

      {/* 3 Animated / Glowing Dots (Progressive sizes) */}
      <g fill="#FFFFFF">
        <circle cx={15} cy={14} r={4.0} />
        <circle cx={26} cy={14} r={3.0} />
        <circle cx={37} cy={14} r={2.0} />
      </g>
    </g>
  );
}

// ==========================================
// RENDER ACCESSORIES OVERLAYS WITH SOFT 3D SHADING
// ==========================================
function renderAccessories({ state, cx, cy, rx, ry, R, eyeBaseY }) {
  // 1. Precise top point of Mochi's head
  const topY = cy - ry;
  // 2. Precise eye center: Yaw ±0.37*rx, Pitch -0.02*ry
  const eyeY = eyeBaseY ?? (cy - 0.02 * ry);

  switch (state) {
    case "beanie": {
      const eyeLevelY = eyeBaseY ?? (cy - 0.02 * ry);
      const brimWidth = 232;
      const brimHeight = 24;
      const brimX = cx - brimWidth / 2;
      // Position bottom of brim level with the eyes
      const brimY = eyeLevelY - 29;
      const domeBaseY = brimY + 4;
      const domeTopY = cy - ry - 8;

      return (
        <g filter="url(#dropShadowFilter)">
          {/* 1. Soft Shadow Cast Under Brim onto Forehead */}
          <ellipse
            cx={cx}
            cy={brimY + brimHeight + 1}
            rx={brimWidth / 2 - 8}
            ry={5}
            fill="#0F172A"
            opacity={0.24}
          />

          {/* 2. Beanie Main Knit Dome (covering entire top of head) */}
          <path
            d={`M ${cx - 108} ${domeBaseY} 
               C ${cx - 114} ${domeBaseY - 42}, ${cx - 82} ${domeTopY}, ${cx} ${domeTopY} 
               C ${cx + 82} ${domeTopY}, ${cx + 114} ${domeBaseY - 42}, ${cx + 108} ${domeBaseY} 
               Q ${cx} ${domeBaseY + 4} ${cx - 108} ${domeBaseY} Z`}
            fill="url(#beanieBlueGrad)"
            stroke="#1E3A8A"
            strokeWidth={2}
          />

          {/* 3. Beanie Knit Ribbed Curved Stripes on Dome */}
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

          {/* 4. Folded Knit Brim (Cuff) Covering Forehead & Framing Eyes */}
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

          {/* Brim Vertical Knit Stitches */}
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

          {/* 5. Fluffy White Pom-Pom on Top Apex with 3D Volume */}
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

    case "santa_hat":
      return (
        <g transform={`rotate(-5, ${cx}, ${topY})`} filter="url(#dropShadowFilter)">
          {/* Red Santa Hat Cone with 3D Shading (#FF3B30 -> #B91C1C) */}
          <path
            d={`M ${cx - 56} ${topY - 6} 
               Q ${cx - 15} ${topY - 68} ${cx + 74} ${topY - 32} 
               Q ${cx + 40} ${topY - 46} ${cx + 56} ${topY - 6} 
               Q ${cx} ${topY - 18} ${cx - 56} ${topY - 6} Z`}
            fill="url(#santaRedGrad)"
            stroke="#7F1D1D"
            strokeWidth={1.5}
          />
          {/* Specular White Sheen across Santa hat peak */}
          <path
            d={`M ${cx - 25} ${topY - 36} Q ${cx + 10} ${topY - 54} ${cx + 50} ${topY - 38}`}
            stroke="#FFFFFF"
            strokeWidth={4.5}
            strokeLinecap="round"
            opacity={0.5}
            fill="none"
          />
          {/* Fluffy White Trim with 3D Radial Shading */}
          <path
            d={`M ${cx - 64} ${topY + 12} 
               Q ${cx} ${topY + 2} ${cx + 64} ${topY + 12} 
               L ${cx + 64} ${topY - 8} 
               Q ${cx} ${topY - 18} ${cx - 64} ${topY - 8} Z`}
            fill="url(#furWhiteGrad)"
            stroke="#CBD5E1"
            strokeWidth={1.5}
          />
          {/* White Pom-pom hanging off the tip with 3D Depth */}
          <circle
            cx={cx + 76}
            cy={topY - 30}
            r={14}
            fill="url(#furWhiteGrad)"
            stroke="#CBD5E1"
            strokeWidth={1.5}
          />
        </g>
      );

    case "party_hat":
      return (
        <g transform={`rotate(-5, ${cx}, ${topY})`} filter="url(#dropShadowFilter)">
          {/* Striped Party Cone with partyPinkGrad */}
          <path
            d={`M ${cx - 36} ${topY + 6} 
               L ${cx} ${topY - 82} 
               L ${cx + 36} ${topY + 6} 
               Q ${cx} ${topY - 4} ${cx - 36} ${topY + 6} Z`}
            fill="url(#partyPinkGrad)"
            stroke="#831843"
            strokeWidth={1.5}
          />
          {/* Polkadot / Chevron 3D Gold Accents */}
          <circle cx={cx - 10} cy={topY - 26} r={4.5} fill="#FEF08A" stroke="#CA8A04" strokeWidth={1} />
          <circle cx={cx + 10} cy={topY - 36} r={4.5} fill="#FEF08A" stroke="#CA8A04" strokeWidth={1} />
          <circle cx={cx} cy={topY - 54} r={3.8} fill="#FEF08A" stroke="#CA8A04" strokeWidth={1} />
          {/* Pom-pom on Tip */}
          <circle cx={cx} cy={topY - 84} r={8.5} fill="#FBBF24" stroke="#D97706" strokeWidth={1.5} />
        </g>
      );

    case "crown":
      return (
        <g transform={`rotate(-5, ${cx}, ${topY})`} filter="url(#dropShadowFilter)">
          {/* Regal Golden Crown with crownGoldGrad Metallic Depth */}
          <path
            d={`M ${cx - 46} ${topY + 6} 
               L ${cx - 52} ${topY - 36} 
               L ${cx - 22} ${topY - 18} 
               L ${cx} ${topY - 48} 
               L ${cx + 22} ${topY - 18} 
               L ${cx + 52} ${topY - 36} 
               L ${cx + 46} ${topY + 6} 
               Q ${cx} ${topY - 3} ${cx - 46} ${topY + 6} Z`}
            fill="url(#crownGoldGrad)"
            stroke="#78350F"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Specular White Gloss Glare on Central Spire */}
          <line
            x1={cx}
            y1={topY - 44}
            x2={cx}
            y2={topY - 22}
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.75}
          />
          {/* Glowing Crown Jewels */}
          <circle cx={cx} cy={topY - 48} r={5} fill="#EF4444" stroke="#7F1D1D" strokeWidth={1.2} />
          <circle cx={cx - 52} cy={topY - 36} r={4.5} fill="#3B82F6" stroke="#1E3A8A" strokeWidth={1.2} />
          <circle cx={cx + 52} cy={topY - 36} r={4.5} fill="#3B82F6" stroke="#1E3A8A" strokeWidth={1.2} />
          <circle cx={cx} cy={topY - 8} r={4.2} fill="#10B981" stroke="#064E3B" strokeWidth={1.2} />
        </g>
      );

    case "witch_hat":
      return (
        <g transform={`rotate(-5, ${cx}, ${topY})`} filter="url(#dropShadowFilter)">
          {/* Wide Curved Brim following perspective with witchPurpleGrad */}
          <ellipse
            cx={cx}
            cy={topY + 6}
            rx={rx * 0.96}
            ry={15}
            fill="url(#witchPurpleGrad)"
            stroke="#3B0764"
            strokeWidth={1.8}
          />
          {/* Pointy Crooked Witch Cone */}
          <path
            d={`M ${cx - 44} ${topY + 4} 
               Q ${cx - 6} ${topY - 50} ${cx + 34} ${topY - 80} 
               Q ${cx + 12} ${topY - 42} ${cx + 44} ${topY + 4} Z`}
            fill="url(#witchPurpleGrad)"
            stroke="#3B0764"
            strokeWidth={1.8}
          />
          {/* Gold Buckle Ribbon Band with goldRibbonGrad */}
          <rect
            x={cx - 36}
            y={topY - 6}
            width={72}
            height={12}
            rx={2}
            fill="url(#goldRibbonGrad)"
            stroke="#78350F"
            strokeWidth={1.5}
          />
          <rect
            x={cx - 8}
            y={topY - 8}
            width={16}
            height={16}
            rx={3}
            fill="none"
            stroke="#FEF08A"
            strokeWidth={2.4}
          />
        </g>
      );

    case "sunglasses":
      return (
        <g filter="url(#dropShadowFilter)">
          {/* Glossy Black Sunglasses Frame & Lenses */}
          <path
            d={`M ${cx - rx * 0.7} ${eyeY - 17} 
               L ${cx + rx * 0.7} ${eyeY - 17} 
               C ${cx + rx * 0.67} ${eyeY + 20}, ${cx + 12} ${eyeY + 22}, ${cx + 8} ${eyeY} 
               L ${cx - 8} ${eyeY} 
               C ${cx - 12} ${eyeY + 22}, ${cx - rx * 0.67} ${eyeY + 20}, ${cx - rx * 0.7} ${eyeY - 17} Z`}
            fill="url(#sunglassesGrad)"
            stroke="#09090B"
            strokeWidth={2.5}
          />
          {/* White Gloss Streaks across lenses (Claymorphic Reflected Light) */}
          <line
            x1={cx - 52}
            y1={eyeY - 10}
            x2={cx - 30}
            y2={eyeY + 10}
            stroke="#FFFFFF"
            strokeWidth={2.8}
            opacity={0.75}
            strokeLinecap="round"
          />
          <line
            x1={cx + 30}
            y1={eyeY - 10}
            x2={cx + 52}
            y2={eyeY + 10}
            stroke="#FFFFFF"
            strokeWidth={2.8}
            opacity={0.75}
            strokeLinecap="round"
          />
        </g>
      );

    case "glasses":
      return (
        <g stroke="#78350F" strokeWidth={3} fill="none" filter="url(#dropShadowFilter)">
          {/* Left Round Wireframe Lens */}
          <circle cx={cx - 0.37 * rx} cy={eyeY} r={22.5} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
          {/* Right Round Wireframe Lens */}
          <circle cx={cx + 0.37 * rx} cy={eyeY} r={22.5} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
          {/* Specular curved glint on lenses */}
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
          {/* Center Bridge */}
          <path d={`M ${cx - 22} ${eyeY - 4} Q ${cx} ${eyeY - 10} ${cx + 22} ${eyeY - 4}`} stroke="#A16207" />
          {/* Outer Frame Arms */}
          <line x1={cx - 0.37 * rx - 22.5} y1={eyeY} x2={cx - rx * 0.72} y2={eyeY - 2} stroke="#A16207" />
          <line x1={cx + 0.37 * rx + 22.5} y1={eyeY} x2={cx + rx * 0.72} y2={eyeY - 2} stroke="#A16207" />
        </g>
      );

    default:
      return null;
  }
}

// ==========================================
// RENDER PARTICLES (Stars, Zzz, Hearts)
// ==========================================
function renderParticles(state, cx, cy, rx, ry) {
  // 1. Finished: Twinkling Stars ✨
  if (state === "finished") {
    return (
      <g>
        <motion.text
          x={cx + rx * 0.72}
          y={cy - ry * 0.85}
          fontSize="22"
          textAnchor="middle"
          animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          ✨
        </motion.text>
        <motion.text
          x={cx + rx * 0.95}
          y={cy - ry * 0.5}
          fontSize="16"
          textAnchor="middle"
          animate={{ scale: [1.1, 0.7, 1.1], opacity: [0.5, 0.95, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: 0.3, ease: "easeInOut" }}
        >
          ✨
        </motion.text>
      </g>
    );
  }

  // 2. Sleeping: Drifting "Z z z"
  if (state === "sleeping") {
    return (
      <g fill="#A855F7" fontWeight="bold" fontFamily="sans-serif">
        <motion.text
          x={cx + rx * 0.65}
          y={cy - ry * 0.45}
          fontSize="18"
          animate={{ y: [0, -18], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
        >
          Z
        </motion.text>
        <motion.text
          x={cx + rx * 0.82}
          y={cy - ry * 0.65}
          fontSize="14"
          animate={{ y: [0, -18], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: 0.8, ease: "easeOut" }}
        >
          z
        </motion.text>
        <motion.text
          x={cx + rx * 0.95}
          y={cy - ry * 0.85}
          fontSize="11"
          animate={{ y: [0, -18], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: 1.5, ease: "easeOut" }}
        >
          z
        </motion.text>
      </g>
    );
  }

  // 3. Greeting: Friendly waving sparkle
  if (state === "greeting") {
    return (
      <motion.text
        x={cx + rx * 0.82}
        y={cy - ry * 0.35}
        fontSize="24"
        animate={{ rotate: [-10, 15, -10] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{ transformOrigin: `${cx + rx * 0.82}px ${cy - ry * 0.35}px` }}
      >
        👋
      </motion.text>
    );
  }

  return null;
}

export { renderAccessories, renderAccessories as RenderAccessories };
export default MochiMaster;
