// Warna turunan (paint: "derived"), bersama untuk semua karakter.
//
// Bagian ber-paint "derived" menulis `shade` di config:
//   shade < 0 → lebih gelap dari warna dasar  (-0.3 = kecerahan turun 30%)
//   shade > 0 → lebih terang dari warna dasar (0.3 = 30% lebih dekat ke putih)
//
// Menggelapkan TIDAK dengan mencampur hitam (hasilnya cokelat/abu kusam), tapi dengan
// menurunkan kecerahan sambil menjaga kepekatan warna (saturasi) tetap.
// Contoh: oranye → oranye tua yang tetap hidup, bukan cokelat.
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

// Perubahan kepekatan warna saat digelapkan (0 = tetap).
//   > 0 = makin pekat/nyala (0.5 pernah dicoba: moncong terlalu nyala)
//   < 0 = makin pudar (di bawah -0.3 bagian sangat gelap mulai kecokelatan/kusam)
// Warna abu (putih, hitam, abu) tidak punya kepekatan, jadi tetap abu.
const SATURATION_BOOST = 0;

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)].map((v) => v * 255);
}

// Gelapkan (amount < 0) atau terangkan (amount > 0) tanpa balik arah, tanpa kusam:
// gelap = kecerahan turun + kepekatan naik sedikit; terang = kecerahan naik ke putih.
export function shadeColor(hex, amount) {
  const t = Math.min(Math.abs(amount), 1);
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  if (amount < 0) {
    return rgbToHex(hslToRgb([h, Math.min(1, s * (1 + t * SATURATION_BOOST)), l * (1 - t)]));
  }
  return rgbToHex(hslToRgb([h, s, l + (1 - l) * t]));
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
  return shadeColor(baseHex, flip ? -shade : shade);
}

// Bayangan badan (bagian bawah gradient badan), bersama untuk semua karakter.
// Memakai versi gelap dari warna dasar itu sendiri (hijau → hijau tua), bukan abu
// tetap, supaya warnanya tidak terlihat kusam. Lihat keputusan 5.12.
export const BODY_SHADOW_SHADE = -0.3;

export function getBodyShadowColor(baseHex) {
  return deriveColor(baseHex, BODY_SHADOW_SHADE);
}
