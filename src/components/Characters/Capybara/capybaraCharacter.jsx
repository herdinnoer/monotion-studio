import React from 'react';
import CapybaraExpressions from './CapybaraExpressions';
import { CAPYBARA_DEFAULT_CONFIG } from './capybaraConfig';

export default function CapybaraCharacter({
  mood = 'idle',
  primaryColor = CAPYBARA_DEFAULT_CONFIG.primaryColor,
  size = CAPYBARA_DEFAULT_CONFIG.defaultSize,
  className = ''
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient Badan Capybara */}
          <radialGradient id="capyBodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFB356" />
            <stop offset="70%" stopColor={primaryColor} />
            <stop offset="100%" stopColor="#E57E1B" />
          </radialGradient>

          {/* Gradient Moncong */}
          <linearGradient id="snoutGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F08032" />
            <stop offset="100%" stopColor="#D96316" />
          </linearGradient>

          {/* Gradient Buah Jeruk */}
          <radialGradient id="orangeGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFA633" />
            <stop offset="60%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#CC5200" />
          </radialGradient>
        </defs>

        {/* 1. TELINGA KIRI & KANAN */}
        <g id="ears">
          {/* Telinga Kiri */}
          <path
            d="M 42 62 C 32 45, 52 40, 58 58 Z"
            fill="url(#capyBodyGrad)"
            stroke="#D96316"
            strokeWidth="1.5"
          />
          <path d="M 44 60 C 38 48, 50 45, 54 57 Z" fill="#C45108" opacity="0.4" />

          {/* Telinga Kanan */}
          <path
            d="M 158 62 C 168 45, 148 40, 142 58 Z"
            fill="url(#capyBodyGrad)"
            stroke="#D96316"
            strokeWidth="1.5"
          />
          <path d="M 156 60 C 162 48, 150 45, 146 57 Z" fill="#C45108" opacity="0.4" />
        </g>

        {/* 2. KEPALA UTAMA (Bentuk Khas Capybara Agak Membulat Lebar) */}
        <path
          d="M 38 110 C 32 60, 168 60, 162 110 C 167 165, 33 165, 38 110 Z"
          fill="url(#capyBodyGrad)"
        />

        {/* 3. JERUK MANDARIN DI ATAS KEPALA */}
        <g id="head-mandarin-orange">
          {/* Batang Daun */}
          <path d="M 100 24 L 100 29" stroke="#3D2005" strokeWidth="2.5" strokeLinecap="round" />
          {/* Daun Hijau */}
          <path
            d="M 100 25 C 112 18, 116 26, 104 29 Z"
            fill="#52C41A"
            stroke="#2F8807"
            strokeWidth="1"
          />
          {/* Buah Jeruk */}
          <circle cx="100" cy="38" r="16" fill="url(#orangeGrad)" />
          {/* Highlight Kilau Jeruk */}
          <ellipse cx="95" cy="32" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.5" />
        </g>

        {/* 4. PIPI MERAH MERONA (BLUSH) */}
        <g id="blush-cheeks">
          <ellipse cx="46" cy="118" rx="12" ry="9" fill="#FF5277" opacity="0.65" />
          <ellipse cx="154" cy="118" rx="12" ry="9" fill="#FF5277" opacity="0.65" />
        </g>

        {/* 5. MONCONG & LUBANG HIDUNG (SNOUT) */}
        <g id="snout">
          {/* Area Oval Moncong */}
          <ellipse cx="100" cy="118" rx="22" ry="15" fill="url(#snoutGrad)" />

          {/* Hidung & Dua Lubang Hidung */}
          <path
            d="M 96 112 C 96 109, 104 109, 104 112 C 104 116, 96 116, 96 112 Z"
            fill="#4B2108"
          />
          <ellipse cx="95" cy="115" rx="2" ry="3" fill="#221108" />
          <ellipse cx="105" cy="115" rx="2" ry="3" fill="#221108" />
          {/* Garis Tengah Vertikal Hidung */}
          <line x1="100" y1="115" x2="100" y2="123" stroke="#4B2108" strokeWidth="2.5" />
        </g>

        {/* 6. EKSPRESI DYNAMIC (MATA, MULUT, EFEK) */}
        <CapybaraExpressions mood={mood} />
      </svg>
    </div>
  );
}