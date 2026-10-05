// src/components/Characters/Covey/CoveyCharacter.jsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CoveyEyes, CoveyNose, CoveyMouth, CoveyParticles } from './CoveyExpressions';
import { coveyMoods } from './coveyMoods';
import coveyConfig from './coveyConfig';

/**
 * Generate Superellipse Path untuk TWS-like shape
 * Formula: |x/rx|^n + |y/ry|^n = 1
 */
const generateSuperellipsePath = (centerX, centerY, rx, ry, n = 2.7, segments = 256) => {
  let pathData = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    
    // Parametric superellipse
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    
    const x = centerX + rx * Math.sign(cosA) * Math.pow(Math.abs(cosA), 2 / n);
    const y = centerY + ry * Math.sign(sinA) * Math.pow(Math.abs(sinA), 2 / n);

    pathData.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return pathData.join(' ') + ' Z';
};

/**
 * Covey Character Component
 */
export const CoveyCharacter = ({
  mood = 'idle',
  color = '#3B82F6',
  backgroundColor = '#F0F4F8',
  text = '',
  scale = 1,
}) => {
  const moodData = coveyMoods[mood] || coveyMoods.idle;
  const duration = moodData.duration || 2;

  // Superellipse path (TWS-like shape)
  const bodyPath = useMemo(() => {
    return generateSuperellipsePath(
      100,  // centerX
      100,  // centerY
      70,   // rx (width)
      85,   // ry (height)
      2.7   // n (superellipse parameter)
    );
  }, []);

  // Darker shade untuk gradient
  const darkerColor = `color-mix(in srgb, ${color} 85%, black)`;

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      style={{ maxWidth: '300px', maxHeight: '300px' }}
    >
      <defs>
        {/* Radial gradient untuk depth */}
        <radialGradient id="bodyGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={darkerColor} stopOpacity="0.9" />
        </radialGradient>

        {/* Shadow under character */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      {/* Shadow ellipse */}
      <ellipse
        cx="100"
        cy="175"
        rx="60"
        ry="12"
        fill="black"
        opacity="0.12"
        filter="url(#shadow)"
      />

      {/* Main Body - Superellipse dengan gradient */}
      <motion.path
        d={bodyPath}
        fill="url(#bodyGradient)"
        stroke={darkerColor}
        strokeWidth="1"
        animate={{
          scale: moodData.animationState?.scale || 1,
          y: moodData.animationState?.y || 0,
          rotateZ: moodData.animationState?.rotateZ || 0,
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Render Components */}
      <CoveyEyes
        leftPos={moodData.eyePosition?.left || { x: 65, y: 80 }}
        rightPos={moodData.eyePosition?.right || { x: 135, y: 80 }}
        eyeConfig={moodData.eyeConfig || 'normal'}
        eyeColor="#000"
      />

      <CoveyNose pos={{ x: 100, y: 105 }} color="#000" />

      <CoveyMouth
        mood={moodData.mouth || 'neutral'}
        color="#000"
      />

      <CoveyParticles
        type={moodData.particles?.type || null}
        count={moodData.particles?.count || 0}
      />

      {/* Text below character */}
      {text && (
        <text
          x="100"
          y="175"
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill="#1F2937"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {text}
        </text>
      )}
    </svg>
  );
};

export default CoveyCharacter;