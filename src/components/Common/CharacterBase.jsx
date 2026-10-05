// src/components/Common/CharacterBase.jsx

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const CharacterBase = ({
  id = 'character',
  mood = 'idle',
  color = '#ffffff',
  text = '',
  size = 200,
  backgroundColor = 'transparent',
  children, // SVG content
  animationState = {},
  duration = 1,
  loop = true,
  showText = true
}) => {
  return (
    <motion.div
      className="character-container"
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      animate={animationState}
      transition={{
        duration,
        repeat: loop ? Infinity : 0,
        repeatType: 'loop'
      }}
    >
      {/* SVG Character */}
      <svg
        viewBox="0 0 200 200"
        className="character-svg"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))'
        }}
      >
        {children}
      </svg>

      {/* Text Display */}
      {showText && text && (
        <motion.div
          className="character-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: -40,
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: 500,
            color: '#333'
          }}
        >
          {text}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CharacterBase;