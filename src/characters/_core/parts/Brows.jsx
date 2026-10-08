"use client";

import React from "react";
import { deriveColor } from "../derivedColor";

// Alis & kerutan dahi bersama untuk semua karakter (laci alis). Karakter cukup memilih
// jenisnya (variant), bentuk & warnanya diatur di sini supaya style semua karakter sama.
//
// Jenis yang tersedia:
//   angry — kerutan dahi miring di atas sudut dalam mata: kesal (Capybara annoyed)
//   none  — tanpa alis (bawaan)
//
// Di referensi Capybara tidak ada garis alis terpisah: kelopak atas tebal mata `heavy`
// sudah berperan sebagai alis. Yang tampil di dahi hanya kerutan (alur gelap + tepi
// terang di sisi atasnya). Referensi proud tidak punya alis maupun kerutan, jadi jenis
// `smug` tidak dibuat (lihat catatan B18.5 di docs/fase-1-sistem-karakter.md).
//
// Posisi & ukuran sama dengan mata:
//   leftX, rightX, y — tengah mata kiri & kanan
//   size  — jari-jari mata besar (anatomy.eyeSize × rx)
// Semua angka di BROWS dikali size. "Dalam" = ke arah hidung (dicerminkan otomatis).
//
// Warna kerutan = turunan warna dasar (seperti moncong), jadi ikut warna pilihan user.
//
// Angka diukur dari docs/reference/capybara/annoyed.png (keputusan 5.13).
// Kerutan `angry` sudah disetujui user: jangan diubah tanpa diminta.

// Tiap kerutan = alur lurus dari ujung luar-atas ke ujung dalam-bawah, meruncing di kedua ujung
//   from, to  — [x (positif = ke dalam), y (positif = ke bawah)] dari tengah mata
//   width     — tebal alur gelap (di tengah)
//   shade     — warna alur (turunan warna dasar, lihat _core/derivedColor.js)
//   opacity   — kepekatan alur
//   highlight — tepi terang di sisi atas alur: offset = jarak dari alur, width, shade, opacity
//   blur      — kelembutan tepi (piksel kanvas), alur di referensi lembut, tidak tegas
const BROWS = {
  angry: {
    crease: {
      from: [0.87, -0.69],
      to: [1.49, -0.18],
      width: 0.18,
      shade: -0.4,
      opacity: 0.85,
      highlight: { offset: 0.14, width: 0.1, shade: 0.12, opacity: 0.6 },
      blur: 0.7,
    },
  },
};

// Kerutan meruncing di kedua ujung (tebal = width × sin(posisi)^taper), seperti di referensi
const CREASE_STEPS = 24;
const CREASE_TAPER = 0.6;

// Bentuk kerutan (path tertutup) dari `from` ke `to`, digeser `shift` tegak lurus alur.
// side: -1 = mata kiri (dalam = ke kanan), +1 = mata kanan (dalam = ke kiri)
function creasePath({ from, to }, width, shift, size, side, cx, cy) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  // Arah tegak lurus alur, menghadap ke atas
  const nx = dy / len;
  const ny = -dx / len;
  const px = (x) => cx - side * x * size;
  const py = (y) => cy + y * size;

  const upper = [];
  const lower = [];
  for (let i = 0; i <= CREASE_STEPS; i++) {
    const t = i / CREASE_STEPS;
    const half = (width / 2) * Math.pow(Math.sin(Math.PI * t), CREASE_TAPER);
    const x = from[0] + dx * t + nx * shift;
    const y = from[1] + dy * t + ny * shift;
    upper.push(`${px(x + nx * half).toFixed(2)} ${py(y + ny * half).toFixed(2)}`);
    lower.push(`${px(x - nx * half).toFixed(2)} ${py(y - ny * half).toFixed(2)}`);
  }
  return `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;
}

export function Brows({ variant = "none", leftX, rightX, y, size, baseColor }) {
  const style = BROWS[variant];
  if (!style) return null;

  const { crease } = style;
  const grooveColor = deriveColor(baseColor, crease.shade);
  const shineColor = deriveColor(baseColor, crease.highlight.shade);
  const filterId = "browCreaseBlur";

  return (
    <g pointerEvents="none">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={crease.blur} />
        </filter>
      </defs>
      {[
        { side: -1, cx: leftX },
        { side: 1, cx: rightX },
      ].map(({ side, cx }) => {
        const shine = creasePath(crease, crease.highlight.width, crease.highlight.offset, size, side, cx, y);
        const groove = creasePath(crease, crease.width, 0, size, side, cx, y);
        return (
          <g key={side} filter={`url(#${filterId})`}>
            <path d={shine} fill={shineColor} opacity={crease.highlight.opacity} />
            <path d={groove} fill={grooveColor} opacity={crease.opacity} />
          </g>
        );
      })}
    </g>
  );
}

export default Brows;
