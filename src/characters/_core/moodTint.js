// Nuansa warna mood, bersama untuk semua karakter.
//
// Urutan lapisan warna (sama untuk semua karakter):
//   1. Warna dasar user  → bagian ber-paint "base"
//                          + bagian ber-paint "derived" (dihitung dari warna dasar,
//                            lihat derivedColor.js)
//   2. Warna tetap       → bagian ber-paint "fixed"
//   3. Lapisan tipis mood → menimpa badan, garis tepi, dan elemen (mata, pipi)
//   4. Glow mood          → di luar badan
//
// Karena lapisan mood ada DI ATAS warna dasar, warna pilihan user tidak lagi
// menghapus nuansa mood. Karakter tidak boleh menentukan kekuatannya sendiri.

// Satu angka untuk semua karakter. Mengubahnya = semua karakter ikut berubah.
export const MOOD_TINT_OPACITY = 0.3;

// Lapisan tipis berbentuk gradient bulat: bening di titik kilau (kiri atas),
// makin pekat ke tepi badan. Jadi kesan 3D/kilau badan tetap terlihat.
export const MOOD_TINT_GRADIENT = { cx: "36%", cy: "28%", r: "72%", fx: "34%", fy: "24%" };
export const MOOD_TINT_STOPS = [
  { offset: "0%", opacity: 0 },
  { offset: "45%", opacity: 0.35 },
  { offset: "80%", opacity: 0.75 },
  { offset: "100%", opacity: 1 },
];

// Palet warna mood. Dipakai mood lewat `tint` dan `glow`, contoh:
//   { id: "error", tint: "red", glow: "red" }
export const MOOD_TINTS = {
  blue: "#3B82F6",
  violet: "#8B5CF6",
  indigo: "#6366F1",
  amber: "#F59E0B",
  cyan: "#06B6D4",
  red: "#EF4444",
  teal: "#10B981",
  mint: "#34D399",
  orange: "#F97316",
  purple: "#A855F7",
  magenta: "#EC4899",
  pink: "#F43F5E",
};

// Kekuatan glow di luar badan (sama untuk semua karakter).
export const MOOD_GLOW_OPACITY = 0.65;

// Warna lapisan tipis & glow untuk 1 mood. null = mood ini tidak punya.
export function getMoodColors(mood) {
  return {
    tint: MOOD_TINTS[mood?.tint] ?? null,
    glow: MOOD_TINTS[mood?.glow] ?? null,
  };
}
