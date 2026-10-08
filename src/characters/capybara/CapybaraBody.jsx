"use client";

import React from "react";
import { capybaraConfig } from "./capybara.config";
import { MovingPart } from "../_core/MovingPart";
import { MOOD_TINT_OPACITY } from "../_core/moodTint";

const { parts } = capybaraConfig;

// Badan Capybara + telinga + moncong + jeruk, digambar dari belakang ke depan.
// Telinga & jeruk menyatu dengan tubuh (digambar di sini, bukan sebagai aksesori).
//
// - baseFill:  isi untuk bagian ber-paint "base" (ikut warna dasar user)
// - partMotions: gerakan bagian bergerak dari mood, misalnya { orange: "bounce" }
// - tintFill/tintColor: lapisan tipis mood (null = mood tanpa nuansa warna).
//   Lapisan tipis untuk badan digambar CapybaraMaster di atas mata & pipi;
//   untuk telinga & jeruk digambar di sini supaya ikut bergerak bersama bagiannya.
//
// Bagian yang ditandai paint "base" di capybara.config.js memakai baseFill,
// jadi telinga selalu sewarna dengan badan.
export function CapybaraBody({ bodyPath, cx, cy, rx, ry, baseFill, stroke, tintFill, tintColor, partMotions = {}, timeline }) {
  const paintOf = (partId) => (parts[partId].paint === "base" ? baseFill : undefined);
  const originOf = (partId) => ({ x: cx + parts[partId].origin.x * rx, y: cy + parts[partId].origin.y * ry });

  const tint = (element) =>
    tintFill && React.cloneElement(element, { fill: tintFill, stroke: tintColor, strokeWidth: 0.1, opacity: MOOD_TINT_OPACITY });

  // Telinga: elips miring, setengah bawahnya tertutup kepala
  const renderEar = (partId, side) => {
    const origin = originOf(partId);
    const ex = origin.x;
    const ey = origin.y - 10;
    const tilt = side * 20;
    const ear = <ellipse cx={ex} cy={ey} rx={17} ry={14} transform={`rotate(${tilt}, ${ex}, ${ey})`} />;

    return (
      <MovingPart motionId={partMotions[partId]} origin={origin} timeline={timeline}>
        {React.cloneElement(ear, { fill: paintOf(partId), stroke, strokeWidth: 0.1 })}
        {/* Bagian dalam telinga: bayangan gelap tipis, jadi cocok di warna dasar apa pun */}
        <ellipse cx={ex} cy={ey - 2} rx={9} ry={7} fill="#000000" opacity={0.22} transform={`rotate(${tilt}, ${ex}, ${ey})`} />
        {tint(ear)}
      </MovingPart>
    );
  };

  // Jeruk di atas kepala (warna tetap), daun ikut bergerak bersama jeruk
  const orangeOrigin = originOf("orange");
  const ox = orangeOrigin.x;
  const oy = orangeOrigin.y - 14;
  const orangeR = 19;
  const orange = <circle cx={ox} cy={oy} r={orangeR} />;

  return (
    <>
      <defs>
        <radialGradient id="capybaraOrangeGrad" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#FFD08A" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
      </defs>

      {renderEar("earL", -1)}
      {renderEar("earR", 1)}

      <path d={bodyPath} fill={paintOf("body")} stroke={stroke} strokeWidth={0.1} />

      {/* Moncong & lubang hidung (warna tetap, bayangan tipis supaya cocok di warna apa pun) */}
      <ellipse cx={cx} cy={cy + 0.3 * ry} rx={0.42 * rx} ry={0.3 * ry} fill="#000000" opacity={0.1} />
      <ellipse cx={cx - 12} cy={cy + 0.22 * ry} rx={4} ry={3} fill="#3B2412" opacity={0.75} />
      <ellipse cx={cx + 12} cy={cy + 0.22 * ry} rx={4} ry={3} fill="#3B2412" opacity={0.75} />

      <MovingPart motionId={partMotions.orange} origin={orangeOrigin} timeline={timeline} filter="url(#dropShadowFilter)">
        {React.cloneElement(orange, { fill: "url(#capybaraOrangeGrad)" })}
        {/* Kilau jeruk */}
        <ellipse cx={ox - 6} cy={oy - 7} rx={5} ry={3} fill="#FFFFFF" opacity={0.6} transform={`rotate(-30, ${ox - 6}, ${oy - 7})`} />
        {/* Tangkai & daun */}
        <path d={`M ${ox} ${oy - orangeR + 1} L ${ox + 1} ${oy - orangeR - 5}`} stroke="#65A30D" strokeWidth={2.5} strokeLinecap="round" />
        <path
          d={`M ${ox + 1} ${oy - orangeR - 4} C ${ox + 7} ${oy - orangeR - 14}, ${ox + 19} ${oy - orangeR - 15}, ${ox + 24} ${oy - orangeR - 10} C ${ox + 18} ${oy - orangeR - 3}, ${ox + 8} ${oy - orangeR - 2}, ${ox + 1} ${oy - orangeR - 4} Z`}
          fill="#22C55E"
        />
        {tint(orange)}
      </MovingPart>
    </>
  );
}
