"use client";

import React from "react";
import { HAT_REF_WIDTH } from "./hatSize";

// Topi Santa dengan ujung terkulai ke kanan.
// Digambar dengan titik (0, 0) = tengah tepi atas pinggiran topi (titik tempel "hat"),
// lalu diperbesar/diperkecil mengikuti lebar kepala karakter.
// Memakai filter "dropShadowFilter" dari <defs> karakter.
export function SantaHat({ x, y, headWidth }) {
  const scale = headWidth / HAT_REF_WIDTH;
  const brimWidth = 232;
  const brimHeight = 28;
  const domeBaseY = 6;
  const domeTopY = -65;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#dropShadowFilter)">
      <defs>
        <linearGradient id="santaRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="45%" stopColor="#DC2626" />
          <stop offset="85%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <radialGradient id="santaFurGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>
      </defs>

      <ellipse cx={0} cy={brimHeight + 1} rx={brimWidth / 2 - 8} ry={5} fill="#0F172A" opacity={0.24} />

      <path
        d={`M -108 ${domeBaseY}
           C -114 ${domeBaseY - 45}, -70 ${domeTopY}, -10 ${domeTopY}
           C 50 ${domeTopY - 5}, 115 ${domeTopY + 25}, 125 ${domeTopY + 50}
           C 112 ${domeTopY + 25}, 114 ${domeBaseY - 20}, 108 ${domeBaseY}
           Q 0 ${domeBaseY + 4} -108 ${domeBaseY} Z`}
        fill="url(#santaRedGrad)"
        stroke="#7F1D1D"
        strokeWidth={2}
      />

      <path
        d={`M -80 ${domeBaseY - 25} Q -20 ${domeTopY + 15} 40 ${domeTopY + 10}`}
        stroke="#FFFFFF"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.45}
        fill="none"
      />

      <rect
        x={-brimWidth / 2}
        y={0}
        width={brimWidth}
        height={brimHeight}
        rx={14}
        fill="url(#santaFurGrad)"
        stroke="#CBD5E1"
        strokeWidth={1.8}
      />

      <g>
        <circle cx={125} cy={domeTopY + 52} r={18} fill="url(#santaFurGrad)" stroke="#CBD5E1" strokeWidth={1.8} />
        <circle cx={120} cy={domeTopY + 47} r={6} fill="#FFFFFF" opacity={0.85} />
      </g>
    </g>
  );
}

export default SantaHat;
