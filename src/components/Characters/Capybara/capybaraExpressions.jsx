import React from 'react';
import { MOOD_DEFINITIONS } from './capybaraMoods';

export default function CapybaraExpressions({ mood = 'idle' }) {
  const config = MOOD_DEFINITIONS[mood] || MOOD_DEFINITIONS.idle;

  // Render Mata (Kiri: x=70, Kanan: x=130, y=92)
  const renderEyes = () => {
    switch (config.eyeType) {
      case 'shiny':
        return (
          <g id="eyes-shiny">
            {/* Mata Kiri */}
            <circle cx="70" cy="92" r="13" fill="#221108" />
            <circle cx="66" cy="88" r="4.5" fill="#FFFFFF" />
            <circle cx="73" cy="95" r="2" fill="#FFFFFF" />
            
            {/* Mata Kanan */}
            <circle cx="130" cy="92" r="13" fill="#221108" />
            <circle cx="126" cy="88" r="4.5" fill="#FFFFFF" />
            <circle cx="133" cy="95" r="2" fill="#FFFFFF" />
          </g>
        );

      case 'sparkle':
        return (
          <g id="eyes-sparkle">
            <circle cx="70" cy="92" r="13" fill="#221108" />
            <circle cx="66" cy="87" r="5" fill="#FFFFFF" />
            <circle cx="74" cy="96" r="2.5" fill="#FFFFFF" />
            <path d="M 68 91 L 70 87 L 72 91 L 76 93 L 72 95 L 70 99 L 68 95 L 64 93 Z" fill="#FFFFFF" opacity="0.8"/>

            <circle cx="130" cy="92" r="13" fill="#221108" />
            <circle cx="126" cy="87" r="5" fill="#FFFFFF" />
            <circle cx="134" cy="96" r="2.5" fill="#FFFFFF" />
            <path d="M 128 91 L 130 87 L 132 91 L 136 93 L 132 95 L 130 99 L 128 95 L 124 93 Z" fill="#FFFFFF" opacity="0.8"/>
          </g>
        );

      case 'hearts':
        return (
          <g id="eyes-hearts">
            <path d="M 70 86 C 65 78, 56 86, 70 98 C 84 86, 75 78, 70 86 Z" fill="#FF2A55" />
            <path d="M 130 86 C 125 78, 116 86, 130 98 C 144 86, 135 78, 130 86 Z" fill="#FF2A55" />
          </g>
        );

      case 'shocked':
        return (
          <g id="eyes-shocked">
            <circle cx="70" cy="92" r="13" fill="#FFFFFF" stroke="#3A1C08" strokeWidth="2.5" />
            <circle cx="70" cy="92" r="4" fill="#221108" />

            <circle cx="130" cy="92" r="13" fill="#FFFFFF" stroke="#3A1C08" strokeWidth="2.5" />
            <circle cx="130" cy="92" r="4" fill="#221108" />
          </g>
        );

      case 'closed_happy':
        return (
          <g id="eyes-closed-happy" stroke="#4B2108" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 58 92 Q 70 80 82 92" />
            <path d="M 118 92 Q 130 80 142 92" />
          </g>
        );

      case 'closed_down':
        return (
          <g id="eyes-closed-down" stroke="#4B2108" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 58 90 Q 70 100 82 90" />
            <path d="M 118 90 Q 130 100 142 90" />
          </g>
        );

      case 'wink':
        return (
          <g id="eyes-wink">
            {/* Mata Kiri Shiny */}
            <circle cx="70" cy="92" r="13" fill="#221108" />
            <circle cx="66" cy="88" r="4.5" fill="#FFFFFF" />
            <circle cx="73" cy="95" r="2" fill="#FFFFFF" />

            {/* Mata Kanan Wink */}
            <path d="M 118 90 Q 130 102 142 90" stroke="#4B2108" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'spirals':
        return (
          <g id="eyes-spirals" stroke="#3A1C08" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M 70 92 m -10 0 a 10 10 0 1 0 20 0 a 7 7 0 1 0 -14 0 a 4 4 0 1 0 8 0" />
            <path d="M 130 92 m -10 0 a 10 10 0 1 0 20 0 a 7 7 0 1 0 -14 0 a 4 4 0 1 0 8 0" />
          </g>
        );

      case 'droopy':
        return (
          <g id="eyes-droopy" stroke="#4B2108" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 58 88 L 82 90 Q 70 100 58 88 Z" fill="#221108" />
            <path d="M 118 90 L 142 88 Q 130 100 118 90 Z" fill="#221108" />
          </g>
        );

      case 'annoyed':
        return (
          <g id="eyes-annoyed">
            <path d="M 58 85 L 82 91 C 82 99, 58 99, 58 85 Z" fill="#221108" />
            <circle cx="72" cy="93" r="2.5" fill="#FFFFFF" />

            <path d="M 142 85 L 118 91 C 118 99, 142 99, 142 85 Z" fill="#221108" />
            <circle cx="128" cy="93" r="2.5" fill="#FFFFFF" />
          </g>
        );

      default:
        return null;
    }
  };

  // Render Alis
  const renderEyebrows = () => {
    switch (config.eyebrows) {
      case 'angry':
        return (
          <g id="eyebrows-angry" stroke="#4B2108" strokeWidth="3.5" strokeLinecap="round">
            <line x1="58" y1="78" x2="80" y2="85" />
            <line x1="142" y1="78" x2="120" y2="85" />
          </g>
        );
      case 'raised':
        return (
          <g id="eyebrows-raised" stroke="#4B2108" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 58 75 Q 70 68 82 75" />
            <path d="M 118 75 Q 130 68 142 75" />
          </g>
        );
      case 'worried':
        return (
          <g id="eyebrows-worried" stroke="#4B2108" strokeWidth="3" strokeLinecap="round">
            <line x1="58" y1="84" x2="80" y2="78" />
            <line x1="142" y1="84" x2="120" y2="78" />
          </g>
        );
      default:
        return null;
    }
  };

  // Render Mulut (Posisi Tengah di bawah hidung: x=100, y=126-136)
  const renderMouth = () => {
    switch (config.mouthType) {
      case 'smile':
        return (
          <path
            d="M 90 126 Q 95 131 100 127 Q 105 131 110 126"
            stroke="#3A1C08"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );

      case 'open_happy':
        return (
          <g id="mouth-open-happy">
            <path
              d="M 90 125 Q 100 123 110 125 C 110 138, 90 138, 90 125 Z"
              fill="#5A1A0B"
              stroke="#3A1C08"
              strokeWidth="2.5"
            />
            {/* Lidah */}
            <path d="M 93 131 C 97 127, 103 127, 107 131 C 105 136, 95 136, 93 131 Z" fill="#FF5277" />
          </g>
        );

      case 'small_o':
        return (
          <circle cx="100" cy="128" r="4.5" fill="#4B2108" />
        );

      case 'shocked_o':
        return (
          <ellipse cx="100" cy="130" rx="6" ry="9" fill="#4B2108" />
        );

      case 'tall_o':
        return (
          <ellipse cx="100" cy="132" rx="7.5" ry="11" fill="#4B2108" />
        );

      case 'neutral_line':
        return (
          <line x1="93" y1="127" x2="107" y2="127" stroke="#3A1C08" strokeWidth="3" strokeLinecap="round" />
        );

      case 'small_neutral':
        return (
          <line x1="95" y1="127" x2="105" y2="127" stroke="#3A1C08" strokeWidth="2.5" strokeLinecap="round" />
        );

      case 'tongue_out':
        return (
          <g id="mouth-tongue">
            <path d="M 90 125 Q 95 130 100 127 Q 105 130 110 125" stroke="#3A1C08" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 96 128 C 96 138, 104 138, 104 128 Z" fill="#FF5277" stroke="#3A1C08" strokeWidth="1.5" />
          </g>
        );

      case 'cross':
        return (
          <g id="mouth-cross" stroke="#3A1C08" strokeWidth="3" strokeLinecap="round">
            <line x1="94" y1="123" x2="106" y2="133" />
            <line x1="106" y1="123" x2="94" y2="133" />
          </g>
        );

      case 'yawn':
        return (
          <g id="mouth-yawn">
            <path
              d="M 88 124 C 85 142, 115 142, 112 124 Z"
              fill="#5A1A0B"
              stroke="#3A1C08"
              strokeWidth="2.5"
            />
            <path d="M 92 133 C 97 128, 103 128, 108 133 C 105 140, 95 140, 92 133 Z" fill="#FF5277" />
          </g>
        );

      case 'frown':
        return (
          <path
            d="M 90 131 Q 100 123 110 131"
            stroke="#3A1C08"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );

      default:
        return null;
    }
  };

  // Render Efek Khusus Dekoratif (Zzz, Sparkles, Swirls, Anger mark, Droplet)
  const renderEffects = () => {
    return config.effects.map((effect, index) => {
      switch (effect) {
        case 'sparkles_around':
          return (
            <g id="effect-sparkles" key={index} fill="#FFD700">
              {/* Bintang Kiri */}
              <path d="M 28 80 L 31 73 L 34 80 L 41 83 L 34 86 L 31 93 L 28 86 L 21 83 Z" />
              <path d="M 38 65 L 40 60 L 42 65 L 47 67 L 42 69 L 40 74 L 38 69 L 33 67 Z" />
              {/* Bintang Kanan */}
              <path d="M 172 80 L 169 73 L 166 80 L 159 83 L 166 86 L 169 93 L 172 86 L 179 83 Z" />
              <path d="M 162 65 L 160 60 L 158 65 L 153 67 L 158 69 L 160 74 L 162 69 L 167 67 Z" />
            </g>
          );

        case 'zzz':
          return (
            <g id="effect-zzz" key={index} fill="#7A8CA3" fontWeight="bold" fontFamily="sans-serif">
              <text x="155" y="85" fontSize="14" transform="rotate(10 155 85)">Z</text>
              <text x="167" y="70" fontSize="11" transform="rotate(15 167 70)">z</text>
            </g>
          );

        case 'zzz_triple':
          return (
            <g id="effect-zzz-triple" key={index} fill="#7A8CA3" fontWeight="bold" fontFamily="sans-serif">
              <text x="152" y="95" fontSize="13" transform="rotate(8 152 95)">Z</text>
              <text x="163" y="80" fontSize="11" transform="rotate(12 163 80)">z</text>
              <text x="173" y="66" fontSize="9" transform="rotate(16 173 66)">z</text>
            </g>
          );

        case 'dizzy_swirls':
          return (
            <g id="effect-dizzy-swirls" key={index} stroke="#4B2108" strokeWidth="2" fill="none">
              <path d="M 52 52 C 45 42, 60 38, 55 48 C 52 52, 45 48, 50 44" />
              <path d="M 148 52 C 155 42, 140 38, 145 48 C 148 52, 155 48, 150 44" />
            </g>
          );

        case 'droplet':
          return (
            <path
              key={index}
              d="M 111 135 C 111 135, 115 142, 113 145 C 111 147, 108 145, 108 142 Z"
              fill="#76D6FF"
              opacity="0.9"
            />
          );

        case 'anger_mark':
          return (
            <g id="effect-anger" key={index} stroke="#D32F2F" strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M 145 60 L 157 60 M 151 54 L 151 66" />
              <path d="M 148 56 Q 151 60 154 56 M 148 64 Q 151 60 154 64" />
            </g>
          );

        case 'hearts_sparkles':
          return (
            <g id="effect-hearts-sparkles" key={index}>
              {/* Hati Kiri & Kanan */}
              <path d="M 24 120 C 20 114, 14 120, 24 128 C 34 120, 28 114, 24 120 Z" fill="#FF4081" />
              <path d="M 176 110 C 172 104, 166 110, 176 118 C 186 110, 180 104, 176 110 Z" fill="#FF4081" />
              {/* Bintang */}
              <path d="M 32 75 L 34 70 L 36 75 L 41 77 L 36 79 L 34 84 L 32 79 L 27 77 Z" fill="#FFD700" />
              <path d="M 168 70 L 170 65 L 172 70 L 177 72 L 172 74 L 170 79 L 168 74 L 163 72 Z" fill="#FFD700" />
            </g>
          );

        default:
          return null;
      }
    });
  };

  return (
    <g id="capybara-expression">
      {renderEyebrows()}
      {renderEyes()}
      {renderMouth()}
      {renderEffects()}
    </g>
  );
}