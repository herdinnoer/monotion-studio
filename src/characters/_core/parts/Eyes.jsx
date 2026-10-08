"use client";

import React from "react";
import { motion } from "framer-motion";
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
//
// Gambar mata memakai gradient "eyeGloss" & filter "eyeHighlightBloom" dari <defs> karakter.
export function Eyes({
  variant = "round",
  leftX,
  rightX,
  y: baseY,
  isBlinking = false,
  eyeTrackX,
  eyeTrackY,
  p = 0,
}) {
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
        <text x={leftX} y={baseY + 6} fontSize="17" textAnchor="middle" fill="#FFFFFF">❤️</text>
        <circle cx={rightX} cy={baseY} r={17} fill="#BE123C" />
        <text x={rightX} y={baseY + 6} fontSize="17" textAnchor="middle" fill="#FFFFFF">❤️</text>
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
