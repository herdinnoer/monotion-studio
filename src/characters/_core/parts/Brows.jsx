"use client";

import React from "react";
import { deriveColor } from "../derivedColor";

// Alis & kerutan dahi bersama untuk semua karakter (laci alis). Karakter cukup memilih
// jenisnya (variant), bentuk & warnanya diatur di sini supaya style semua karakter sama.
//
// Jenis yang tersedia:
//   angry — kerutan dahi miring di atas sudut dalam mata: kesal (Capybara annoyed)
//   smug  — lengkung tebal cokelat tua yang memeluk sisi atas mata, ekornya runcing di
//           sisi luar, ujung dalamnya membulat di garis pipi: puas (Capybara proud,
//           pasangan mata `smug`)
//   none  — tanpa alis (bawaan)
//
// Di referensi Capybara tidak ada garis alis terpisah di dahi: kelopak atas tebal
// berperan sebagai alis. Annoyed: yang tampil di dahi hanya kerutan (alur gelap + tepi
// terang di sisi atasnya). Proud: lengkung kelopak tebal di atas mata (alis `smug`),
// digambar di sini supaya tetap terlihat saat mata berkedip.
//
// Posisi & ukuran sama dengan mata:
//   leftX, rightX, y — tengah mata kiri & kanan
//   size  — jari-jari mata besar (anatomy.eyeSize × rx)
// Semua angka di BROWS dikali size. "Dalam" = ke arah hidung (dicerminkan otomatis).
//
// Warna kerutan = turunan warna dasar (seperti moncong), jadi ikut warna pilihan user.
//
// Angka diukur dari docs/reference/capybara/annoyed.png & proud.png (keputusan 5.13).
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
  // Lengkung smug (dikali size, dari tengah mata; sudut dalam derajat: 180 = sisi luar,
  // 270 = puncak, 360 = sisi dalam/hidung, lebih dari 360 = turun di sisi dalam).
  // Diukur dari docs/reference/capybara/proud.png (mata kiri, dicek dengan mata kanan).
  //   radius   — jarak garis tengah lengkung dari tengah mata (tepi luarnya = tepi mata)
  //   width    — tebal lengkung di samping; topExtra = tambahan tebal di puncak
  //   from, to — sudut ekor luar & ujung dalam (ujung dalam membulat, tepat di garis
  //              potong pipi mata `smug`)
  //   tail     — ekor luar: sepanjang `span` derajat terakhir lengkung menipis sampai
  //              runcing dan melebar keluar sejauh `out` (di referensi ekornya
  //              keluar dari lingkaran mata, hampir mendatar)
  smug: {
    arch: { radius: 0.82, width: 0.36, topExtra: 0.1, from: 200, to: 368, tail: { span: 25, out: 0.16 } },
  },
};

// Warna lengkung smug = warna garis mata besar (BIG_EYE_COLORS.line di Eyes.jsx)
const ARCH_COLOR = "#5A1E10";

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

// Lengkung smug satu mata. side: -1 = mata kiri, +1 = mata kanan (dalam = ke arah hidung)
const ARCH_STEPS = 48;
function archPath({ radius, width, topExtra, from, to, tail }, cx, cy, R, side) {
  const inward = -side;
  const outer = [];
  const inner = [];
  let end = null;
  for (let i = 0; i <= ARCH_STEPS; i++) {
    const deg = from + ((to - from) * i) / ARCH_STEPS;
    const th = (deg * Math.PI) / 180;
    // Ekor: k = 0 di ujung ekor, 1 setelah `span` derajat
    const k = Math.min(1, (deg - from) / tail.span);
    const r = radius + tail.out * (1 - k) ** 2;
    const w = (width + topExtra * Math.max(0, -Math.sin(th))) * Math.sqrt(k);
    const at = (rr) => [cx + inward * rr * Math.cos(th) * R, cy + rr * Math.sin(th) * R];
    outer.push(at(r + w / 2));
    inner.push(at(r - w / 2));
    if (i === ARCH_STEPS) end = { x: at(r)[0], y: at(r)[1], r: (w / 2) * R };
  }
  const pts = [...outer, ...inner.reverse()].map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`);
  return { d: `M ${pts.join(" L ")} Z`, end };
}

function SmugArch({ arch, cx, cy, R, side }) {
  const { d, end } = archPath(arch, cx, cy, R, side);
  return (
    <>
      <path d={d} fill={ARCH_COLOR} />
      {/* Ujung dalam membulat */}
      <circle cx={end.x} cy={end.y} r={end.r} fill={ARCH_COLOR} />
    </>
  );
}

export function Brows({ variant = "none", leftX, rightX, y, size, baseColor }) {
  const style = BROWS[variant];
  if (!style) return null;

  if (style.arch) {
    return (
      <g pointerEvents="none">
        <SmugArch arch={style.arch} cx={leftX} cy={y} R={size} side={-1} />
        <SmugArch arch={style.arch} cx={rightX} cy={y} R={size} side={1} />
      </g>
    );
  }

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
