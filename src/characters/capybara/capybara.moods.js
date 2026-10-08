// Daftar resmi mood Capybara (sumber tunggal, versi sederhana: 3 mood).
// Format sama dengan mochi.moods.js — lihat penjelasan tiap kunci di sana.
// Tambahan untuk Capybara:
//   parts — gerakan bagian bergerak: earL, earR (telinga), orange (jeruk)

import { MOTIONS } from "../_core/motions";
import { capybaraConfig } from "./capybara.config";

// Semua mood Capybara pakai napas (float), jadi durasinya ikut napas.
const FLOAT_MS = MOTIONS.float.durationMs;

export const capybaraMoods = [
  { id: "idle", label: "Idle", durationMs: FLOAT_MS },
  { id: "sleeping", label: "Sleeping", durationMs: FLOAT_MS, tint: "purple",
    eyes: "sleepy", blink: false, blush: "none", particles: "zzz",
    parts: { earL: "droop", earR: "droop" } },
  { id: "love", label: "Love", durationMs: FLOAT_MS, tint: "pink", glow: "pink",
    eyes: "hearts", badge: { type: "heart", color: "rose" }, parts: { orange: "bounce" } },
];

// Data lengkap 1 mood. Mood tak dikenal pakai mood default.
export function getCapybaraMood(moodId) {
  return (
    capybaraMoods.find((m) => m.id === moodId) ??
    capybaraMoods.find((m) => m.id === capybaraConfig.defaultMood)
  );
}
