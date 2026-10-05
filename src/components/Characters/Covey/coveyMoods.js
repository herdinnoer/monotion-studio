// src/components/Characters/Covey/coveyMoods.js

export const coveyMoods = {
  idle: {
    name: "Idle",
    description: "Just chilling",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "normal",
    mouth: "neutral",
    particles: null,
  },

  happy: {
    name: "Happy",
    description: "Big smile",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "closed",
    mouth: "laughing",
    particles: { type: "stars", count: 4 },
  },

  smile: {
    name: "Smile",
    description: "Friendly",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "normal",
    mouth: "smile",
    particles: null,
  },

  thinking: {
    name: "Thinking",
    description: "Contemplating",
    animationState: { scale: 1, y: 2, rotateZ: 0 },
    duration: 2.5,
    eyeConfig: "normal",
    mouth: "neutral",
    particles: { type: "thinking-dots", count: 3 },
  },

  sad: {
    name: "Sad",
    description: "Unhappy",
    animationState: { scale: 0.95, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "worried",
    mouth: "sad",
    particles: null,
  },

  crying: {
    name: "Crying",
    description: "Very sad",
    animationState: { scale: 0.9, y: 0, rotateZ: 0 },
    duration: 2.5,
    eyeConfig: "crying",
    mouth: "tongueCry",
    particles: null,
  },

  tears: {
    name: "Tears",
    description: "Emotional",
    animationState: { scale: 0.95, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "tears",
    mouth: "sad",
    particles: null,
  },

  surprised: {
    name: "Surprised",
    description: "Wow!",
    animationState: { scale: 1.05, y: -2, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "surprised",
    mouth: "surprised",
    particles: { type: "stars", count: 3 },
  },

  angry: {
    name: "Angry",
    description: "Mad",
    animationState: { scale: 0.95, y: 0, rotateZ: -3 },
    duration: 1.8,
    eyeConfig: "angry",
    mouth: "sad",
    particles: null,
  },

  xEyes: {
    name: "Dead",
    description: "Totally lost",
    animationState: { scale: 0.9, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "xEyes",
    mouth: "numberSign",
    particles: null,
  },

  dizzy: {
    name: "Dizzy",
    description: "Spinning",
    animationState: { scale: 1, y: 0, rotateZ: 360 },
    duration: 2,
    eyeConfig: "spiral",
    mouth: "number3",
    particles: null,
  },

  hearts: {
    name: "Love",
    description: "In love",
    animationState: { scale: 1.05, y: -1, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "hearts",
    mouth: "smile",
    particles: { type: "hearts", count: 5 },
  },

  wink: {
    name: "Wink",
    description: "Cheeky",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "wink",
    mouth: "smile",
    particles: null,
  },

  innocent: {
    name: "Innocent",
    description: "Who me?",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "innocent",
    mouth: "smile",
    particles: null,
  },

  tongue: {
    name: "Tongue",
    description: "Playful",
    animationState: { scale: 1.05, y: 0, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "closed",
    mouth: "tongue",
    particles: null,
  },

  sunglasses: {
    name: "Cool",
    description: "Cool as ice",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "sunglasses",
    mouth: "smile",
    particles: { type: "stars", count: 2 },
  },

  lookLeft: {
    name: "Look Left",
    description: "Glancing",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "lookLeft",
    mouth: "neutral",
    particles: null,
  },

  lookRight: {
    name: "Look Right",
    description: "Glancing",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "lookRight",
    mouth: "neutral",
    particles: null,
  },

  working: {
    name: "Working",
    description: "Focused",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "normal",
    mouth: "smile",
    particles: { type: "thinking-dots", count: 2 },
  },

  loading: {
    name: "Loading",
    description: "Processing...",
    animationState: { scale: 1, y: 0, rotateZ: 0 },
    duration: 2,
    eyeConfig: "normal",
    mouth: "neutral",
    particles: { type: "thinking-dots", count: 4 },
  },

  finished: {
    name: "Finished",
    description: "Done!",
    animationState: { scale: 1.1, y: -3, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "closed",
    mouth: "bigSmile",
    particles: { type: "stars", count: 6 },
  },

  error: {
    name: "Error",
    description: "Something broke",
    animationState: { scale: 0.9, y: 0, rotateZ: 0 },
    duration: 1.5,
    eyeConfig: "xEyes",
    mouth: "sad",
    particles: { type: "stars", count: 2 },
  },
};

export default coveyMoods;
