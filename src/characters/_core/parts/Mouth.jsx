"use client";

import React from "react";

// Mulut bersama untuk semua karakter (laci mulut). Karakter cukup memilih jenisnya
// (variant), bentuk & warnanya diatur di sini supaya style semua karakter sama.
//
// Jenis yang tersedia:
//   w     — ω, mulut kucing tersenyum (Capybara idle)
//   frown — cemberut ∩ (Capybara annoyed)
//   smirk — ω lebih lebar, sudutnya lebih naik: senyum puas (Capybara proud)
//   w-small — ω kecil & datar dengan garis tengah panjang (Capybara sleeping)
//   w-wide  — ω lebih lebar, ujung kiri-kanan naik tinggi seperti tersenyum (Capybara love)
//   none  — tanpa mulut (bawaan)
//
// Posisi & ukuran:
//   x, y  — titik tempel `mouth` karakter = pangkal garis tengah, tepat di bawah hidung
//   size  — 1 satuan dalam piksel kanvas = setengah lebar mulut ω di mood idle
// Semua angka di MOUTHS ditulis dalam satuan itu: x ke kanan, y ke bawah dari titik tempel.
//
// Angka diukur dari docs/reference/capybara/ (idle, annoyed, proud, sleeping, love), keputusan 5.13.
// Mulut w (idle), MOUTH_COLOR, dan STROKE sudah disetujui user: jangan diubah tanpa diminta.

// Warna garis mulut, diambil dari gambar referensi (cokelat sangat gelap)
const MOUTH_COLOR = "#47100A";
// Tebal garis (satuan size). Diukur dengan cara yang sama di referensi & hasil render
// kode: garis referensi 10 piksel, garis kode lama (0.14) 7 piksel
const STROKE = 0.19;

// Tiap mulut = garis tengah (philtrum, dari hidung turun) + lengkungnya.
//   philtrum: panjang garis tengah
//   lobes:    ω — dua lengkung potongan lingkaran yang bertemu di garis tengah.
//             Ditulis untuk sisi kanan lalu dicerminkan: cx, cy = pusat lingkaran,
//             r = jari-jari, endX = ujung luar lengkung
//   curve:    ∩ — satu lengkung Bezier: end = ujung kanan, control = titik kendali kanan
//             (sisi kiri dicerminkan)
const MOUTHS = {
  w: { philtrum: 0.912, lobes: { cx: 0.474, cy: 0.352, r: 0.734, endX: 0.92 } },
  frown: { philtrum: 0.453, curve: { end: [0.572, 0.94], control: [0.24, 0.516] } },
  smirk: { philtrum: 0.58, lobes: { cx: 0.499, cy: 0.076, r: 0.709, endX: 1.0 } },
  "w-small": { philtrum: 1.16, lobes: { cx: 0.257, cy: 0.525, r: 0.685, endX: 0.514 } },
  "w-wide": { philtrum: 0.523, lobes: { cx: 0.508, cy: 0.095, r: 0.664, endX: 1.085 } },
};

// Titik pada lingkaran lobe di posisi x tertentu (bagian bawah lingkaran)
function lobeY({ cx, cy, r }, x) {
  return cy + Math.sqrt(r * r - (x - cx) * (x - cx));
}

// Garis SVG mulut dalam satuan size, titik tempel di (0, 0)
function mouthPath(shape) {
  const parts = [`M 0 0 L 0 ${shape.philtrum}`];

  if (shape.lobes) {
    // Lengkung kiri & kanan: dari ujung luar, lewat bawah, naik ke garis tengah
    const { r, endX } = shape.lobes;
    const endY = lobeY(shape.lobes, endX);
    const midY = lobeY(shape.lobes, 0);
    parts.push(`M ${-endX} ${endY} A ${r} ${r} 0 0 0 0 ${midY}`);
    parts.push(`M ${endX} ${endY} A ${r} ${r} 0 0 1 0 ${midY}`);
  }

  if (shape.curve) {
    const [ex, ey] = shape.curve.end;
    const [kx, ky] = shape.curve.control;
    parts.push(`M ${-ex} ${ey} C ${-kx} ${ky}, ${kx} ${ky}, ${ex} ${ey}`);
  }

  return parts.join(" ");
}

export function Mouth({ variant = "none", x, y, size }) {
  const shape = MOUTHS[variant];
  if (!shape) return null;

  return (
    <path
      d={mouthPath(shape)}
      transform={`translate(${x} ${y}) scale(${size})`}
      stroke={MOUTH_COLOR}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

export default Mouth;
