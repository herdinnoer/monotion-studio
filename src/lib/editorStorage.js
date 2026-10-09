// Simpan pengaturan terakhir editor di browser (Fase 2 A5).
//
// Yang disimpan di localStorage (satu kunci):
//   { state: paket kondisi (lihat editorState.js), projectName: "..." }
// Hanya kondisi SEKARANG, bukan riwayat undo. Setelah refresh, undo mulai kosong.
//
// Semua baca/tulis dibungkus try/catch: mode privat, penyimpanan penuh, atau data rusak
// tidak boleh bikin editor error. Tanpa alias `@/`, supaya bisa dites dengan `node --test` (A6).

import { sanitizeState } from "./editorState.js";

// Angka versi di kunci: kalau bentuk paket berubah, naikkan jadi v2 dan data lama diabaikan.
export const STORAGE_KEY = "monotion:editor:v1";

// Ubah teks JSON dari localStorage jadi data yang aman dipakai editor.
// Apa pun isinya (kosong, rusak, bukan objek), hasilnya selalu valid.
export function parseSaved(text, characters) {
  let raw = null;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = null;
  }
  const isObject = raw && typeof raw === "object" && !Array.isArray(raw);
  return {
    state: sanitizeState(isObject ? raw.state : null, characters),
    projectName: isObject && typeof raw.projectName === "string" ? raw.projectName : "",
  };
}

export function loadSaved(characters) {
  let text = null;
  try {
    text = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Server (tidak ada window) atau browser menolak akses: mulai dari default.
  }
  return parseSaved(text, characters);
}

export function save({ state, projectName }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, projectName }));
  } catch {
    // Penyimpanan penuh / diblokir: lewati saja, editor tetap jalan.
  }
}
