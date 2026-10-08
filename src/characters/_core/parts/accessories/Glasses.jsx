"use client";

import React from "react";

// Kacamata bulat emas.
// (x, y) = titik tempel "face" (tengah garis mata). Lensa mengikuti posisi mata,
// gagang kacamata mengikuti lebar kepala.
// Memakai filter "dropShadowFilter" dari <defs> karakter.
export function Glasses({ x, y, eyeOffset, headWidth }) {
  const lensR = 22.5;
  const leftX = x - eyeOffset;
  const rightX = x + eyeOffset;
  const armX = headWidth * 0.36;

  return (
    <g stroke="#78350F" strokeWidth={3} fill="none" filter="url(#dropShadowFilter)">
      <circle cx={leftX} cy={y} r={lensR} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
      <circle cx={rightX} cy={y} r={lensR} fill="#FFFFFF" fillOpacity={0.2} stroke="#CA8A04" />
      <path
        d={`M ${leftX - 12} ${y - 12} Q ${leftX} ${y - 18} ${leftX + 12} ${y - 12}`}
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d={`M ${rightX - 12} ${y - 12} Q ${rightX} ${y - 18} ${rightX + 12} ${y - 12}`}
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path d={`M ${x - 22} ${y - 4} Q ${x} ${y - 10} ${x + 22} ${y - 4}`} stroke="#A16207" />
      <line x1={leftX - lensR} y1={y} x2={x - armX} y2={y - 2} stroke="#A16207" />
      <line x1={rightX + lensR} y1={y} x2={x + armX} y2={y - 2} stroke="#A16207" />
    </g>
  );
}

export default Glasses;
