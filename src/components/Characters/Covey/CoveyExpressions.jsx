// src/components/Characters/Covey/CoveyExpressions.jsx

import React from 'react';
import { motion } from 'framer-motion';

/**
 * MOUTH SHAPES - All variations
 */
export const MOUTH_SHAPES = {
  // Basic
  neutral: { type: 'line', d: 'M 85 120 L 115 120', stroke: '#000' },
  smile: { type: 'path', d: 'M 75 118 Q 100 128 125 118', fill: '#FF6B9D' },
  bigSmile: { type: 'path', d: 'M 65 115 Q 100 135 135 115', fill: '#FF6B9D' },
  laughing: { type: 'path', d: 'M 60 110 Q 100 145 140 110', fill: '#FF6B9D' },
  
  // Surprise
  surprised: { type: 'circle', cx: 100, cy: 120, r: 10, fill: '#FF6B9D' },
  
  // Sad/Cry
  sad: { type: 'path', d: 'M 65 135 Q 100 110 135 135', fill: '#FF6B9D' },
  crying: { type: 'combined', mouth: 'sad', hasTears: true },
  
  // Tongue
  tongue: { type: 'combined', mouth: 'smile', hasTongue: true },
  tongueCry: { type: 'combined', mouth: 'crying', hasTongue: true },
  
  // Closed/Number 3
  number3: { type: 'path', d: 'M 100 105 Q 115 110 100 120 Q 115 120 100 125', fill: 'none', stroke: '#000', strokeWidth: '2' },
  
  // Number sign
  numberSign: { type: 'text', text: '3', x: 100, y: 125, fontSize: '20', fill: '#000' },
};

/**
 * EYE CONFIGURATIONS - All types
 */
export const EYE_CONFIGS = {
  // Normal eyes
  normal: {
    eyeType: 'open',
    pupilSize: 5,
    pupilColor: '#000',
    eyebrowAngle: 0,
    eyebrowStyle: 'straight',
  },

  // Closed/Happy
  closed: {
    eyeType: 'closed',
    eyebrowAngle: -15,
    eyebrowStyle: 'curved',
  },

  // Hearts
  hearts: {
    eyeType: 'hearts',
  },

  // Tears
  tears: {
    eyeType: 'tears',
    pupilSize: 5,
    eyebrowAngle: 15,
    eyebrowStyle: 'worried',
  },

  // Crying
  crying: {
    eyeType: 'crying',
    pupilSize: 4,
    hasTears: true,
    tearsCount: 2,
    eyebrowAngle: 20,
    eyebrowStyle: 'worried',
  },

  // Spiral (Dizzy)
  spiral: {
    eyeType: 'spiral',
    eyebrowAngle: 0,
    eyebrowStyle: 'dizzy',
  },

  // X eyes (dead/confused)
  xEyes: {
    eyeType: 'x-eyes',
    eyebrowAngle: 25,
    eyebrowStyle: 'angry',
  },

  // Surprised
  surprised: {
    eyeType: 'round',
    pupilSize: 7,
    eyebrowAngle: -30,
    eyebrowStyle: 'surprised',
  },

  // Angry
  angry: {
    eyeType: 'open',
    pupilSize: 5,
    eyebrowAngle: 30,
    eyebrowStyle: 'angry',
  },

  // Innocent/Cute
  innocent: {
    eyeType: 'open',
    pupilSize: 6,
    eyebrowAngle: -20,
    eyebrowStyle: 'innocent',
  },

  // Wink
  wink: {
    eyeType: 'wink',
    eyebrowAngle: -10,
    eyebrowStyle: 'straight',
  },

  // Sunglasses
  sunglasses: {
    eyeType: 'sunglasses',
  },

  // Look left
  lookLeft: {
    eyeType: 'open',
    pupilSize: 5,
    pupilOffset: { x: -4 },
    eyebrowAngle: 0,
  },

  // Look right
  lookRight: {
    eyeType: 'open',
    pupilSize: 5,
    pupilOffset: { x: 4 },
    eyebrowAngle: 0,
  },
};

/**
 * EYEBROW STYLES
 */
const EYEBROW_STYLES = {
  straight: (pos, angle) => ({
    x1: pos.x - 10,
    y1: pos.y - 12,
    x2: pos.x + 10,
    y2: pos.y - 12,
    angle,
  }),

  curved: (pos, angle) => ({
    d: `M ${pos.x - 10} ${pos.y - 12} Q ${pos.x} ${pos.y - 16} ${pos.x + 10} ${pos.y - 12}`,
    angle,
    type: 'path',
  }),

  angry: (pos, angle) => ({
    d: `M ${pos.x - 10} ${pos.y - 8} Q ${pos.x} ${pos.y - 14} ${pos.x + 10} ${pos.y - 16}`,
    angle: angle + 10,
    type: 'path',
  }),

  worried: (pos, angle) => ({
    d: `M ${pos.x - 10} ${pos.y - 16} Q ${pos.x} ${pos.y - 10} ${pos.x + 10} ${pos.y - 14}`,
    angle,
    type: 'path',
  }),

  innocent: (pos, angle) => ({
    d: `M ${pos.x - 10} ${pos.y - 14} Q ${pos.x} ${pos.y - 18} ${pos.x + 10} ${pos.y - 14}`,
    angle,
    type: 'path',
  }),

  dizzy: (pos) => ({
    type: 'spiral',
    cx: pos.x,
    cy: pos.y - 12,
    r: 6,
  }),

  surprised: (pos, angle) => ({
    d: `M ${pos.x - 8} ${pos.y - 18} Q ${pos.x} ${pos.y - 20} ${pos.x + 8} ${pos.y - 18}`,
    angle,
    type: 'path',
  }),
};

/**
 * Render Eyebrow
 */
const RenderEyebrow = ({ pos, angle, style = 'straight' }) => {
  const eyebrow = EYEBROW_STYLES[style]?.(pos, angle) || EYEBROW_STYLES.straight(pos, angle);

  if (eyebrow.type === 'path') {
    return (
      <path
        d={eyebrow.d}
        stroke="#000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transformOrigin: `${pos.x}px ${pos.y - 12}px` }}
      />
    );
  }

  if (eyebrow.type === 'spiral') {
    return (
      <circle
        cx={eyebrow.cx}
        cy={eyebrow.cy}
        r={eyebrow.r}
        fill="none"
        stroke="#000"
        strokeWidth="2"
        style={{
          animation: 'spin 2s linear infinite',
        }}
      />
    );
  }

  // Default line
  return (
    <line
      x1={eyebrow.x1}
      y1={eyebrow.y1}
      x2={eyebrow.x2}
      y2={eyebrow.y2}
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transformOrigin: `${pos.x}px ${pos.y - 12}px` }}
    />
  );
};

/**
 * Render Eye
 */
const RenderEye = ({ pos, config }) => {
  const baseEyeRadius = 12;

  // Hearts
  if (config.eyeType === 'hearts') {
    return (
      <text x={pos.x} y={pos.y + 3} fontSize="14" textAnchor="middle">
        ❤️
      </text>
    );
  }

  // X Eyes
  if (config.eyeType === 'x-eyes') {
    return (
      <>
        <line x1={pos.x - 8} y1={pos.y - 8} x2={pos.x + 8} y2={pos.y + 8} stroke="#000" strokeWidth="2.5" />
        <line x1={pos.x - 8} y1={pos.y + 8} x2={pos.x + 8} y2={pos.y - 8} stroke="#000" strokeWidth="2.5" />
      </>
    );
  }

  // Spiral/Dizzy
  if (config.eyeType === 'spiral') {
    return (
      <circle
        cx={pos.x}
        cy={pos.y}
        r={baseEyeRadius}
        fill="#000"
        stroke="#000"
        strokeWidth="2"
        style={{
          animation: 'spin 2s linear infinite',
        }}
      />
    );
  }

  // Wink
  if (config.eyeType === 'wink') {
    return (
      <path
        d={`M ${pos.x - 8} ${pos.y} Q ${pos.x} ${pos.y + 2} ${pos.x + 8} ${pos.y}`}
        stroke="#000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  // Sunglasses (dark circle)
  if (config.eyeType === 'sunglasses') {
    return (
      <circle cx={pos.x} cy={pos.y} r={baseEyeRadius} fill="#333" stroke="#000" strokeWidth="2" />
    );
  }

  // Closed
  if (config.eyeType === 'closed') {
    return (
      <path
        d={`M ${pos.x - 8} ${pos.y} Q ${pos.x} ${pos.y + 3} ${pos.x + 8} ${pos.y}`}
        stroke="#000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  // Crying
  if (config.eyeType === 'crying') {
    return (
      <>
        {/* Eye */}
        <circle cx={pos.x} cy={pos.y} r={baseEyeRadius} fill="white" stroke="#000" strokeWidth="2" />
        <circle
          cx={pos.x + (config.pupilOffset?.x || 0)}
          cy={pos.y}
          r={config.pupilSize || 5}
          fill="#000"
        />
        {/* Tears */}
        {Array.from({ length: config.tearsCount || 2 }).map((_, i) => (
          <motion.path
            key={i}
            d={`M ${pos.x} ${pos.y + baseEyeRadius + 2} Q ${pos.x + 2} ${pos.y + baseEyeRadius + 15} ${pos.x} ${pos.y + baseEyeRadius + 25}`}
            stroke="#87CEEB"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              strokeDashoffset: [0, 20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        ))}
      </>
    );
  }

  // Tears (without crying expression)
  if (config.eyeType === 'tears') {
    return (
      <>
        <circle cx={pos.x} cy={pos.y} r={baseEyeRadius} fill="white" stroke="#000" strokeWidth="2" />
        <circle cx={pos.x} cy={pos.y} r={config.pupilSize || 5} fill="#000" />
        {/* Tear drop */}
        <path
          d={`M ${pos.x} ${pos.y + baseEyeRadius + 2} L ${pos.x - 2} ${pos.y + baseEyeRadius + 12} L ${pos.x + 2} ${pos.y + baseEyeRadius + 12} Z`}
          fill="#87CEEB"
        />
      </>
    );
  }

  // Default open eye
  return (
    <>
      <circle cx={pos.x} cy={pos.y} r={baseEyeRadius} fill="#000" stroke="#000" strokeWidth="2" />
      <circle
        cx={pos.x + (config.pupilOffset?.x || 0)}
        cy={pos.y}
        r={config.pupilSize || 5}
        fill={config.pupilColor || 'white'}
      />
      <circle cx={pos.x - 2} cy={pos.y - 2} r="2" fill="white" opacity="0.2" />
    </>
  );
};

/**
 * Covey Eyes Component
 */
export const CoveyEyes = ({
  leftPos = { x: 65, y: 80 },
  rightPos = { x: 135, y: 80 },
  eyeConfig = 'normal',
  eyeColor = '#000',
}) => {
  const config = EYE_CONFIGS[eyeConfig] || EYE_CONFIGS.normal;

  return (
    <>
      {/* LEFT EYEBROW */}
      <RenderEyebrow pos={leftPos} angle={config.eyebrowAngle || 0} style={config.eyebrowStyle || 'straight'} />

      {/* LEFT EYE */}
      <RenderEye pos={leftPos} config={config} />

      {/* RIGHT EYEBROW */}
      <RenderEyebrow pos={rightPos} angle={config.eyebrowAngle || 0} style={config.eyebrowStyle || 'straight'} />

      {/* RIGHT EYE */}
      <RenderEye pos={rightPos} config={config} />
    </>
  );
};

/**
 * Covey Nose
 */
export const CoveyNose = ({
  pos = { x: 100, y: 105 },
  color = '#000',
}) => {
  return (
    <polygon
      points={`${pos.x},${pos.y - 5} ${pos.x - 4},${pos.y + 3} ${pos.x + 4},${pos.y + 3}`}
      fill={color}
    />
  );
};

/**
 * Covey Mouth
 */
export const CoveyMouth = ({
  mood = 'neutral',
  color = '#000',
}) => {
  const mouth = MOUTH_SHAPES[mood] || MOUTH_SHAPES.neutral;

  // Line mouth
  if (mouth.type === 'line') {
    return <line x1={mouth.d.split(' ')[1]} y1={mouth.d.split(' ')[2]} x2={mouth.d.split(' ')[4]} y2={mouth.d.split(' ')[5]} stroke={mouth.stroke} strokeWidth="2" strokeLinecap="round" />;
  }

  // Path mouth
  if (mouth.type === 'path') {
    return (
      <path
        d={mouth.d}
        fill={mouth.fill || 'none'}
        stroke={mouth.stroke || color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  // Circle mouth (surprise)
  if (mouth.type === 'circle') {
    return <circle cx={mouth.cx} cy={mouth.cy} r={mouth.r} fill={mouth.fill} stroke="#000" strokeWidth="1.5" />;
  }

  // Combined (tears + tongue)
  if (mouth.type === 'combined') {
    const baseMouth = MOUTH_SHAPES[mouth.mouth] || MOUTH_SHAPES.smile;
    return (
      <>
        {/* Base mouth */}
        <path
          d={baseMouth.d}
          fill={baseMouth.fill || 'none'}
          stroke={baseMouth.stroke || color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tongue if hasTongue */}
        {mouth.hasTongue && (
          <ellipse cx="100" cy="135" rx="8" ry="12" fill="#FF8FA3" stroke="#000" strokeWidth="1" />
        )}

        {/* Tears if hasTears */}
        {mouth.hasTears && (
          <>
            <path d="M 85 135 L 83 150" stroke="#87CEEB" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 115 135 L 117 150" stroke="#87CEEB" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </>
    );
  }

  // Text mouth (3)
  if (mouth.type === 'text') {
    return (
      <text x={mouth.x} y={mouth.y} fontSize={mouth.fontSize} textAnchor="middle" fill={mouth.fill} fontWeight="bold">
        {mouth.text}
      </text>
    );
  }

  return null;
};

/**
 * Covey Particles
 */
export const CoveyParticles = ({ type = null, count = 0 }) => {
  if (!type || count === 0) return null;

  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const distance = 80;
    const x = 100 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;

    switch (type) {
      case 'thinking-dots':
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="#FFD700"
            animate={{
              scale: [1, 0.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        );

      case 'stars':
        return (
          <motion.text
            key={i}
            x={x}
            y={y}
            fontSize="16"
            textAnchor="middle"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            ✨
          </motion.text>
        );

      case 'hearts':
        return (
          <motion.text
            key={i}
            x={x}
            y={y}
            fontSize="16"
            textAnchor="middle"
            animate={{
              y: [y, y - 30],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            ❤️
          </motion.text>
        );

      default:
        return null;
    }
  });

  return particles;
};