// Pengaturan dasar Capybara (sumber tunggal).
// Editor membaca warna awal & mood awal dari sini (lewat registry.js).
// CapybaraMaster & CapybaraBody membaca proporsi, bagian badan, dan titik tempel dari sini.
//
// Capybara tidak punya `shapePresets`, jadi pilihan bentuk badan tidak muncul di editor.

export const capybaraConfig = {
  id: "capybara",
  name: "Capybara",
  defaultColor: "#C68A4E",
  defaultMood: "idle",

  // Proporsi, relatif ke ukuran badan (R).
  // rx/ry = lebar/tinggi badan, eyeSpacing/blushSpacing = jarak mata/pipi dari tengah.
  anatomy: { rx: 1.18, ry: 0.86, eyeSpacing: 0.4, blushSpacing: 0.6 },

  // Bagian badan (digambar di CapybaraBody.jsx).
  //   paint: "base"  = ikut warna dasar pilihan user
  //   paint: "fixed" = warna tetap, tidak ikut warna user
  //   moving: true   = bisa digerakkan sendiri per mood (lihat `parts` di capybara.moods.js)
  //   origin         = titik putar, relatif ke badan (0 = tengah, ±1 = tepi)
  // Telinga & jeruk menyatu dengan tubuh (bukan aksesori).
  parts: {
    body: { paint: "base" },
    earL: { paint: "base", moving: true, origin: { x: -0.55, y: -0.85 } },
    earR: { paint: "base", moving: true, origin: { x: 0.55, y: -0.85 } },
    snout: { paint: "fixed" }, // moncong & lubang hidung
    orange: { paint: "fixed", moving: true, origin: { x: 0, y: -1.0 } }, // jeruk: warna tetap
    leaf: { paint: "fixed" }, // daun ikut gerak jeruk
  },

  // Titik tempel Zzz, bintang, badge, dan aksesori (lihat _core/anchors.js).
  // Relatif ke badan: 0 = tengah, ±1 = tepi. Kepala lebih tinggi karena ada jeruk.
  anchors: {
    hat: { x: 0, y: -0.55 },
    face: { x: 0, y: -0.2 },
    zzz: { x: 0.7, y: -0.7 },
    stars: { x: 0, y: -0.45 },
    badge: { x: -0.9, y: -0.95 },
  },

  // Aksesori yang boleh dipakai Capybara. Topi bentrok dengan jeruk, jadi hanya kacamata.
  allowedAccessories: ["glasses"],
};
