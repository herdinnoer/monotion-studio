"use client";

import React from "react";
import { mochiConfig } from "./mochi.config";
import { MovingPart } from "../_core/MovingPart";

const { parts } = mochiConfig;

// Badan Mochi + tangan, digambar dari belakang ke depan.
//
// - baseFill:  isi untuk bagian ber-paint "base" (ikut warna dasar user)
// - partMotions: gerakan bagian bergerak dari mood, misalnya { arm: "wave" }
//
// Bagian yang ditandai paint "base" di mochi.config.js memakai baseFill,
// jadi tangan selalu sewarna dengan badan.
export function MochiBody({ bodyPath, cx, cy, rx, ry, baseFill, stroke, partMotions = {}, timeline }) {
  const paintOf = (partId) => (parts[partId].paint === "base" ? baseFill : undefined);

  return (
    <>
      {partMotions.arm && (
        <MovingPart
          motionId={partMotions.arm}
          origin={{ x: cx + parts.arm.origin.x * rx, y: cy + parts.arm.origin.y * ry }}
          timeline={timeline}
          filter="url(#dropShadowFilter)"
        >
          <path
            d={`M ${cx + rx * 0.70} ${cy - 8}
               C ${cx + rx * 1.05} ${cy - 28}, ${cx + rx * 1.28} ${cy - 16}, ${cx + rx * 1.28} ${cy + 5}
               C ${cx + rx * 1.28} ${cy + 22}, ${cx + rx * 1.05} ${cy + 24}, ${cx + rx * 0.70} ${cy + 16} Z`}
            fill={paintOf("arm")}
          />
          {/* Kilau di tangan (warna tetap, bukan bagian dari warna dasar) */}
          <ellipse
            cx={cx + rx * 1.08}
            cy={cy - 2}
            rx={10}
            ry={5}
            fill="#FFFFFF"
            opacity={0.55}
            transform={`rotate(-22, ${cx + rx * 1.08}, ${cy - 2})`}
          />
        </MovingPart>
      )}

      <path d={bodyPath} fill={paintOf("body")} stroke={stroke} strokeWidth={0.1} />
    </>
  );
}
