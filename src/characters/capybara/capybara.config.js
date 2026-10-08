// Pengaturan dasar Capybara (sumber tunggal).
// Editor membaca warna awal & mood awal dari sini (lewat registry.js).
// CapybaraMaster & CapybaraBody membaca proporsi, bagian badan, dan titik tempel dari sini.
//
// Capybara tidak punya `shapePresets`, jadi pilihan bentuk badan tidak muncul di editor.

export const capybaraConfig = {
  id: "capybara",
  name: "Capybara",
  defaultColor: "#F28C3E", // oranye perkiraan dari gambar referensi; final dari SVG Figma
  defaultMood: "idle",

  // Proporsi, relatif ke ukuran badan (R).
  // rx/ry = lebar/tinggi badan, eyeSpacing/blushSpacing = jarak mata/pipi dari tengah.
  // head = bentuk kepala kubah (lihat generateDomePath di _core/shapes.js), dicocokkan
  // dengan tepi kepala yang terlihat di docs/reference/capybara/idle.png:
  // tinggi/lebar 0.816 (ry/rx), terlebar di sepertiga bawah, atas sedikit menyempit.
  // eyeSize = jari-jari mata besar (iris, iris-heart, heavy, smug, closed), dikali rx.
  // eyeSpacing & eyeSize diukur dari docs/reference/capybara/idle.png (sama di semua mood).
  // blushSpacing, blushY, blush = jarak pipi dari tengah (× rx), tinggi pipi (× ry), dan ukuran
  // oval pipi "solid" (× rx), diukur dari docs/reference/capybara/ (idle, annoyed, sleeping, love).
  // mouthSize = 1 satuan mulut (lihat _core/parts/Mouth.jsx), dikali rx: setengah lebar
  // mulut ω di docs/reference/capybara/idle.png.
  anatomy: {
    rx: 1.18,
    ry: 0.963,
    eyeSpacing: 0.55,
    eyeSize: 0.203,
    blushSpacing: 0.705,
    blushY: 0.216,
    blush: { rx: 0.167, ry: 0.125 },
    head: { widest: 0.34, nTop: 2.2, bottomCurve: { start: 0.25, a: 0.75, b: 0.45 }, taper: 0.05 },
    mouthSize: 0.246,
  },

  // Bagian badan (digambar di CapybaraBody.jsx).
  //   paint: "base"    = ikut warna dasar pilihan user
  //   paint: "derived" = turunan warna dasar (lihat _core/derivedColor.js)
  //                      shade < 0 = lebih gelap, shade > 0 = lebih terang;
  //                      arahnya otomatis dibalik kalau warna dasar sangat gelap/terang
  //   paint: "fixed"   = warna tetap, tidak ikut warna user
  //   moving: true     = bisa digerakkan sendiri per mood (lihat `parts` di capybara.moods.js)
  //   origin           = titik putar, relatif ke badan (0 = tengah, ±1 = tepi)
  // Telinga & jeruk menyatu dengan tubuh (bukan aksesori).
  parts: {
    body: { paint: "base" },
    // Telinga sedikit lebih gelap dari kepala (5.11).
    // Titik putar = tengah pangkal telinga (tersembunyi di balik kepala)
    earL: { paint: "derived", shade: -0.18, moving: true, origin: { x: -0.566, y: -0.539 } },
    earR: { paint: "derived", shade: -0.18, moving: true, origin: { x: 0.566, y: -0.539 } },
    earInner: { paint: "derived", shade: -0.45 }, // sabit gelap di sisi luar kedua telinga
    snout: { paint: "derived", shade: -0.22 }, // moncong
    nostril: { paint: "derived", shade: -0.6 }, // lubang hidung
    // Jeruk lebih terang dari kepala supaya selalu terbedakan.
    // Jeruk TIDAK bergerak sendiri: selalu menempel di kepala dan ikut gerak badan (5.14)
    orange: { paint: "derived", shade: 0.25 },
    stem: { paint: "fixed" }, // tangkai tetap cokelat, menempel di jeruk
    leaf: { paint: "fixed" }, // daun tetap hijau, menempel di jeruk
  },

  // Titik tempel Zzz, bintang, badge, dan aksesori (lihat _core/anchors.js).
  // Relatif ke badan: 0 = tengah, ±1 = tepi. Kepala lebih tinggi karena ada jeruk.
  anchors: {
    hat: { x: 0, y: -0.55 },
    face: { x: 0, y: -0.183 }, // garis tengah mata, diukur dari referensi
    zzz: { x: 0.7, y: -0.7 },
    stars: { x: 0, y: -0.45 },
    badge: { x: -0.9, y: -0.95 },
    // Pangkal mulut (ujung atas garis tengah), tepat di bawah hidung. Diukur dari referensi
    mouth: { x: 0, y: 0.151 },
  },

  // Aksesori yang boleh dipakai Capybara. Topi bentrok dengan jeruk, jadi hanya kacamata.
  allowedAccessories: ["glasses"],
};
