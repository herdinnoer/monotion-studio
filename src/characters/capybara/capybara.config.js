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

  // Titik tempel Zzz, bintang, badge, aksesori, mulut, dan partikel (lihat _core/anchors.js).
  // Relatif ke badan: 0 = tengah, ±1 = tepi. Kepala lebih tinggi karena ada jeruk.
  anchors: {
    hat: { x: 0, y: -0.55 },
    face: { x: 0, y: -0.183 }, // garis tengah mata, diukur dari referensi
    zzz: { x: 1.058, y: -0.667 }, // tengah Z besar (zzz-bold), diukur dari referensi sleeping
    stars: { x: 0, y: -0.45 },
    badge: { x: -0.9, y: -0.95 },
    // Pangkal mulut (ujung atas garis tengah), tepat di bawah hidung. Diukur dari referensi
    mouth: { x: 0, y: 0.151 },
    // Pusat tanda marah (annoyed), di dahi kanan atas. Diukur dari referensi (B18.6)
    anger: { x: 0.594, y: -0.557 },
    // Tengah sebaran kilau (proud), setinggi bintang-bintang di kiri & kanan kepala.
    // Diukur dari referensi (B18.6), dinaikkan 18.5 piksel referensi setelah pose proud
    // dipasang (B18.8): semula diukur dari hidung, yang di pose proud ikut naik
    twinkle: { x: 0, y: -0.484 },
  },

  // Pose badan per mood (lihat _core/poses.js), dipilih lewat kunci `pose` di capybara.moods.js.
  // Mood tanpa pose memakai bentuk asli di atas, tidak berubah.
  poses: {
    // Bangga (proud): kepala kubah + dua bola pipi di kiri-kanan bawah (lekukan seperti pelipis
    // di sambungannya), dasar sedikit naik (gepeng), kepala mendongak (wajah naik, mata sedikit
    // merapat & mengecil). Diukur dari docs/reference/capybara/proud.png dibanding idle.png
    // (B18.7–B18.8): kepala atas, telinga, dan jeruk sama persis dengan idle; garis luar mulai
    // menggembung di setinggi mata (lekukan, kemiringan melonjak 2× di y ≈ −0.27 ry), bola pipi
    // terlebar +17 piksel referensi tiap sisi; dasar naik; moncong/hidung/mulut naik 15.5 piksel,
    // mata naik 7, merapat 9 tiap sisi, jari-jari 40.9 vs 43.1. Selisih garis luar dengan
    // referensi rata-rata 0.6 piksel referensi.
    puffed: {
      cheeks: { x: 0.73, y: 0.159, rx: 0.336, ry: 0.485, blend: 0.022 },
      lift: { amount: 0.028, from: -0.376 },
      face: { eyesY: -0.04, eyeSpacing: -0.04, eyeScale: 0.95, snoutY: -0.088 },
      // Pipi ikut napas: belum dipakai (0 = pose diam). Ide untuk Fase 4
      pulse: 0,
      // Bayangan volume pipi (digambar CapybaraBody, hanya di pose ini). Tanpa ini pipi yang
      // menggembung terbaca seperti kepala gepeng. Diukur dari kecerahan proud.png vs idle.png:
      // pusat gembungan lebih terang, sisi luar & bawahnya lebih gelap, dan ada lipatan tipis
      // dari bawah moncong melengkung ke luar di bawah gembungan.
      //   shadow    — sabit di bawah & sisi luar bola pipi (`cheeks` di atas): bola dikurangi
      //               salinannya yang digeser ke dalam (shiftX) & ke atas (shiftY)
      //   highlight — sorotan tipis oval di bagian atas pipi: x, y, rx, ry, tilt (derajat)
      //   crease    — lipatan: lengkung dari `from` (tersembunyi di bawah moncong) lewat `via`
      //               ke `to` (tepi kepala), tebal `width` di tengah & meruncing ke ujung
      //   shade     — warna turunan warna dasar (5.11); blur = kelembutan tepi (× rx)
      shading: {
        shadow: { shade: -0.35, opacity: 0.5, shiftX: 0.1, shiftY: -0.14, blur: 0.05 },
        highlight: { x: 0.56, y: 0.2, rx: 0.2, ry: 0.08, tilt: -18, shade: 0.3, opacity: 0.4, blur: 0.04 },
        crease: { from: [0.3, 0.5], via: [0.56, 0.63], to: [0.82, 0.68], width: 0.06, shade: -0.35, opacity: 0.35, blur: 0.022 },
      },
    },
  },

  // Aksesori yang boleh dipakai Capybara. Topi bentrok dengan jeruk, jadi hanya kacamata.
  allowedAccessories: ["glasses"],
};
