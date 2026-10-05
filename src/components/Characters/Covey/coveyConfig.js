// src/components/Characters/Covey/coveyConfig.js

export const COVEY_CONFIG = {
  id: 'covey',
  name: 'Covey',
  description: 'Cute round mascot with expressive features',
  version: '2.0',

  // Shape parameters
  shape: {
    type: 'superellipse',
    rx: 80,
    ry: 90,
    n: 2.7,
  },

  // Color Palette System
  colorPalettes: {
    default: {
      name: 'Default',
      primary: '#FFFFFF',
      accent: '#00D9FF',
    },
    sky: {
      name: 'Sky',
      primary: '#87CEEB',
      accent: '#1E90FF',
    },
    lavender: {
      name: 'Lavender',
      primary: '#E6D9FF',
      accent: '#B5A7E8',
    },
    coral: {
      name: 'Coral',
      primary: '#FFB3A7',
      accent: '#FF6B6B',
    },
    mint: {
      name: 'Mint',
      primary: '#B0E8D8',
      accent: '#52C41A',
    },
    peach: {
      name: 'Peach',
      primary: '#FFD9B3',
      accent: '#FF9C6E',
    },
    cream: {
      name: 'Cream',
      primary: '#FFF4E6',
      accent: '#FF8C00',
    },
  },

  // Style configuration
  defaultStyle: {
    eyeColor: '#000000',
    eyeSize: 10,
    eyeShineColor: '#FFFFFF',
    mouthColor: '#000000',
    mouthWidth: 2.5,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowBlur: 25,
  },

  // Accessories system
  accessories: {
    hat: {
      types: ['none', 'santa', 'party', 'wizard', 'beanie'],
    },
    glasses: {
      types: ['none', 'sunglasses', 'nerd-glasses'],
    },
    badge: {
      types: ['none', 'star', 'check', 'fire'],
    },
  },

  // Customizable properties
  customizable: {
    color: true,
    backgroundColor: true,
    textColor: true,
    accessories: true,
  },

  // Available moods
  availableMoods: [
    'idle',
    'working',
    'thinking',
    'searching',
    'approval',
    'question',
    'error',
    'ratelimit',
    'sleeping',
    'dizzy',
    'finished',
    'uploading',
    'dancing',
    'loveStruck',
  ],
};