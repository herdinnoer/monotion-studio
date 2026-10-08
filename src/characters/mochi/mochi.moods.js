// Daftar resmi mood Mochi (sumber tunggal).
// Dropdown mood, label jumlah mood, dan durasi animasi (preview & export)
// semuanya membaca dari file ini. Jangan tulis ulang daftar/angka ini di tempat lain.

import { MOTIONS } from "../_core/motions";
import { mochiConfig } from "./mochi.config";

// Durasi 1 putaran animasi (ms), dibaca dari preset gerakan di _core/motions.js:
// napas (float), dancing (dance), tangan greeting (wave).
const FLOAT_MS = MOTIONS.float.durationMs;

// Bagian tubuh per mood (semuanya opsional, digambar oleh _core/parts/):
//   eyes      — jenis mata (lihat Eyes.jsx), bawaan "round"
//   blink     — false kalau mata tidak boleh berkedip di mood ini
//   blush     — jenis pipi (lihat Blush.jsx), bawaan "soft"
//   badge     — lencana { type, color } (lihat Badge.jsx), bawaan tanpa lencana
//   particles — "zzz" atau "stars" (lihat Particles.jsx), bawaan tanpa partikel
//   tint      — warna lapisan tipis mood (kunci di _core/moodTint.js), bawaan tanpa
//   glow      — warna glow di luar badan (kunci di _core/moodTint.js), bawaan tanpa
//   parts     — gerakan bagian bergerak, { namaBagian: presetGerak } (lihat motions.js).
//               Tangan Mochi hanya muncul kalau mood menyebut `arm`.
export const mochiMoods = [
  { id: "idle", label: "Idle", durationMs: FLOAT_MS },
  { id: "working", label: "Working", durationMs: FLOAT_MS, tint: "blue", badge: { type: "dots", color: "blue" } },
  { id: "thinking", label: "Thinking", durationMs: FLOAT_MS, tint: "violet", badge: { type: "dots", color: "violet" } },
  { id: "searching", label: "Searching", durationMs: FLOAT_MS, tint: "indigo", badge: { type: "dots", color: "indigo" } },
  { id: "approval", label: "Approval", durationMs: FLOAT_MS, tint: "amber", badge: { type: "exclamation", color: "amber" } },
  { id: "question", label: "Question", durationMs: FLOAT_MS, tint: "cyan", badge: { type: "question", color: "cyan" } },
  { id: "error", label: "Error", durationMs: FLOAT_MS, tint: "red", glow: "red",
    eyes: "angry", badge: { type: "exclamation", color: "red" } },
  { id: "finished", label: "Finished", durationMs: FLOAT_MS, tint: "teal", glow: "teal",
    eyes: "happy", blink: false, badge: { type: "check", color: "emerald" }, particles: "stars" },
  { id: "rate_limit", label: "Rate Limit", durationMs: FLOAT_MS, tint: "orange",
    eyes: "flat", badge: { type: "exclamation", color: "orange" } },
  { id: "sleeping", label: "Sleeping", durationMs: FLOAT_MS, tint: "purple",
    eyes: "sleepy", blink: false, blush: "none", particles: "zzz" },
  { id: "dizzy", label: "Dizzy", durationMs: FLOAT_MS, tint: "magenta", eyes: "dizzy" },
  { id: "greeting", label: "Greeting", durationMs: MOTIONS.wave.durationMs, parts: { arm: "wave" } },
  { id: "love", label: "Love", durationMs: FLOAT_MS, tint: "pink", glow: "pink",
    eyes: "hearts", blush: "hearts", badge: { type: "heart", color: "rose" } },
  { id: "surprised", label: "Surprised", durationMs: FLOAT_MS, eyes: "surprised" },
  { id: "proud", label: "Proud", durationMs: FLOAT_MS, tint: "mint",
    eyes: "happy", blush: "sparkle", badge: { type: "check", color: "emerald" } },
  { id: "wink", label: "Wink", durationMs: FLOAT_MS, eyes: "wink", blink: false },
  { id: "yawn", label: "Yawn", durationMs: FLOAT_MS, eyes: "yawn" },
  { id: "annoyed", label: "Annoyed", durationMs: FLOAT_MS, eyes: "flat", blush: "none" },
  { id: "dancing", label: "Dancing", durationMs: MOTIONS.dance.durationMs, eyes: "happy", blink: false },
  { id: "beanie", label: "Beanie", durationMs: FLOAT_MS },
  { id: "santa_hat", label: "Santa Hat", durationMs: FLOAT_MS },
  { id: "glasses", label: "Glasses", durationMs: FLOAT_MS },
];

// Durasi 1 putaran untuk mood tertentu. Mood tak dikenal pakai durasi napas.
export function getMochiMoodDuration(moodId) {
  return mochiMoods.find((m) => m.id === moodId)?.durationMs ?? FLOAT_MS;
}

// Data lengkap 1 mood. Mood tak dikenal pakai mood default.
export function getMochiMood(moodId) {
  return (
    mochiMoods.find((m) => m.id === moodId) ??
    mochiMoods.find((m) => m.id === mochiConfig.defaultMood)
  );
}
