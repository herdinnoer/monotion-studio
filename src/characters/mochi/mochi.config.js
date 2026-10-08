// Pengaturan dasar Mochi (sumber tunggal).
// Editor membaca warna awal, mood awal, dan pilihan bentuk dari sini.
// MochiMaster membaca proporsi badan (anatomy) dari sini.

export const mochiConfig = {
  id: "mochi",
  name: "Mochi",
  defaultColor: "#FFFFFF",
  defaultMood: "idle",

  // Pilihan bentuk badan. Yang pertama dipakai sebagai bentuk awal.
  shapePresets: [
    { id: "mochi", label: "Mochi" },
    { id: "round", label: "Round" },
    { id: "boxy", label: "Boxy" },
  ],

  // Proporsi, relatif ke ukuran badan (R).
  // rx/ry = lebar/tinggi badan, eyeSpacing/blushSpacing = jarak mata/pipi dari tengah.
  anatomy: { rx: 1.14, ry: 0.88, eyeSpacing: 0.37, blushSpacing: 0.52 },

  // Bagian badan (digambar di MochiBody.jsx).
  //   paint: "base"  = ikut warna dasar pilihan user
  //   paint: "fixed" = warna tetap, tidak ikut warna user
  //   moving: true   = bisa digerakkan sendiri per mood (lihat `parts` di mochi.moods.js)
  //   origin         = titik putar, relatif ke badan (0 = tengah, ±1 = tepi)
  parts: {
    body: { paint: "base" },
    arm: { paint: "base", moving: true, origin: { x: 0.8, y: 0.06 } },
  },
};

export const mochiDefaultShape = mochiConfig.shapePresets[0].id;

// Cek apakah warna sama dengan warna dasar awal (huruf besar/kecil diabaikan).
export function isMochiDefaultColor(color) {
  return !color || color.toLowerCase() === mochiConfig.defaultColor.toLowerCase();
}
