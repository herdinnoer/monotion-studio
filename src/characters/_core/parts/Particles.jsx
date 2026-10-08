"use client";

import React from "react";
import { motion } from "framer-motion";
import { loopBounce } from "../motions";

// Partikel efek di sekitar karakter, bersama untuk semua karakter.
//
// Jenis yang tersedia:
//   zzz      — huruf Z melayang (tidur), digambar DI DEPAN badan
//   zzz-bold — Z besar + z kecil, tebal & membulat, mauve kecokelatan (Capybara sleeping)
//   stars    — bintang terbang ke atas (selesai), digambar DI BELAKANG badan
//   anger    — tanda marah (4 lengkung) di dahi (Capybara annoyed), DI DEPAN badan
//   twinkle  — kilau bintang 4 sudut yang diam di tempat & berkelip (Capybara proud),
//              DI BELAKANG badan
//
// Karakter memanggil <Particles> dua kali: sekali dengan layer="back" sebelum badan,
// sekali dengan layer="front" setelah badan. Tiap jenis hanya muncul di lapisannya.
//
// Posisi menempel ke titik tempel karakter (lihat _core/anchors.js). `points` = semua
// titik tempel karakter (hasil resolveAnchors); tiap jenis memakai titiknya sendiri
// (lihat PARTICLES). rx/ry (setengah lebar/tinggi badan) dipakai untuk merentangkan
// sebaran dan mengatur ukuran.
//
// Mode seek: semua gerakan dihitung dari p (progress 0–1), jadi hasil export sama
// dengan preview. Jenis baru (zzz-bold, anger, twinkle) tidak memakai animasi
// framer-motion sama sekali: posisinya langsung dihitung dari p di setiap frame.
// Di p = 0 (pose awal / halaman pembanding beku) bentuknya sama dengan gambar referensi.
const PARTICLES = {
  zzz: { layer: "front", anchor: "zzz" },
  "zzz-bold": { layer: "front", anchor: "zzz" },
  stars: { layer: "back", anchor: "stars" },
  anger: { layer: "front", anchor: "anger" },
  twinkle: { layer: "back", anchor: "twinkle" },
};

export function Particles({ type, layer, points, rx, ry, p = 0 }) {
  const particle = PARTICLES[type];
  if (!particle || particle.layer !== layer) return null;
  const anchor = points[particle.anchor];
  if (!anchor) return null;

  if (type === "zzz") return renderZzz(anchor, rx, ry, p);
  if (type === "zzz-bold") return renderZzzBold(anchor, rx, ry, p);
  if (type === "stars") return renderStars(anchor, rx, ry, loopBounce(p));
  if (type === "anger") return renderAnger(anchor, rx, p);
  if (type === "twinkle") return renderTwinkle(anchor, rx, ry, p);
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

// ---------------------------------------------------------------------------
// Partikel Capybara, diukur dari docs/reference/capybara/ (keputusan 5.13).
// Satuan: rx (setengah lebar badan) untuk ukuran & bentuk, supaya tidak gepeng.

// Garis halus melewati beberapa titik (Catmull-Rom → Bezier), dalam satuan rx
function smoothPath(pts, scale) {
  const P = pts.map(([px, py]) => [px * scale, py * scale]);
  let d = `M ${P[0][0].toFixed(2)} ${P[0][1].toFixed(2)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

// Naik-turun sekali per putaran, bernilai 0 di p = 0 (pose referensi) untuk fase apa pun
function bobFrom(p, phase) {
  return loopBounce((p + phase) % 1) - loopBounce(phase);
}

// Tanda marah (anger): 4 lengkung tebal yang cembung ke arah tengah, seperti di
// docs/reference/capybara/annoyed.png. Titik tempel `anger` = pusat tanda.
// Sudah disetujui user: jangan diubah tanpa diminta.
// Tiap lengkung = 4 titik (luar → tengah → luar), dalam satuan rx dari pusat tanda.
const ANGER = {
  color: "#6E160B", // cokelat kemerahan tua, diambil dari referensi
  width: 0.04, // tebal garis
  // Kilap tipis di sisi atas tiap lengkung (referensi terlihat agak timbul)
  shine: { color: "#A04A3A", width: 0.35, lift: 0.22, opacity: 0.55 }, // width & lift × tebal garis
  strokes: [
    [[-0.061, -0.126], [-0.026, -0.08], [0.014, -0.068], [0.066, -0.086]], // atas
    [[-0.108, -0.097], [-0.073, -0.051], [-0.079, -0.005], [-0.111, 0.03]], // kiri
    [[0.113, -0.028], [0.072, 0.007], [0.083, 0.059], [0.118, 0.088]], // kanan
    [[-0.073, 0.088], [-0.026, 0.065], [0.026, 0.077], [0.066, 0.129]], // bawah
  ],
  // Berdenyut 2× per putaran: membesar sedikit lalu kembali (di p = 0 ukuran asli)
  pulse: { times: 2, scale: 0.12 },
};

function renderAnger({ x, y }, rx, p) {
  const { pulse } = ANGER;
  const s = 1 + pulse.scale * loopBounce((p * pulse.times) % 1);
  const width = ANGER.width * rx;
  const paths = ANGER.strokes.map((pts) => smoothPath(pts, rx));
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      pointerEvents="none"
    >
      <g stroke={ANGER.color} strokeWidth={width}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g
        stroke={ANGER.shine.color}
        strokeWidth={width * ANGER.shine.width}
        opacity={ANGER.shine.opacity}
        transform={`translate(0 ${-width * ANGER.shine.lift})`}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

// Kilau (twinkle): bintang 4 sudut gemuk berujung bulat, emas lembut + cahaya hangat
// di sekelilingnya, seperti di docs/reference/capybara/proud.png.
// Titik tempel `twinkle` = tengah sebaran. Posisi: dx × rx, dy × ry dari titik tempel.
//   size  = setengah tinggi bintang saat paling terang (× rx)
//   phase = kapan bintang paling terang (0 = di awal putaran, 0.25 = paling redup di awal)
const TWINKLE = {
  // 0.2 = titik kendali sisi bintang: pinggang bintang (sisi cekung) ±0.49 × setengah tinggi,
  // bintang referensi gemuk, bukan runcing tipis
  path: "M 0 -0.93 Q 0.2 -0.2 0.93 0 Q 0.2 0.2 0 0.93 Q -0.2 0.2 -0.93 0 Q -0.2 -0.2 0 -0.93 Z",
  round: 0.14, // ujung dibulatkan dengan garis tepi setebal ini (× size)
  colors: { top: "#FFD48C", bottom: "#F6B562", edge: "#F2B062", glow: "#FFDDA6" },
  times: 2, // berkelip 2× per putaran
  dim: { scale: 0.7, opacity: 0.18 }, // keadaan paling redup
  stars: [
    { dx: -0.962, dy: -0.127, size: 0.095, phase: 0 }, // kiri, besar
    { dx: -1.069, dy: 0.098, size: 0.076, phase: 0.25 }, // kiri bawah (di referensi redup)
    { dx: 0.939, dy: -0.084, size: 0.05, phase: 0.05 }, // kanan atas, kecil
    { dx: 1.046, dy: 0.115, size: 0.07, phase: 0.45 }, // kanan bawah
  ],
};

function renderTwinkle({ x, y }, rx, ry, p) {
  const { colors, dim } = TWINKLE;
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id="twinkleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.top} />
          <stop offset="100%" stopColor={colors.bottom} />
        </linearGradient>
        {/* Cahaya hangat; angka blur dalam satuan bintang (ikut ukuran bintang) */}
        <filter id="twinkleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      {TWINKLE.stars.map((star, i) => {
        // k = 1 saat paling terang, 0 saat paling redup
        const k = (1 + Math.cos(2 * Math.PI * TWINKLE.times * (p - star.phase))) / 2;
        const scale = dim.scale + (1 - dim.scale) * k;
        const opacity = dim.opacity + (1 - dim.opacity) * k;
        const size = star.size * rx;
        return (
          <g
            key={i}
            transform={`translate(${x + star.dx * rx} ${y + star.dy * ry}) scale(${size * scale})`}
            opacity={opacity}
          >
            <circle r={1.5} fill={colors.glow} opacity={0.45} filter="url(#twinkleGlow)" />
            <path
              d={TWINKLE.path}
              fill="url(#twinkleGrad)"
              stroke={colors.edge}
              strokeWidth={TWINKLE.round}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </g>
  );
}

// Zzz tebal (zzz-bold): Z besar + z kecil di kanan atas kepala, garis tebal berujung
// bulat, warna mauve kecokelatan, seperti di docs/reference/capybara/sleeping.png.
// Titik tempel `zzz` = tengah Z besar. Tiap huruf = 4 titik (atas kiri → atas kanan →
// bawah kiri → bawah kanan), dalam satuan rx dari titik tempel.
// Sudah disetujui user: jangan diubah tanpa diminta.
const ZZZ_BOLD = {
  colors: { top: "#CBA3A8", bottom: "#B07F86" },
  letters: [
    {
      pts: [[-0.039, -0.096], [0.081, -0.055], [-0.1, 0.047], [0.058, 0.103]],
      width: 0.044,
      phase: 0,
    },
    {
      pts: [[-0.146, 0.126], [-0.063, 0.154], [-0.179, 0.214], [-0.09, 0.251]],
      width: 0.032,
      phase: 0.35,
    },
  ],
  bob: 0.055, // naik-turun pelan (× ry), tiap huruf bergantian
};

function renderZzzBold({ x, y }, rx, ry, p) {
  return (
    <g
      stroke="url(#zzzBoldGrad)"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      <defs>
        <linearGradient id="zzzBoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ZZZ_BOLD.colors.top} />
          <stop offset="100%" stopColor={ZZZ_BOLD.colors.bottom} />
        </linearGradient>
      </defs>
      {ZZZ_BOLD.letters.map((letter, i) => {
        const dy = -ZZZ_BOLD.bob * ry * bobFrom(p, letter.phase);
        const d = "M " + letter.pts.map(([px, py]) => `${(px * rx).toFixed(2)} ${(py * rx).toFixed(2)}`).join(" L ");
        return (
          <path
            key={i}
            d={d}
            transform={`translate(${x} ${y + dy})`}
            strokeWidth={letter.width * rx}
          />
        );
      })}
    </g>
  );
}

export default Particles;
