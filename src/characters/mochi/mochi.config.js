// Pengaturan dasar Mochi (sumber tunggal).
// Editor membaca warna awal, mood awal, dan pilihan bentuk dari sini (lewat registry.js).
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

  // Titik tempel aksesori, Zzz, bintang, dan badge (lihat _core/anchors.js).
  // Relatif ke badan: 0 = tengah, ±1 = tepi.
  anchors: {
    hat: { x: 0, y: -0.367 }, // tepi atas pinggiran topi
    face: { x: 0, y: -0.02 }, // garis mata
    zzz: { x: 0.65, y: -0.45 },
    stars: { x: 0, y: -0.2 },
    badge: { x: -0.96, y: -1.0 },
  },

  // Aksesori yang boleh dipakai Mochi (lihat _core/parts/accessories/).
  allowedAccessories: ["beanie", "santa_hat", "glasses"],
};

