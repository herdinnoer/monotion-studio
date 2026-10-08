"use client";

import React from "react";
import { motion } from "framer-motion";
import { loopBounce } from "../motions";

// Lencana kecil di pojok kepala, bersama untuk semua karakter.
// Mood cukup menyebut isi (type) dan warnanya (color), contoh:
//   badge: { type: "exclamation", color: "red" }
//
// type:  dots (titik berkedip, bentuk pil) | exclamation | question | check | heart
// color: salah satu kunci di BADGE_COLORS

export const BADGE_COLORS = {
  blue: { bg: "#3B82F6", border: "#1D4ED8" },
  violet: { bg: "#8B5CF6", border: "#6D28D9" },
  indigo: { bg: "#4F46E5", border: "#3730A3" },
  amber: { bg: "#FCD34D", border: "#FCD34D" },
  cyan: { bg: "#06B6D4", border: "#0E7490" },
  orange: { bg: "#EA580C", border: "#C2410C" },
  rose: { bg: "#F43F5E", border: "#BE123C" },
  red: { bg: "#EF4444", border: "#B91C1C" },
  emerald: { bg: "#10B981", border: "#047857" },
};

const BADGE_SYMBOLS = {
  exclamation: "!",
  question: "?",
  check: "✓",
  heart: "♥",
};

// Memakai gradient "badgeGlossSheen" & filter "dropShadowFilter" dari <defs> karakter.
export function Badge({ type, color, x: bx, y: by, p = 0 }) {
  if (!type) return null;

  const { bg, border } = BADGE_COLORS[color] || BADGE_COLORS.blue;
  const bounce = loopBounce(p);

  if (type !== "dots") {
    return (
      <g
        transform={`translate(${bx - -10}, ${by - 0}) scale(1.2)`}
        filter="url(#dropShadowFilter)"
      >
        <circle cx={14} cy={14} r={14} fill={bg} stroke={border} strokeWidth={0.2} />
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
          {BADGE_SYMBOLS[type] ?? "•"}
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
        fill={bg}
        stroke={border}
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

export default Badge;
