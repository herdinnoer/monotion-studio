"use client";

import React from "react";
import { motion } from "framer-motion";
import { loopBounce } from "../motions";

// Partikel efek di sekitar karakter, bersama untuk semua karakter.
//
// Jenis yang tersedia:
//   zzz   — huruf Z melayang (tidur), digambar DI DEPAN badan
//   stars — bintang terbang ke atas (selesai), digambar DI BELAKANG badan
//
// Karakter memanggil <Particles> dua kali: sekali dengan layer="back" sebelum badan,
// sekali dengan layer="front" setelah badan. Tiap jenis hanya muncul di lapisannya.
//
// Posisi masih dihitung dari ukuran badan (cx, cy, rx, ry). Nanti di B15 pindah
// ke titik tempel (anchors) milik tiap karakter.
const PARTICLE_LAYERS = {
  zzz: "front",
  stars: "back",
};

export function Particles({ type, layer, cx, cy, rx, ry, p = 0 }) {
  if (!type || PARTICLE_LAYERS[type] !== layer) return null;

  if (type === "zzz") return renderZzz(cx, cy, rx, ry, p);
  if (type === "stars") return renderStars(cx, cy, ry, loopBounce(p));
  return null;
}

function renderZzz(cx, cy, rx, ry, p) {
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

// Memakai filter "dropShadowFilter" dari <defs> karakter.
function renderStars(cx, cy, ry, bounce) {
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

export default Particles;
