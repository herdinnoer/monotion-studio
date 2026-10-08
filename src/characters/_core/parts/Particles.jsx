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
// Posisi menempel ke titik tempel karakter (lihat _core/anchors.js):
//   zzz   — `anchor` = titik "zzz" (huruf Z pertama)
//   stars — `anchor` = titik "stars" (pusat sebaran bintang)
// rx/ry (setengah lebar/tinggi badan) dipakai untuk merentangkan sebaran.
const PARTICLE_LAYERS = {
  zzz: "front",
  stars: "back",
};

export function Particles({ type, layer, anchor, rx, ry, p = 0 }) {
  if (!type || PARTICLE_LAYERS[type] !== layer) return null;

  if (type === "zzz") return renderZzz(anchor, rx, ry, p);
  if (type === "stars") return renderStars(anchor, rx, ry, loopBounce(p));
  return null;
}

function renderZzz({ x, y }, rx, ry, p) {
  return (
    <g fill="#A855F7" fontWeight="bold" fontFamily="sans-serif">
      <motion.text
        x={x}
        y={y}
        fontSize="18"
        animate={{ y: -18 * (p % 1), opacity: Math.sin((p % 1) * Math.PI) }}
      >
        Z
      </motion.text>
      <motion.text
        x={x + rx * 0.17}
        y={y - ry * 0.2}
        fontSize="14"
        animate={{
          y: -18 * ((p + 0.33) % 1),
          opacity: Math.sin(((p + 0.33) % 1) * Math.PI),
        }}
      >
        z
      </motion.text>
      <motion.text
        x={x + rx * 0.3}
        y={y - ry * 0.4}
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
function renderStars({ x, y }, rx, ry, bounce) {
  const starPath = "M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z";
  // dx/dy = jarak dari titik tempel, relatif ke ukuran badan
  const stars = [
    { id: 1, dx: -0.69, dy: 0.1, scale: 0.85 },
    { id: 2, dx: -0.37, dy: -0.1, scale: 1.3 },
    { id: 3, dx: 0.18, dy: 0, scale: 0.95 },
    { id: 4, dx: 0.65, dy: 0.1, scale: 1.15 },
    { id: 5, dx: -0.88, dy: 0.3, scale: 0.75 },
    { id: 6, dx: 0.88, dy: 0.3, scale: 0.85 },
    { id: 7, dx: -0.05, dy: -0.2, scale: 1.4 },
  ].map((star) => ({ ...star, x: x + star.dx * rx, y: y + star.dy * ry }));

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
