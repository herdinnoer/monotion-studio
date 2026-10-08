// Daftar resmi mood Capybara (sumber tunggal, versi sederhana: 3 mood).
// Format sama dengan mochi.moods.js — lihat penjelasan tiap kunci di sana.
// Tambahan untuk Capybara:
//   mouth — jenis mulut (lihat _core/parts/Mouth.jsx), bawaan tanpa mulut
//   parts — gerakan bagian bergerak: earL, earR (telinga).
//           Jeruk tidak bisa digerakkan sendiri, selalu ikut gerak badan (keputusan 5.14).

import { MOTIONS } from "../_core/motions";
import { capybaraConfig } from "./capybara.config";

// Semua mood Capybara pakai napas (float), jadi durasinya ikut napas.
const FLOAT_MS = MOTIONS.float.durationMs;

export const capybaraMoods = [
  // idle dipasang lebih awal (bagian dari B18.8, dimajukan setelah B18.4)
  { id: "idle", label: "Idle", durationMs: FLOAT_MS, eyes: "iris", mouth: "w", blush: "none" },
  { id: "sleeping", label: "Sleeping", durationMs: FLOAT_MS, tint: "purple",
    eyes: "closed", mouth: "w-small", blink: false, blush: "none", particles: "zzz",
    parts: { earL: "droop", earR: "droop" } },
  { id: "love", label: "Love", durationMs: FLOAT_MS, tint: "pink", glow: "pink",
    eyes: "iris-heart", mouth: "w-wide", blush: "none" },
];

// Data lengkap 1 mood. Mood tak dikenal pakai mood default.
export function getCapybaraMood(moodId) {
  return (
    capybaraMoods.find((m) => m.id === moodId) ??
    capybaraMoods.find((m) => m.id === capybaraConfig.defaultMood)
  );
}
