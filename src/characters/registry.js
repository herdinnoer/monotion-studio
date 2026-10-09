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
import capybara from "./capybara";
import { getDefaultShape, pickMood } from "../lib/editorState";

export const characters = [
  mochi,
  capybara,
];

export const defaultCharacter = characters[0];

// Karakter berdasarkan id. Id tak dikenal pakai karakter pertama.
export function getCharacter(id) {
  return characters.find((c) => c.id === id) ?? defaultCharacter;
}

// getDefaultShape & pickMood tinggal di editorState.js (fungsi murni, bisa dites Node).
// Diteruskan dari sini supaya komponen tetap cukup import dari registry.
export { getDefaultShape, pickMood };

// Durasi 1 putaran animasi (ms) untuk mood tertentu.
export function getMoodDuration(character, moodId) {
  const mood = character.moods.find((m) => m.id === pickMood(character, moodId));
  return mood.durationMs;
}

// Cek apakah warna sama dengan warna dasar awal karakter (huruf besar/kecil diabaikan).
export function isDefaultColor(character, color) {
  return !color || color.toLowerCase() === character.defaultColor.toLowerCase();
}
