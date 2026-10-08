// Titik tempel (anchors): tempat aksesori, Zzz, bintang, dan badge ditempel ke karakter.
//
// Tiap karakter menulis titik tempelnya di *.config.js, relatif ke ukuran badan:
//   x: 0 = tengah, -1 = tepi kiri, +1 = tepi kanan
//   y: 0 = tengah, -1 = tepi atas, +1 = tepi bawah
//
// Titik wajib:
//   hat   — tepi atas pinggiran topi (beanie, santa_hat)
//   face  — garis mata (kacamata, mata)
//   zzz   — huruf Z pertama saat tidur
//   stars — pusat sebaran bintang
//   badge — pusat lencana di pojok kepala
//
// Titik tambahan (hanya wajib kalau ada mood yang memakainya):
//   mouth   — pangkal mulut, tepat di bawah hidung (lihat _core/parts/Mouth.jsx)
//   anger   — pusat tanda marah di dahi (partikel "anger", lihat _core/parts/Particles.jsx)
//   twinkle — tengah sebaran kilau berkelip (partikel "twinkle")

export const ANCHOR_NAMES = ["hat", "face", "zzz", "stars", "badge"];
export const OPTIONAL_ANCHOR_NAMES = ["mouth", "anger", "twinkle"];

// Ubah titik tempel relatif jadi koordinat SVG (piksel di kanvas 400×400).
export function resolveAnchors(anchors, { cx, cy, rx, ry }) {
  const points = {};
  for (const name of ANCHOR_NAMES) {
    const anchor = anchors[name] ?? { x: 0, y: 0 };
    points[name] = { x: cx + anchor.x * rx, y: cy + anchor.y * ry };
  }
  for (const name of OPTIONAL_ANCHOR_NAMES) {
    const anchor = anchors[name];
    if (anchor) points[name] = { x: cx + anchor.x * rx, y: cy + anchor.y * ry };
  }
  return points;
}
