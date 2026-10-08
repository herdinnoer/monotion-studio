"use client";

import React, { useId } from "react";
import { capybaraConfig } from "./capybara.config";
import { MovingPart } from "../_core/MovingPart";
import { MOOD_TINT_OPACITY } from "../_core/moodTint";
import { deriveColor, shadeColor } from "../_core/derivedColor";
import { generateDomePath, generatePetalPath } from "../_core/shapes";

const { parts } = capybaraConfig;

// Bentuk telinga, moncong, jeruk, tangkai & daun, diukur dari
// docs/reference/capybara/idle.png (keputusan 5.13).
// Semua angka relatif ke badan: x dikali rx, y dikali ry (0 = tengah, ±1 = tepi).
// Untuk bagian kiri-kanan, x ditulis untuk sisi kanan lalu dicerminkan.
const SHAPE = {
  // Telinga: bentuk jempol (sisi hampir sejajar, ujung membulat lebar), lebih tinggi
  // daripada lebar, miring ke luar. Di referensi telinga menghadap ke samping, jadi dari
  // depan terlihat agak ramping. Pangkalnya (titik putar earL/earR di config) tersembunyi
  // di balik kepala. Ukuran dikali rx (bukan ry) supaya bentuknya tidak gepeng saat diputar.
  //   height, tipRadius, sideAngle, baseLift, baseDepth → lihat generatePetalPath
  //   di _core/shapes.js
  //   tilt = miring ke luar (derajat, 0 = tegak)
  ear: { height: 0.433, tipRadius: 0.172, sideAngle: 13, baseLift: 0.13, baseDepth: 0.15, tilt: 15 },
  // Cekungan gelap berbentuk sabit di SISI LUAR telinga (seperti di referensi: telinga
  // menghadap ke samping, jadi cekungannya hanya terlihat sebagian).
  // Dibuat dari bentuk jempol yang lebih kecil (cekungan), lalu bagian dalamnya ditutup
  // bentuk yang sama yang digeser ke arah tengah kepala (penutup). Sisanya = sabit.
  //   shift = geser cekungan ke arah luar (angka negatif = ke arah tengah kepala)
  //   up    = geser cekungan ke arah ujung telinga
  earInner: { height: 0.37, tipRadius: 0.146, baseLift: 0.11, baseDepth: 0.11, shift: 0.01, up: 0.035 },
  // Penutup sabit: seberapa jauh digeser dari cekungan ke arah tengah kepala & ke bawah.
  // Makin besar coverShift, sabit makin tebal.
  earCrescent: { coverShift: 0.16, coverDown: 0.04 },
  // Moncong: kubah lebar ke bawah, atasnya menyempit
  snout: { x: 0, y: 0.287, rx: 0.342, ry: 0.444, dome: { widest: 0.18, nTop: 2.8, nBottom: 2.3, taper: 0.12 } },
  // Lubang hidung: oval kecil, ujung dalamnya lebih rendah
  nostril: { x: 0.142, y: 0.017, rx: 0.06, ry: 0.047, tilt: 25 },
  // Jeruk: bulat sedikit gepeng (mandarin), bagian bawahnya tenggelam di kepala, jadi
  // dipotong rata di garis duduknya (flatBase). Ukuran diukur dari referensi.
  orange: { x: 0, y: -1.104, rx: 0.297, ry: 0.276, dome: { nTop: 2.2, nBottom: 2, flatBase: 0.726 } },
  // Tangkai & daun: titiknya relatif ke tengah jeruk, jadi ikut kalau jeruk dipindah
  // Tangkai: garis tebal melengkung sedikit ke kiri (pangkal → ujung)
  stem: { points: [[0, -0.234], [-0.005, -0.304], [-0.009, -0.362], [-0.014, -0.408]], width: 0.056 },
  // Daun: pangkal menempel ke tangkai, sisi bawahnya menempel ke kulit atas jeruk,
  // ujung runcing ke kanan
  leaf: {
    base: [0.012, -0.245],
    top: [[0.06, -0.431], [0.264, -0.467], [0.36, -0.299]], // pangkal → ujung (sisi atas)
    bottom: [[0.252, -0.179], [0.096, -0.185]], // ujung → pangkal (sisi bawah)
  },
};

// Warna tetap (paint "fixed"), diambil dari gambar referensi
const STEM_COLOR = "#7A4532";
const LEAF_LIGHT = "#A9CC86";
const LEAF_DARK = "#7FA85C";

// Warna satu bagian menurut paint-nya di capybara.config.js.
// Bagian ber-paint "base" memakai baseFill, jadi selalu sewarna dengan badan.
// Bagian ber-paint "derived" (telinga, moncong, dalam telinga, jeruk) dihitung dari baseColor,
// jadi ikut berubah saat user ganti warna.
function paintOf(partId, baseFill, baseColor) {
  const part = parts[partId];
  if (part.paint === "base") return baseFill;
  if (part.paint === "derived") return deriveColor(baseColor, part.shade);
  return undefined;
}

// Lapisan tipis mood untuk satu bentuk: salinan bentuknya, diisi warna mood transparan.
// Wajib digambar TEPAT setelah bentuknya, sebelum bentuk lain yang menimpanya.
// Kalau digambar belakangan, lapisan transparan ini ikut menimpa bentuk di depannya,
// dan garis bentuk di belakang jadi terlihat "tembus" (lihat keputusan 5.14).
function tintOf(element, tintFill, tintColor) {
  return tintFill && React.cloneElement(element, { fill: tintFill, stroke: tintColor, strokeWidth: 0.1, opacity: MOOD_TINT_OPACITY });
}

// Id gradient yang warnanya ikut warna user dibuat unik per Capybara. Kalau id-nya
// sama, browser memakai gradient milik Capybara pertama di halaman (thumbnail di
// sidebar kiri, warna bawaan), jadi bagian di area tengah tidak ikut warna pilihan user.
function useUniqueId() {
  return useId().replace(/[^a-zA-Z0-9]/g, "");
}

// Badan Capybara + telinga + moncong, digambar dari belakang ke depan.
// Telinga menyatu dengan tubuh (digambar di sini, bukan sebagai aksesori).
// Jeruk digambar terpisah oleh CapybaraOrange (lihat di bawah).
//
// - baseFill:  isi untuk bagian ber-paint "base" (ikut warna dasar user)
// - baseColor: warna dasar (kode hex) untuk menghitung bagian ber-paint "derived"
// - partMotions: gerakan bagian bergerak dari mood, misalnya { earL: "droop" }
// - tintFill/tintColor: lapisan tipis mood (null = mood tanpa nuansa warna).
//   Lapisan tipis untuk badan digambar CapybaraMaster di atas mata & pipi;
//   untuk telinga digambar di sini supaya ikut bergerak bersama telinga.
// - snoutY: geser moncong & lubang hidung naik/turun (piksel), dari pose mood
//   (kepala mendongak, lihat _core/poses.js). 0 = posisi asli.
// - shading: bayangan volume pipi dari pose mood (capybaraConfig.poses.*.shading, ditambah
//   `cheek` = bola pipi pose), null = tanpa bayangan (semua mood kecuali yang posenya punya shading).
export function CapybaraBody({ bodyPath, cx, cy, rx, ry, baseFill, baseColor, stroke, tintFill, tintColor, partMotions = {}, timeline, snoutY = 0, shading = null }) {
  const originOf = (partId) => ({ x: cx + parts[partId].origin.x * rx, y: cy + parts[partId].origin.y * ry });

  const uid = useUniqueId();
  const snoutGradId = `capybaraSnoutGrad${uid}`;
  const earGradId = `capybaraEarGrad${uid}`;
  const earInnerGradId = `capybaraEarInnerGrad${uid}`;
  const crescentMaskId = (side) => `capybaraEarCrescent${side < 0 ? "L" : "R"}${uid}`;

  // Bentuk telinga & cekungannya sama untuk kiri dan kanan (simetris);
  // yang dibalik hanya arah miring dan arah geser cekungan.
  const petal = (shape) =>
    generatePetalPath(shape.height * rx, shape.tipRadius * rx, SHAPE.ear.sideAngle, {
      baseLift: shape.baseLift * rx,
      baseDepth: shape.baseDepth * rx,
    });
  const earPath = petal(SHAPE.ear);
  const earInnerPath = petal(SHAPE.earInner);
  // Posisi cekungan & penutupnya di dalam telinga (side: -1 kiri, 1 kanan; positif = keluar)
  const cavityX = (side) => side * SHAPE.earInner.shift * rx;
  const cavityY = -SHAPE.earInner.up * rx;
  const cavityMove = (side) => `translate(${cavityX(side)} ${cavityY})`;
  const coverMove = (side) =>
    `translate(${cavityX(side) - side * SHAPE.earCrescent.coverShift * rx} ${cavityY + SHAPE.earCrescent.coverDown * rx})`;

  // Telinga: kelopak miring ke luar, pangkalnya tersembunyi di balik kepala
  const renderEar = (partId, side) => {
    const base = originOf(partId);
    const ear = <path d={earPath} />;

    return (
      <MovingPart motionId={partMotions[partId]} origin={base} timeline={timeline}>
        <g transform={`translate(${base.x} ${base.y}) rotate(${side * SHAPE.ear.tilt})`}>
          {React.cloneElement(ear, { fill: `url(#${earGradId})`, stroke, strokeWidth: 0.1 })}
          {/* Sabit gelap = cekungan dikurangi penutupnya (lewat mask), tepinya lembut */}
          <mask id={crescentMaskId(side)}>
            <path d={earInnerPath} transform={cavityMove(side)} fill="#FFFFFF" />
            <path d={earInnerPath} transform={coverMove(side)} fill="#000000" />
          </mask>
          <g filter="url(#capybaraSoftEdge)">
            <path
              d={earInnerPath}
              transform={cavityMove(side)}
              fill={`url(#${earInnerGradId})`}
              mask={`url(#${crescentMaskId(side)})`}
            />
          </g>
          {tintOf(ear, tintFill, tintColor)}
        </g>
      </MovingPart>
    );
  };

  // Lubang hidung kiri & kanan
  const renderNostril = (side) => {
    const nx = cx + side * SHAPE.nostril.x * rx;
    const ny = cy + snoutY + SHAPE.nostril.y * ry;
    return (
      <ellipse
        cx={nx}
        cy={ny}
        rx={SHAPE.nostril.rx * rx}
        ry={SHAPE.nostril.ry * ry}
        fill={paintOf("nostril", baseFill, baseColor)}
        transform={`rotate(${-side * SHAPE.nostril.tilt}, ${nx}, ${ny})`}
      />
    );
  };

  const snoutPath = generateDomePath(
    cx + SHAPE.snout.x * rx,
    cy + snoutY + SHAPE.snout.y * ry,
    SHAPE.snout.rx * rx,
    SHAPE.snout.ry * ry,
    SHAPE.snout.dome,
  );
  const snoutColor = paintOf("snout", baseFill, baseColor);
  const earColor = paintOf("earL", baseFill, baseColor);
  const earInnerColor = paintOf("earInner", baseFill, baseColor);

  return (
    <>
      <defs>
        {/* Moncong: atas hampir sama, bawah sedikit lebih gelap (atas tidak dibuat terang supaya tepinya tidak luntur ke kepala) */}
        <linearGradient id={snoutGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={shadeColor(snoutColor, 0.04)} />
          <stop offset="100%" stopColor={shadeColor(snoutColor, -0.1)} />
        </linearGradient>

        {/* Telinga (warna turunan): ujung sedikit lebih terang, pangkal lebih gelap */}
        <linearGradient id={earGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={shadeColor(earColor, 0.12)} />
          <stop offset="100%" stopColor={shadeColor(earColor, -0.12)} />
        </linearGradient>

        {/* Dalam telinga: paling gelap di tengah cekungan */}
        <radialGradient id={earInnerGradId} cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor={shadeColor(earInnerColor, -0.1)} />
          <stop offset="100%" stopColor={earInnerColor} />
        </radialGradient>

        {/* Tepi lembut untuk sabit dalam telinga */}
        <filter id="capybaraSoftEdge" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>

        {/* Tepi moncong: lebih tegas dari sabit telinga, cukup dihaluskan sedikit */}
        <filter id="capybaraSnoutEdge" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      {renderEar("earL", -1)}
      {renderEar("earR", 1)}

      <path d={bodyPath} fill={paintOf("body", baseFill, baseColor)} stroke={stroke} strokeWidth={0.1} />

      {/* Bayangan volume pipi (pose dengan shading, misalnya proud), di bawah moncong */}
      {shading && (
        <CheekShading shading={shading} bodyPath={bodyPath} cx={cx} cy={cy} rx={rx} ry={ry} baseColor={baseColor} uid={uid} />
      )}

      {/* Moncong & lubang hidung (warna turunan) */}
      <path d={snoutPath} fill={`url(#${snoutGradId})`} filter="url(#capybaraSnoutEdge)" />
      {renderNostril(-1)}
      {renderNostril(1)}
    </>
  );
}

// Bayangan volume pipi untuk pose yang menggembungkan pipi (proud, pose "puffed").
// Per pipi: sabit bayangan lembut di bawah & sisi luar bola pipi, sorotan tipis di atasnya,
// dan lipatan dari bawah moncong yang melengkung ke luar di bawah gembungan.
// Warnanya turunan warna dasar (5.11), jadi bekerja di warna apa pun (bukan pink, 5.15).
// Tidak beranimasi sendiri (ikut gerak badan), jadi preview, seek, dan export sama.
// Semua dipotong bentuk badan supaya tidak keluar dari kepala.
function CheekShading({ shading, bodyPath, cx, cy, rx, ry, baseColor, uid }) {
  const { cheek, shadow, highlight, crease } = shading;
  const clipId = `capybaraCheekClip${uid}`;
  const maskId = (side) => `capybaraCheekShadow${side < 0 ? "L" : "R"}${uid}`;
  const shadowBlurId = `capybaraCheekShadowBlur${uid}`;
  const highlightBlurId = `capybaraCheekHighlightBlur${uid}`;
  const creaseBlurId = `capybaraCheekCreaseBlur${uid}`;
  const shadowColor = deriveColor(baseColor, shadow.shade);
  const highlightColor = deriveColor(baseColor, highlight.shade);
  const creaseColor = crease && deriveColor(baseColor, crease.shade);

  const renderCheek = (side) => {
    const ex = cx + side * cheek.x * rx;
    const ey = cy + cheek.y * ry;
    const hx = cx + side * highlight.x * rx;
    const hy = cy + highlight.y * ry;
    return (
      <g key={side}>
        {/* Sabit = gembungan dikurangi salinannya yang digeser ke dalam & ke atas */}
        <mask id={maskId(side)}>
          <ellipse cx={ex} cy={ey} rx={cheek.rx * rx} ry={cheek.ry * ry} fill="#FFFFFF" />
          <ellipse
            cx={ex - side * shadow.shiftX * rx}
            cy={ey + shadow.shiftY * ry}
            rx={cheek.rx * rx}
            ry={cheek.ry * ry}
            fill="#000000"
          />
        </mask>
        <g filter={`url(#${shadowBlurId})`}>
          <ellipse
            cx={ex}
            cy={ey}
            rx={cheek.rx * rx}
            ry={cheek.ry * ry}
            fill={shadowColor}
            opacity={shadow.opacity}
            mask={`url(#${maskId(side)})`}
          />
        </g>
        <ellipse
          cx={hx}
          cy={hy}
          rx={highlight.rx * rx}
          ry={highlight.ry * ry}
          transform={`rotate(${side * highlight.tilt} ${hx} ${hy})`}
          fill={highlightColor}
          opacity={highlight.opacity}
          filter={`url(#${highlightBlurId})`}
        />
        {crease && (
          <path d={creasePath(crease, side, cx, cy, rx, ry)} fill={creaseColor} opacity={crease.opacity} filter={`url(#${creaseBlurId})`} />
        )}
      </g>
    );
  };

  return (
    <g clipPath={`url(#${clipId})`} pointerEvents="none">
      <defs>
        <clipPath id={clipId}>
          <path d={bodyPath} />
        </clipPath>
        <filter id={shadowBlurId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={shadow.blur * rx} />
        </filter>
        <filter id={highlightBlurId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={highlight.blur * rx} />
        </filter>
        {crease && (
          <filter id={creaseBlurId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={crease.blur * rx} />
          </filter>
        )}
      </defs>
      {renderCheek(-1)}
      {renderCheek(1)}
    </g>
  );
}

// Lipatan pipi: lengkung Bezier kuadrat yang lewat titik `via`, tebal di tengah & meruncing
// ke kedua ujung. Titik ditulis untuk pipi kanan (x × rx, y × ry dari tengah badan).
const CREASE_STEPS = 32;
function creasePath({ from, via, to, width }, side, cx, cy, rx, ry) {
  // Titik kendali supaya lengkung tepat lewat `via` di tengahnya
  const ctrl = [2 * via[0] - (from[0] + to[0]) / 2, 2 * via[1] - (from[1] + to[1]) / 2];
  const at = (t) => {
    const u = 1 - t;
    return [u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0], u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1]];
  };
  const upper = [];
  const lower = [];
  for (let i = 0; i <= CREASE_STEPS; i++) {
    const t = i / CREASE_STEPS;
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(1, t + 0.01));
    const [x1, y1] = at(Math.max(0, t - 0.01));
    // Arah tegak lurus lengkung (dalam satuan kanvas)
    const dx = (x2 - x1) * rx;
    const dy = (y2 - y1) * ry;
    const len = Math.hypot(dx, dy) || 1;
    const half = ((width * rx) / 2) * Math.sin(Math.PI * t);
    const px = cx + side * x * rx;
    const py = cy + y * ry;
    const nx = (-dy / len) * half * side;
    const ny = (dx / len) * half;
    upper.push(`${(px + nx).toFixed(2)} ${(py + ny).toFixed(2)}`);
    lower.push(`${(px - nx).toFixed(2)} ${(py - ny).toFixed(2)}`);
  }
  return `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;
}

// Jeruk + tangkai + daun di atas kepala.
// Jeruk tidak punya gerakan sendiri: selalu menempel di kepala dan ikut gerak badan
// (keputusan 5.14). CapybaraMaster menggambarnya SETELAH lapisan tipis badan,
// supaya lapisan tipis badan tidak menimpa bagian bawah jeruk yang duduk di kepala.
//
// - baseColor: warna dasar (kode hex), jeruk ber-paint "derived"
// - tintFill/tintColor: lapisan tipis mood (null = mood tanpa nuansa warna)
export function CapybaraOrange({ cx, cy, rx, ry, baseColor, tintFill, tintColor }) {
  const uid = useUniqueId();
  const orangeGradId = `capybaraOrangeGrad${uid}`;

  const ox = cx + SHAPE.orange.x * rx;
  const oy = cy + SHAPE.orange.y * ry;
  const orangeRx = SHAPE.orange.rx * rx;
  const orangeRy = SHAPE.orange.ry * ry;
  const orange = <path d={generateDomePath(ox, oy, orangeRx, orangeRy, SHAPE.orange.dome)} />;
  const orangeColor = paintOf("orange", null, baseColor);

  // Ubah titik relatif ke tengah jeruk [x, y] jadi "x y" dalam koordinat kanvas
  const at = ([x, y]) => `${(ox + x * rx).toFixed(2)} ${(oy + y * ry).toFixed(2)}`;

  const [stem0, stem1, stem2, stem3] = SHAPE.stem.points;
  const { leaf } = SHAPE;
  const leafTip = leaf.top[2];

  return (
    <>
      <defs>
        <radialGradient id={orangeGradId} cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor={shadeColor(orangeColor, 0.3)} />
          <stop offset="50%" stopColor={orangeColor} />
          <stop offset="100%" stopColor={shadeColor(orangeColor, -0.15)} />
        </radialGradient>

        {/* Isinya selalu sama, jadi aman dipakai bersama oleh semua Capybara di halaman */}
        <linearGradient id="capybaraLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={LEAF_LIGHT} />
          <stop offset="100%" stopColor={LEAF_DARK} />
        </linearGradient>
      </defs>

      {/* Tangkai (di belakang jeruk, pangkalnya tertutup jeruk) */}
      <path
        d={`M ${at(stem0)} C ${at(stem1)}, ${at(stem2)}, ${at(stem3)}`}
        stroke={STEM_COLOR}
        strokeWidth={SHAPE.stem.width * rx}
        strokeLinecap="round"
        fill="none"
      />
      {React.cloneElement(orange, { fill: `url(#${orangeGradId})` })}
      {/* Kilau lembut jeruk */}
      <ellipse
        cx={ox - 0.4 * orangeRx}
        cy={oy - 0.45 * orangeRy}
        rx={0.22 * orangeRx}
        ry={0.14 * orangeRx}
        fill="#FFFFFF"
        opacity={0.35}
        transform={`rotate(-25, ${ox - 0.4 * orangeRx}, ${oy - 0.45 * orangeRy})`}
      />
      {tintOf(orange, tintFill, tintColor)}

      {/* Daun + tulang daun, digambar setelah lapisan tipis jeruk supaya tetap solid */}
      <path
        d={`M ${at(leaf.base)} C ${leaf.top.map(at).join(", ")} C ${leaf.bottom.map(at).join(", ")}, ${at(leaf.base)} Z`}
        fill="url(#capybaraLeafGrad)"
      />
      <path
        d={`M ${at(leaf.base)} Q ${at([0.18, -0.299])}, ${at(leafTip)}`}
        stroke={LEAF_LIGHT}
        strokeWidth={0.8}
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
    </>
  );
}
