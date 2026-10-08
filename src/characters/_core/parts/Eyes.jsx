"use client";

import React, { useId } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { generateSpiralPath } from "../shapes";

// Mata bersama untuk semua karakter. Karakter cukup memilih jenisnya (variant),
// bentuk & warnanya diatur di sini supaya style semua karakter sama.
//
// Jenis yang tersedia:
//   round     — mata bulat mengkilap, ikut mouse (bawaan)
//   happy     — lengkung senyum ^ ^
//   sleepy    — lengkung tidur
//   dizzy     — spiral berputar
//   wink      — kiri senyum, kanan bulat
//   yawn      — > < + mulut menguap
//   flat      — garis datar
//   angry     — garis miring + mulut kecil
//   surprised — mata besar + mulut "o"
//   hearts    — lingkaran merah berisi hati
//   iris      — mata besar cokelat + kilau bulat & bintang (Capybara idle)
//   heavy     — mata iris, separuh atas tertutup kelopak miring: kesal (Capybara annoyed)
//   smug      — mata iris, separuh bawah tertutup, melirik ke kanan: puas (Capybara proud)
//   iris-heart — mata iris + hati pink di atas iris (Capybara love)
//   closed    — mata terpejam: lengkung tebal + 2 bulu mata, cokelat tua (Capybara sleeping)
//
// Gambar mata memakai gradient "eyeGloss" & filter "eyeHighlightBloom" dari <defs> karakter.
// heartIconSize = ukuran ikon hati di mata "hearts" (bawaan 17, karakter boleh memperbesar).
// size = jari-jari mata besar (iris, iris-heart, heavy, smug, closed) dalam piksel kanvas; karakter
// mengaturnya lewat anatomy (Capybara: eyeSize). Mata lain tidak memakainya.

// ---------------------------------------------------------------------------
// Mata besar (iris, heavy, smug), diukur dari docs/reference/capybara/ (keputusan 5.13).
// Semua angka dikali jari-jari mata (size). "Dalam" = ke arah hidung: untuk mata kiri
// ke kanan, untuk mata kanan ke kiri (dicerminkan otomatis).

// Warna, diambil dari gambar referensi
const BIG_EYE_COLORS = {
  line: "#5A1E10", // garis tepi & kelopak (cokelat gelap)
  sclera: "#E6DEDB", // putih mata (agak abu hangat)
  irisDark: "#3E2120", // iris bagian atas
  irisWarm: "#91522B", // iris bagian bawah (pantulan cokelat terang)
  shine: "#F4F3F5", // kilau
};

// Bentuk tiap jenis mata besar
//   outline — tebal garis tepi
//   lidTop  — tambahan tebal kelopak di puncak mata (menipis ke samping)
//   iris    — r = jari-jari iris; shift = geser ke dalam (putih mata tampak di sisi luar);
//             glance = geser ke kanan untuk kedua mata (melirik)
//   shine   — kilau bulat (null = tanpa kilau): x (positif = ke dalam; kalau iris punya glance: positif = ke kanan), y, r.
//             x & y boleh ditulis [mata kiri, mata kanan] kalau di referensi berbeda.
//             onTop = kilau tidak ikut terpotong cover (menumpang di atas batas pipi)
//   sparkle — kilau bintang 4 sudut: x (positif = ke dalam), y, s = setengah tinggi
//   cover   — bagian mata yang tertutup: side "top" (kelopak atas turun) atau "bottom"
//             (bagian bawah tertutup pipi). y = garis potong dari tengah mata,
//             tilt = miring (derajat), sisi dalam lebih rendah
//   lid     — garis kelopak tebal di garis potong (heavy)
//   heart   — true = hati pink di atas iris (lihat EYE_HEART)
//
// Mata iris (idle) sudah disetujui user: jangan diubah tanpa diminta.
const IRIS_EYE = {
  outline: 0.08,
  lidTop: 0.11, // kelopak atas total 0.19 di puncak (referensi: 8 dari 43.4 piksel)
  iris: { r: 0.8, shift: 0.12 },
  shine: { x: 0.37, y: -0.27, r: 0.31 },
  sparkle: { x: -0.35, y: 0.43, s: 0.19 },
};

const BIG_EYES = {
  iris: IRIS_EYE,
  // Love: frame mata idle persis (kelopak & bola mata), tanpa kilau, ditambah hati pink
  // (dimajukan dari Fase 4)
  "iris-heart": { ...IRIS_EYE, shine: null, sparkle: null, heart: true },
  heavy: {
    outline: 0.08,
    lidTop: 0.08,
    iris: { r: 0.78, shift: 0.2 },
    shine: { x: 0.38, y: 0.32, r: 0.24 },
    sparkle: { x: -0.25, y: 0.47, s: 0.14 },
    cover: { side: "top", y: 0.05, tilt: 10 },
    lid: { width: 0.2 },
  },
  // Proud: dipasangkan dengan alis `smug` (Brows.jsx) = lengkung tebal di tepi atas mata.
  // Diukur ulang dari docs/reference/capybara/proud.png setelah pose proud (B18.8):
  // isi mata terpotong pipi lebih curam daripada lengkung alis (di bawah ekor luar
  // lengkung langsung kulit): garis potong 0.17 di atas tengah mata, miring 28°
  // (lewat tepi bawah iris referensi). Kilau = rata-rata kedua mata.
  smug: {
    outline: 0.08,
    lidTop: 0.14,
    // Di referensi tidak ada putih mata yang terlihat: iris memenuhi mata,
    // arah lirikan terlihat dari kilau yang bergeser ke kanan
    iris: { r: 1, glance: 0 },
    // Kilau kiri (0.28, −0.30), kanan (0.16, −0.40), sama-sama di kanan tengah mata.
    // Di referensi kilau mata kanan utuh walau sebagian di bawah batas pipi
    shine: { x: [0.28, 0.16], y: [-0.3, -0.4], r: 0.21, onTop: true },
    cover: { side: "bottom", y: -0.17, tilt: 28 },
  },
};

// Mata love "iris-heart": frame sama persis dengan "iris" (kelopak, bola mata), tanpa kilau, ditambah
// hati pink di atas iris. Diukur dari docs/reference/capybara/love.png (dikali size, dari
// tengah mata; x positif = ke dalam):
//   x          — geser hati ke dalam
//   top        — puncak kedua lengkung atas hati
//   notch      — lekukan tengah atas
//   widest     — tinggi bagian terlebar
//   tip        — ujung bawah (lancip)
//   halfWidth  — setengah lebar
const EYE_HEART = { x: 0.04, top: -0.48, notch: -0.33, widest: -0.14, tip: 0.61, halfWidth: 0.66 };
// Warna hati dari referensi: pink terang di atas, merah muda tua di bawah
const EYE_HEART_STOPS = [
  { offset: "0%", color: "#FE7E97" },
  { offset: "45%", color: "#EF6886" },
  { offset: "80%", color: "#DF4851" },
  { offset: "100%", color: "#C83D42" },
];

// Garis hati, pusat (cx, cy), ukuran R. Tiap sisi = 2 lengkung Bezier: lekukan → lengkung
// atas → bagian terlebar (tegak), lalu bagian terlebar → ujung bawah.
function heartPath(cx, cy, R) {
  const { top, notch, widest, tip, halfWidth } = EYE_HEART;
  const a = halfWidth * R;
  const yN = cy + notch * R;
  const yW = cy + widest * R;
  const yB = cy + tip * R;
  // Titik kendali lengkung atas, dihitung supaya puncaknya tepat di `top`
  const c = cy + ((8 * top - notch - widest) / 6) * R;
  const d = yB - yW;
  const lower1 = yW + 0.42 * d;
  const lower2 = yB - 0.18 * d;
  return (
    `M ${cx} ${yN} ` +
    `C ${cx + 0.1 * a} ${c}, ${cx + a} ${c}, ${cx + a} ${yW} ` +
    `C ${cx + a} ${lower1}, ${cx + 0.32 * a} ${lower2}, ${cx} ${yB} ` +
    `C ${cx - 0.32 * a} ${lower2}, ${cx - a} ${lower1}, ${cx - a} ${yW} ` +
    `C ${cx - a} ${c}, ${cx - 0.1 * a} ${c}, ${cx} ${yN} Z`
  );
}

// Mata terpejam "closed" (Capybara sleeping), dikali size, dari tengah mata yang terbuka.
// Satu lengkung tebal yang mulus melengkung ke bawah: tebalnya rata di sebagian besar
// panjangnya, lalu meruncing halus ke kedua ujung. Plus 2 bulu mata pendek di ujung luar.
// Bentuk & posisi lengkung diukur dari docs/reference/capybara/sleeping.png; bulu mata
// permintaan user (di referensi tidak ada).
//   halfWidth — setengah lebar (sampai ujung runcing)
//   endY      — tinggi kedua ujung
//   midY      — tinggi titik terendah (garis tengah lengkung)
//   thick     — tebal lengkung
//   taper     — bentuk runcing: tebal = thick × sin(posisi)^taper. Makin kecil, bagian
//               tebalnya makin rata dan ujungnya makin tumpul
//   lashes    — bulu mata: at = posisi sepanjang lengkung (0 = ujung luar, 1 = ujung dalam),
//               length = panjang, width = tebal garis, spread = seberapa condong ke luar
const CLOSED_EYE = {
  halfWidth: 0.92,
  endY: 0.325,
  midY: 0.755,
  thick: 0.34,
  taper: 0.5,
  lashes: { at: [0.1, 0.2], length: 0.2, width: 0.09, spread: 0.9 },
};
// Warna sama dengan garis mulut (cokelat tua), diambil dari referensi sleeping
const CLOSED_EYE_COLOR = "#47100A";

// Satu mata terpejam, tengah mata di (cx, cy), jari-jari mata R, side -1 kiri / 1 kanan.
// Garis tengah = lengkung Bezier kuadrat; tepi atas & bawah digeser dari garis tengah
// sejauh setengah tebal (yang mengecil halus di ujung), dihitung titik demi titik.
function closedEyeShape(cx, cy, R, side) {
  const { halfWidth, endY, midY, thick, taper, lashes } = CLOSED_EYE;
  const p0 = [cx - halfWidth * R, cy + endY * R];
  const p1 = [cx, cy + (2 * midY - endY) * R];
  const p2 = [cx + halfWidth * R, cy + endY * R];
  const at = (t) => {
    const m = 1 - t;
    const point = [0, 1].map((i) => m * m * p0[i] + 2 * m * t * p1[i] + t * t * p2[i]);
    const tangent = [0, 1].map((i) => 2 * m * (p1[i] - p0[i]) + 2 * t * (p2[i] - p1[i]));
    const len = Math.hypot(tangent[0], tangent[1]);
    const normal = [-tangent[1] / len, tangent[0] / len]; // mengarah ke bawah lengkung
    // Tebal di tengah, mengecil halus ke kedua ujung seperti sapuan kuas
    const half = ((thick * R) / 2) * Math.sin(Math.PI * t) ** taper;
    return { point, normal, half };
  };

  const steps = 64;
  const upper = [];
  const lower = [];
  for (let i = 0; i <= steps; i++) {
    const { point, normal, half } = at(i / steps);
    upper.push(`${(point[0] - normal[0] * half).toFixed(2)} ${(point[1] - normal[1] * half).toFixed(2)}`);
    lower.push(`${(point[0] + normal[0] * half).toFixed(2)} ${(point[1] + normal[1] * half).toFixed(2)}`);
  }
  const body = `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;

  // Bulu mata: dari tepi bawah dekat ujung luar, condong ke bawah & ke luar
  const lashLines = lashes.at.map((pos) => {
    const t = side < 0 ? pos : 1 - pos;
    const { point, normal, half } = at(t);
    const start = [point[0] + normal[0] * half * 0.8, point[1] + normal[1] * half * 0.8];
    const dir = [normal[0] + side * lashes.spread, normal[1]];
    const dirLen = Math.hypot(dir[0], dir[1]);
    const end = [start[0] + (dir[0] / dirLen) * lashes.length * R, start[1] + (dir[1] / dirLen) * lashes.length * R];
    return { start, end };
  });

  return { body, lashLines, lashWidth: lashes.width * R };
}

function ClosedEye({ cx, cy, R, side }) {
  const { body, lashLines, lashWidth } = closedEyeShape(cx, cy, R, side);
  return (
    <g>
      <path d={body} fill={CLOSED_EYE_COLOR} />
      {lashLines.map(({ start, end }, i) => (
        <line
          key={i}
          x1={start[0]}
          y1={start[1]}
          x2={end[0]}
          y2={end[1]}
          stroke={CLOSED_EYE_COLOR}
          strokeWidth={lashWidth}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

// Isi mata besar ikut mouse lebih sedikit dari mata kecil, supaya iris tidak keluar dari mata
const BIG_EYE_TRACK = 0.6;

// Kilau bintang 4 sudut (lengan ramping), pusat (x, y), setengah tinggi s
function sparklePath(x, y, s) {
  const k = 0.15 * s;
  return (
    `M ${x} ${y - s} Q ${x + k} ${y - k} ${x + s} ${y} Q ${x + k} ${y + k} ${x} ${y + s} ` +
    `Q ${x - k} ${y + k} ${x - s} ${y} Q ${x - k} ${y - k} ${x} ${y - s} Z`
  );
}

// Kelopak atas berbentuk sabit: tepi luar = lingkaran mata, tepi dalam = lingkaran yang
// sama digeser turun sejauh d. Paling tebal di puncak, menipis sampai nol di samping.
function lidCrescentPath(cx, cy, r, d) {
  const halfChord = Math.sqrt(r * r - (d * d) / 4);
  const y = cy + d / 2;
  return (
    `M ${cx - halfChord} ${y} A ${r} ${r} 0 1 1 ${cx + halfChord} ${y} ` +
    `A ${r} ${r} 0 0 0 ${cx - halfChord} ${y} Z`
  );
}

// Gradient iris: gelap di atas, cokelat hangat di bawah (seperti pantulan di referensi).
// Isinya selalu sama, jadi aman dipakai bersama oleh semua karakter di halaman.
function IrisGradient() {
  return (
    <defs>
      <radialGradient id="eyeIrisGrad" cx="50%" cy="22%" r="85%">
        <stop offset="0%" stopColor={BIG_EYE_COLORS.irisDark} />
        <stop offset="62%" stopColor={BIG_EYE_COLORS.irisDark} />
        <stop offset="100%" stopColor={BIG_EYE_COLORS.irisWarm} />
      </radialGradient>
      <linearGradient id="eyeHeartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        {EYE_HEART_STOPS.map((stop) => (
          <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
        ))}
      </linearGradient>
    </defs>
  );
}

// Satu mata besar. side: -1 = mata kiri, 1 = mata kanan.
// track = geser isi mata (iris & kilau) mengikuti mouse; putih mata & garis tepi diam.
function BigEye({ variant, side, cx, cy, size: R, track, clipId }) {
  const style = BIG_EYES[variant];
  const inward = -side; // arah "ke dalam" (ke hidung) untuk mata ini
  const outline = style.outline * R;

  const glance = style.iris.glance;
  const irisX = glance != null ? cx + glance * R : cx + inward * style.iris.shift * R;
  const shine = style.shine;
  // Angka kilau boleh beda per mata: [kiri, kanan]
  const perEye = (v) => (Array.isArray(v) ? v[side < 0 ? 0 : 1] : v);
  const shineX = shine && (glance != null ? cx + perEye(shine.x) * R : cx + inward * perEye(shine.x) * R);
  const shineDot = shine && (
    <circle cx={shineX} cy={cy + perEye(shine.y) * R} r={shine.r * R} fill={BIG_EYE_COLORS.shine} />
  );

  // Garis potong (heavy/smug), diputar supaya sisi dalam lebih rendah
  const cover = style.cover;
  const coverRotate = cover ? `rotate(${-side * cover.tilt} ${cx} ${cy})` : undefined;
  const coverY = cover ? cy + cover.y * R : 0;

  const eye = (
    <>
      <clipPath id={`${clipId}in`}>
        <circle cx={cx} cy={cy} r={R - outline / 2} />
      </clipPath>
      <circle cx={cx} cy={cy} r={R} fill={BIG_EYE_COLORS.sclera} />
      <g clipPath={`url(#${clipId}in)`}>
        <motion.g style={{ x: track.x, y: track.y }}>
          <circle cx={irisX} cy={cy} r={style.iris.r * R} fill="url(#eyeIrisGrad)" />
          {style.heart && <path d={heartPath(cx + inward * EYE_HEART.x * R, cy, R)} fill="url(#eyeHeartGrad)" />}
          {shine && !(cover && shine.onTop) && shineDot}
          {style.sparkle && (
            <path
              d={sparklePath(cx + inward * style.sparkle.x * R, cy + style.sparkle.y * R, style.sparkle.s * R)}
              fill={BIG_EYE_COLORS.shine}
            />
          )}
        </motion.g>
      </g>
      <circle cx={cx} cy={cy} r={R - outline / 2} fill="none" stroke={BIG_EYE_COLORS.line} strokeWidth={outline} />
      <path d={lidCrescentPath(cx, cy, R, style.lidTop * R)} fill={BIG_EYE_COLORS.line} />
    </>
  );

  if (!cover) return <g>{eye}</g>;

  // Bagian mata yang tetap terlihat: di bawah garis potong (heavy) atau di atasnya (smug)
  const keep =
    cover.side === "top"
      ? { x: cx - 2 * R, y: coverY, width: 4 * R, height: 3 * R }
      : { x: cx - 2 * R, y: cy - 3 * R, width: 4 * R, height: coverY - (cy - 3 * R) };

  return (
    <g>
      <clipPath id={`${clipId}cover`}>
        <rect {...keep} transform={coverRotate} />
      </clipPath>
      <g clipPath={`url(#${clipId}cover)`}>{eye}</g>
      {shine?.onTop && (
        <g clipPath={`url(#${clipId}in)`}>
          <motion.g style={{ x: track.x, y: track.y }}>{shineDot}</motion.g>
        </g>
      )}
      {style.lid && (
        <line
          x1={cx - R}
          y1={coverY}
          x2={cx + R}
          y2={coverY}
          transform={coverRotate}
          stroke={BIG_EYE_COLORS.line}
          strokeWidth={style.lid.width * R}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export function Eyes({
  variant = "round",
  leftX,
  rightX,
  y: baseY,
  isBlinking = false,
  eyeTrackX,
  eyeTrackY,
  p = 0,
  heartIconSize = 17,
  size = 16.5,
}) {
  // Hook wajib dipanggil di awal, sebelum cabang jenis mata
  const clipId = `eyeClip${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const fallbackTrack = useMotionValue(0);
  const bigTrackX = useTransform(eyeTrackX ?? fallbackTrack, (v) => v * BIG_EYE_TRACK);
  const bigTrackY = useTransform(eyeTrackY ?? fallbackTrack, (v) => v * BIG_EYE_TRACK);
  const isBigEye = variant in BIG_EYES;

  if (variant === "closed") {
    return (
      <g>
        <ClosedEye cx={leftX} cy={baseY} R={size} side={-1} />
        <ClosedEye cx={rightX} cy={baseY} R={size} side={1} />
      </g>
    );
  }

  if (isBlinking && isBigEye) {
    // Mata besar terpejam: lengkung kelopak selebar mata
    const closed = (x) => `M ${x - 0.85 * size} ${baseY} Q ${x} ${baseY + 0.3 * size} ${x + 0.85 * size} ${baseY}`;
    return (
      <g stroke={BIG_EYE_COLORS.line} strokeWidth={0.2 * size} strokeLinecap="round" fill="none">
        <path d={closed(leftX)} />
        <path d={closed(rightX)} />
      </g>
    );
  }

  if (isBigEye) {
    const track = { x: bigTrackX, y: bigTrackY };
    return (
      <g>
        <IrisGradient />
        <BigEye variant={variant} side={-1} cx={leftX} cy={baseY} size={size} track={track} clipId={`${clipId}L`} />
        <BigEye variant={variant} side={1} cx={rightX} cy={baseY} size={size} track={track} clipId={`${clipId}R`} />
      </g>
    );
  }

  if (isBlinking) {
    return (
      <g stroke="#18181B" strokeWidth={6.8} strokeLinecap="round">
        <line x1={leftX - 13} y1={baseY} x2={leftX + 13} y2={baseY} />
        <line x1={rightX - 13} y1={baseY} x2={rightX + 13} y2={baseY} />
      </g>
    );
  }

  if (variant === "happy") {
    return (
      <g stroke="#111827" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY + 5} Q ${leftX} ${baseY - 9} ${leftX + 14} ${baseY + 5}`} />
        <path d={`M ${rightX - 14} ${baseY + 5} Q ${rightX} ${baseY - 9} ${rightX + 14} ${baseY + 5}`} />
      </g>
    );
  }

  if (variant === "sleepy") {
    return (
      <g stroke="#1F2937" strokeWidth={6.8} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 14} ${baseY - 3} Q ${leftX} ${baseY + 11} ${leftX + 14} ${baseY - 3}`} />
        <path d={`M ${rightX - 14} ${baseY - 3} Q ${rightX} ${baseY + 11} ${rightX + 14} ${baseY - 3}`} />
      </g>
    );
  }

  if (variant === "dizzy") {
    const leftSpiral = generateSpiralPath(leftX, baseY, 18, 2.5);
    const rightSpiral = generateSpiralPath(rightX, baseY, 18, 2.5);

    return (
      <g stroke="#1F2937" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <motion.path
          d={leftSpiral}
          animate={{ rotate: p * 360 }}
          style={{ transformOrigin: `${leftX}px ${baseY}px` }}
        />
        <motion.path
          d={rightSpiral}
          animate={{ rotate: -p * 360 }}
          style={{ transformOrigin: `${rightX}px ${baseY}px` }}
        />
      </g>
    );
  }

  if (variant === "wink") {
    return (
      <g>
        <path
          d={`M ${leftX - 14} ${baseY + 5} Q ${leftX} ${baseY - 9} ${leftX + 14} ${baseY + 5}`}
          stroke="#18181B"
          strokeWidth={6.8}
          strokeLinecap="round"
          fill="none"
        />
        <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
          <circle cx={rightX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
          <circle
            cx={rightX - 4.8}
            cy={baseY - 4.8}
            r={5.2}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={rightX + 4.2}
            cy={baseY + 4.2}
            r={2.4}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
        </motion.g>
      </g>
    );
  }

  if (variant === "yawn") {
    return (
      <g>
        <path
          d={`M ${leftX - 13} ${baseY - 7} L ${leftX} ${baseY} L ${leftX - 13} ${baseY + 7}`}
          stroke="#1F2937"
          strokeWidth={6.0}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={`M ${rightX + 13} ${baseY - 7} L ${rightX} ${baseY} L ${rightX + 13} ${baseY + 7}`}
          stroke="#1F2937"
          strokeWidth={6.0}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx={(leftX + rightX) / 2} cy={baseY + 15} rx={7} ry={11} fill="#E11D48" />
      </g>
    );
  }

  if (variant === "flat" || variant === "angry") {
    const angry = variant === "angry";
    return (
      <g stroke="#18181B" strokeWidth={6.8} strokeLinecap="round">
        <line
          x1={leftX - 15}
          y1={angry ? baseY + 2.5 : baseY}
          x2={leftX + 15}
          y2={angry ? baseY - 2.5 : baseY}
        />
        <line
          x1={rightX - 15}
          y1={angry ? baseY - 2.5 : baseY}
          x2={rightX + 15}
          y2={angry ? baseY + 2.5 : baseY}
        />
        {angry && (
          <ellipse cx={(leftX + rightX) / 2} cy={baseY + 16} rx={8} ry={5} fill="#BE123C" />
        )}
      </g>
    );
  }

  if (variant === "surprised") {
    return (
      <g>
        <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
          <circle cx={leftX} cy={baseY} r={18} fill="url(#eyeGloss)" />
          <circle
            cx={leftX - 5.2}
            cy={baseY - 5.2}
            r={5.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={leftX + 4.5}
            cy={baseY + 4.5}
            r={2.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />

          <circle cx={rightX} cy={baseY} r={18} fill="url(#eyeGloss)" />
          <circle
            cx={rightX - 5.2}
            cy={baseY - 5.2}
            r={5.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
          <circle
            cx={rightX + 4.5}
            cy={baseY + 4.5}
            r={2.6}
            fill="#FFFFFF"
            opacity={0.30}
            filter="url(#eyeHighlightBloom)"
          />
        </motion.g>

        <circle
          cx={(leftX + rightX) / 2}
          cy={baseY + 18}
          r={8.5}
          fill="#18181B"
        />
      </g>
    );
  }

  if (variant === "hearts") {
    return (
      <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
        <circle cx={leftX} cy={baseY} r={17} fill="#BE123C" />
        <text x={leftX} y={baseY + heartIconSize * 0.35} fontSize={heartIconSize} textAnchor="middle" fill="#FFFFFF">❤️</text>
        <circle cx={rightX} cy={baseY} r={17} fill="#BE123C" />
        <text x={rightX} y={baseY + heartIconSize * 0.35} fontSize={heartIconSize} textAnchor="middle" fill="#FFFFFF">❤️</text>
      </motion.g>
    );
  }

  return (
    <motion.g style={{ x: eyeTrackX, y: eyeTrackY }}>
      <circle cx={leftX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      <circle
        cx={leftX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      <circle
        cx={leftX + 4.2}
        cy={baseY + 4.2}
        r={2.4}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />

      <circle cx={rightX} cy={baseY} r={16.5} fill="url(#eyeGloss)" />
      <circle
        cx={rightX - 4.8}
        cy={baseY - 4.8}
        r={5.2}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
      <circle
        cx={rightX + 4.2}
        cy={baseY + 4.2}
        r={2.4}
        fill="#FFFFFF"
        opacity={0.30}
        filter="url(#eyeHighlightBloom)"
      />
    </motion.g>
  );
}

export default Eyes;
