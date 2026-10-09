// Riwayat undo/redo editor (Fase 2 A3).
//
// Satu state berisi semuanya, supaya daftar langkah dan posisinya tidak pernah "lepas sinkron":
//   {
//     entries: [paket, paket, ...],  // langkah yang sudah disimpan (paket = lihat editorState.js)
//     index: 0,                      // posisi langkah yang sedang aktif
//     draft: null | paket,           // pratinjau sementara (misalnya saat color picker digeser)
//   }
//
// Yang tampil di layar = draft kalau ada, kalau tidak entries[index].
// Fungsi murni tanpa React & tanpa alias `@/`, supaya bisa dites dengan `node --test` (A6).

import { isSameState } from "./editorState.js";

// Maksimal 100 kali undo (keputusan K-5). Langkah paling lama dibuang.
export const HISTORY_LIMIT = 100;

export function createHistory(initialState) {
  return { entries: [initialState], index: 0, draft: null };
}

export function currentState(history) {
  return history.draft ?? history.entries[history.index];
}

export function canUndo(history) {
  return history.draft !== null || history.index > 0;
}

export function canRedo(history) {
  return history.draft === null && history.index < history.entries.length - 1;
}

export function historyReducer(history, action) {
  switch (action.type) {
    // Tampilan berubah, riwayat tidak.
    case "preview":
      return { ...history, draft: action.state };

    // Simpan satu langkah. Langkah "kosong" (sama dengan yang aktif) tidak dicatat.
    case "commit": {
      const active = history.entries[history.index];
      if (isSameState(action.state, active)) {
        return history.draft === null ? history : { ...history, draft: null };
      }
      // Buang cabang "masa depan" setelah undo, lalu potong yang paling lama.
      const entries = [...history.entries.slice(0, history.index + 1), action.state].slice(
        -(HISTORY_LIMIT + 1)
      );
      return { entries, index: entries.length - 1, draft: null };
    }

    // Kalau ada pratinjau yang belum disimpan, undo cukup membatalkan pratinjau itu.
    case "undo":
      if (history.draft !== null) return { ...history, draft: null };
      if (history.index === 0) return history;
      return { ...history, index: history.index - 1 };

    case "redo":
      if (!canRedo(history)) return history;
      return { ...history, index: history.index + 1 };

    default:
      return history;
  }
}
