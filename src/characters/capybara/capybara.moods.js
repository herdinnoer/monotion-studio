// Daftar resmi mood Capybara (sumber tunggal).
// Format sama dengan mochi.moods.js — lihat penjelasan tiap kunci di sana.
// Tambahan untuk Capybara:
//   mouth — jenis mulut (lihat _core/parts/Mouth.jsx), bawaan tanpa mulut
//   brows — jenis alis / kerutan dahi (lihat _core/parts/Brows.jsx), bawaan tanpa alis
//   parts — gerakan bagian bergerak: earL, earR (telinga).
//           Jeruk tidak bisa digerakkan sendiri, selalu ikut gerak badan (keputusan 5.14).
//   pose  — pose badan (lihat capybaraConfig.poses & _core/poses.js), bawaan bentuk asli.
//   motion — gerakan badan (preset di _core/motions.js). Semua mood Capybara pakai
//           napas (float); CapybaraMaster membacanya dari sini.

import { MOTIONS } from "../_core/motions";
import { capybaraConfig } from "./capybara.config";

// Semua mood Capybara pakai napas (float), jadi durasinya ikut napas.
const FLOAT_MS = MOTIONS.float.durationMs;

export const capybaraMoods = [
  // idle dipasang lebih awal (bagian dari B18.8, dimajukan setelah B18.4)
  { id: "idle", label: "Idle", motion: "float", durationMs: FLOAT_MS, eyes: "iris", mouth: "w", blush: "none" },
  { id: "sleeping", label: "Sleeping", motion: "float", durationMs: FLOAT_MS, tint: "purple",
    eyes: "closed", mouth: "w-small", blink: false, blush: "none", particles: "zzz-bold",
    parts: { earL: "droop", earR: "droop" } },
  { id: "love", label: "Love", motion: "float", durationMs: FLOAT_MS, tint: "pink", glow: "pink",
    eyes: "iris-heart", mouth: "w-wide", blush: "none" },
  // annoyed dipasang lebih awal (bagian dari B18.8, dimajukan ke B18.5) supaya alis bisa
  // dicek di halaman pembanding
  { id: "annoyed", label: "Annoyed", motion: "float", durationMs: FLOAT_MS, tint: "red",
    eyes: "heavy", brows: "angry", mouth: "frown", blush: "none", particles: "anger" },
  // proud (B18.8): pipi menggembung & kepala mendongak (pose "puffed"), mata melirik puas
  // di bawah lengkung tebal (alis smug), senyum puas, kilau berkelip di kiri-kanan kepala.
  // Lapisan tipis mint sama dengan proud Mochi
  { id: "proud", label: "Proud", motion: "float", durationMs: FLOAT_MS, tint: "mint", pose: "puffed",
    eyes: "smug", brows: "smug", mouth: "smirk", blush: "none", particles: "twinkle" },
];

// Data lengkap 1 mood. Mood tak dikenal pakai mood default.
export function getCapybaraMood(moodId) {
  return (
    capybaraMoods.find((m) => m.id === moodId) ??
    capybaraMoods.find((m) => m.id === capybaraConfig.defaultMood)
  );
}
