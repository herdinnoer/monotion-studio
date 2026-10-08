"use client";

import React from "react";

// Pipi merona bersama untuk semua karakter.
//
// Jenis yang tersedia:
//   soft    — rona merah muda lembut (bawaan)
//   hearts  — pipi bentuk hati
//   sparkle — kilau ✨
//   solid   — pipi pink padat, lebih besar (Capybara, dimajukan dari Fase 4)
//   none    — tanpa pipi
//
// Rona "soft" memakai gradient "blushGrad", "hearts" memakai filter
// "dropShadowFilter", keduanya dari <defs> karakter.
// size = { rx, ry } ukuran oval pipi "solid" dalam piksel kanvas; karakter
// mengaturnya lewat anatomy (Capybara: blush). Pipi lain tidak memakainya.

// Warna pipi "solid", diambil dari docs/reference/capybara/ (pipi diterangi dari kiri atas)
const SOLID_BLUSH_STOPS = [
  { offset: "0%", color: "#F7918D" },
  { offset: "55%", color: "#E28081" },
  { offset: "100%", color: "#D25E5F" },
];

export function Blush({ variant = "soft", leftX, rightX, y, size = { rx: 17, ry: 9.5 } }) {
  if (variant === "none") return null;

  if (variant === "solid") {
    // Isinya selalu sama, jadi id gradient aman dipakai bersama oleh semua karakter di halaman
    return (
      <g>
        <defs>
          <radialGradient id="blushSolidGrad" cx="40%" cy="30%" r="75%">
            {SOLID_BLUSH_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </radialGradient>
        </defs>
        <ellipse cx={leftX} cy={y} rx={size.rx} ry={size.ry} fill="url(#blushSolidGrad)" />
        <ellipse cx={rightX} cy={y} rx={size.rx} ry={size.ry} fill="url(#blushSolidGrad)" />
      </g>
    );
  }

  if (variant === "hearts") {
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

  if (variant === "sparkle") {
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

export default Blush;
