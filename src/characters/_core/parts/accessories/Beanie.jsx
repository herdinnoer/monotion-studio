"use client";

import React from "react";
import { HAT_REF_WIDTH } from "./hatSize";

// Kupluk biru dengan pompom.
// Digambar dengan titik (0, 0) = tengah tepi atas pinggiran topi (titik tempel "hat"),
// lalu diperbesar/diperkecil mengikuti lebar kepala karakter.
// Memakai filter "dropShadowFilter" dari <defs> karakter.
export function Beanie({ x, y, headWidth }) {
  const scale = headWidth / HAT_REF_WIDTH;
  const brimWidth = 232;
  const brimHeight = 24;
  const brimX = -brimWidth / 2;
  const domeBaseY = 4;
  const domeTopY = -61;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#dropShadowFilter)">
      <defs>
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
        <radialGradient id="beanieFurGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>
      </defs>

      <ellipse cx={0} cy={brimHeight + 1} rx={brimWidth / 2 - 8} ry={5} fill="#0F172A" opacity={0.24} />

      <path
        d={`M -108 ${domeBaseY}
           C -114 ${domeBaseY - 42}, -82 ${domeTopY}, 0 ${domeTopY}
           C 82 ${domeTopY}, 114 ${domeBaseY - 42}, 108 ${domeBaseY}
           Q 0 ${domeBaseY + 4} -108 ${domeBaseY} Z`}
        fill="url(#beanieBlueGrad)"
        stroke="#1E3A8A"
        strokeWidth={2}
      />

      <g fill="none" stroke="#93C5FD" strokeWidth={2} opacity={0.55}>
        <line x1={0} y1={domeTopY} x2={0} y2={domeBaseY} />
        <path d={`M -8 ${domeTopY + 1} Q -20 -29 -26 ${domeBaseY}`} />
        <path d={`M -16 ${domeTopY + 3} Q -42 -28 -52 ${domeBaseY}`} />
        <path d={`M -24 ${domeTopY + 7} Q -68 -25 -78 ${domeBaseY}`} />
        <path d={`M -32 ${domeTopY + 13} Q -92 -21 -102 ${domeBaseY}`} />
        <path d={`M 8 ${domeTopY + 1} Q 20 -29 22 ${domeBaseY}`} />
        <path d={`M 16 ${domeTopY + 3} Q 42 -28 52 ${domeBaseY}`} />
        <path d={`M 24 ${domeTopY + 7} Q 68 -25 78 ${domeBaseY}`} />
        <path d={`M 32 ${domeTopY + 13} Q 92 -21 102 ${domeBaseY}`} />
      </g>

      <rect
        x={brimX}
        y={0}
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
          return <line key={`brim-rib-${i}`} x1={xPos} y1={3} x2={xPos} y2={brimHeight - 3} />;
        })}
      </g>

      <g>
        <circle cx={-12} cy={domeTopY - 16} r={10} fill="#F8FAFC" />
        <circle cx={12} cy={domeTopY - 16} r={10} fill="#F8FAFC" />
        <circle cx={0} cy={domeTopY - 26} r={10} fill="#F8FAFC" />
        <circle cx={-8} cy={domeTopY - 24} r={10} fill="#F8FAFC" />
        <circle cx={8} cy={domeTopY - 24} r={10} fill="#F8FAFC" />
        <circle cx={0} cy={domeTopY - 18} r={19} fill="url(#beanieFurGrad)" stroke="#CBD5E1" strokeWidth={1.8} />
        <circle cx={-5} cy={domeTopY - 23} r={6} fill="#FFFFFF" opacity={0.85} />
      </g>
    </g>
  );
}

export default Beanie;
