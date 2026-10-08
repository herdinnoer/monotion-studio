// Warna turunan (paint: "derived"), bersama untuk semua karakter.
//
// Bagian ber-paint "derived" menulis `shade` di config:
//   shade < 0 → lebih gelap dari warna dasar  (-0.3 = dicampur 30% hitam)
//   shade > 0 → lebih terang dari warna dasar (0.3 = dicampur 30% putih)
//
// Kalau warna dasar sangat gelap, "lebih gelap" tidak akan kelihatan bedanya,
// jadi arahnya otomatis dibalik jadi lebih terang (dan sebaliknya untuk warna
// sangat terang). Hasilnya bagian turunan selalu terlihat beda dari warna dasar.

// Batas "sangat gelap" & "sangat terang" (kecerahan 0 = hitam, 1 = putih).
const TOO_DARK = 0.22;
const TOO_LIGHT = 0.78;

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Kecerahan menurut mata manusia (hijau terasa paling terang, biru paling gelap).
export function getBrightness(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Campur warna dengan hitam (amount < 0) atau putih (amount > 0), tanpa balik arah.
export function mixColor(hex, amount) {
  const target = amount < 0 ? 0 : 255;
  const t = Math.min(Math.abs(amount), 1);
  return rgbToHex(hexToRgb(hex).map((v) => v + (target - v) * t));
}

// Warna turunan dari warna dasar. Arah dibalik otomatis kalau warna dasar
// terlalu gelap/terang untuk arah yang diminta.
export function deriveColor(baseHex, shade) {
  const brightness = getBrightness(baseHex);
  const flip = (shade < 0 && brightness < TOO_DARK) || (shade > 0 && brightness > TOO_LIGHT);
  return mixColor(baseHex, flip ? -shade : shade);
}
