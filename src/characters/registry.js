// Daftar semua karakter di editor (sumber tunggal).
// Tambah karakter baru = tambah satu import + satu baris di `characters`.
// Editor tidak boleh menyebut nama karakter tertentu; semuanya lewat file ini.
//
// Tiap karakter (lihat contoh di mochi/index.js) wajib punya:
//   id, name, defaultColor, defaultMood, moods, Component
// dan boleh punya:
//   shapePresets — pilihan bentuk badan; yang pertama jadi bentuk awal
//
// Component menerima props: state (id mood), shapePreset, color, size.

import mochi from "./mochi";

export const characters = [
  mochi,
];

export const defaultCharacter = characters[0];

// Karakter berdasarkan id. Id tak dikenal pakai karakter pertama.
export function getCharacter(id) {
  return characters.find((c) => c.id === id) ?? defaultCharacter;
}

// Bentuk badan awal karakter (null kalau karakter tidak punya pilihan bentuk).
export function getDefaultShape(character) {
  return character.shapePresets?.[0]?.id ?? null;
}

// Mood dipertahankan kalau karakter punya mood itu; kalau tidak, pakai mood default karakter.
export function pickMood(character, moodId) {
  return character.moods.some((m) => m.id === moodId) ? moodId : character.defaultMood;
}

// Durasi 1 putaran animasi (ms) untuk mood tertentu.
export function getMoodDuration(character, moodId) {
  const mood = character.moods.find((m) => m.id === pickMood(character, moodId));
  return mood.durationMs;
}

// Cek apakah warna sama dengan warna dasar awal karakter (huruf besar/kecil diabaikan).
export function isDefaultColor(character, color) {
  return !color || color.toLowerCase() === character.defaultColor.toLowerCase();
}
