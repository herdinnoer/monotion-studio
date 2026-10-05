import { create } from "zustand";
import { temporal } from 'zundo';

export const useAnimationStore = create((set) => ({
  // Current project state
  selectedTemplate: null,
  backgroundColor: "#ffffff",
  animationColor: "#0a84ff",
  textContent: "Your Text Here",
  textFont: "Arial",
  textSize: 24,
  textColor: "#000000",
  duration: 5, // seconds
  frameSize: "16:9",

  // Actions (functions)
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setAnimationColor: (color) => set({ animationColor: color }),
  setTextContent: (text) => set({ textContent: text }),
  setDuration: (duration) => set({ duration: duration }),
  // ... etc
}));
