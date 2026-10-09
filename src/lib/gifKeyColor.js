// GIF transparan dengan "warna kunci" (Fase 2 A4).
//
// GIF tidak punya setengah transparan: tiap piksel cuma tembus atau tidak. Caranya:
//   1. Tiap piksel yang lebih dari setengah tembus → ditandai "tembus", sisanya dibuat penuh.
//   2. Catat semua warna yang dipakai karakter di semua frame.
//   3. Pilih warna kunci yang PALING JAUH dari warna-warna itu (jadi tidak bentrok).
//   4. Piksel "tembus" diisi warna kunci, lalu gif.js diberi tahu warna kunci = transparan.
//
// Fungsi murni tanpa DOM & tanpa alias `@/`, supaya bisa dites dengan `node --test` (A6).

// Warna kunci yang dicoba lebih dulu (warna "neon" yang jarang dipakai karakter).
const PREFERRED_KEYS = [0x00ff00, 0xff00ff, 0x00ffff, 0x0000ff, 0xffff00, 0xff0080];

// Jarak minimum (ruang RGB 0–255) supaya warna kunci dianggap aman dari warna karakter.
const SAFE_DISTANCE = 80;

// Piksel dengan alpha di bawah ini dianggap tembus.
const ALPHA_THRESHOLD = 128;

// Warna dicatat per "kotak" 8 tingkat per kanal (32×32×32 kotak), cukup teliti dan ringan.
const BIN_SHIFT = 3;
const BINS = 256 >> BIN_SHIFT;

function binIndex(r, g, b) {
  return ((r >> BIN_SHIFT) * BINS + (g >> BIN_SHIFT)) * BINS + (b >> BIN_SHIFT);
}

export function hexToRgbNumber(hex) {
  const clean = String(hex).replace("#", "");
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean;
  const value = parseInt(full, 16);
  return Number.isNaN(value) ? null : value;
}

// Catatan warna yang dipakai: satu angka per kotak warna (0 = tidak dipakai).
export function createColorUsage() {
  return new Uint8Array(BINS * BINS * BINS);
}

export function markColor(usage, rgbNumber) {
  if (rgbNumber === null) return;
  usage[binIndex((rgbNumber >> 16) & 0xff, (rgbNumber >> 8) & 0xff, rgbNumber & 0xff)] = 1;
}

// Langkah 1 & 2 untuk satu frame (data RGBA dari getImageData, diubah langsung).
export function prepareFrame(data, usage) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < ALPHA_THRESHOLD) {
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
      usage[binIndex(data[i], data[i + 1], data[i + 2])] = 1;
    }
  }
}

function minDistanceSq(usedBins, rgbNumber) {
  const r = (rgbNumber >> 16) & 0xff;
  const g = (rgbNumber >> 8) & 0xff;
  const b = rgbNumber & 0xff;
  let min = Infinity;
  for (const [br, bg, bb] of usedBins) {
    const d = (br - r) ** 2 + (bg - g) ** 2 + (bb - b) ** 2;
    if (d < min) min = d;
  }
  return min;
}

// Langkah 3: pilih warna kunci. Hasilnya angka 0xRRGGBB (format yang diminta gif.js).
export function pickKeyColor(usage) {
  const half = 1 << (BIN_SHIFT - 1);
  const usedBins = [];
  for (let i = 0; i < usage.length; i++) {
    if (!usage[i]) continue;
    const b = i % BINS;
    const g = Math.floor(i / BINS) % BINS;
    const r = Math.floor(i / (BINS * BINS));
    // Titik tengah kotak warna
    usedBins.push([(r << BIN_SHIFT) + half, (g << BIN_SHIFT) + half, (b << BIN_SHIFT) + half]);
  }
  if (usedBins.length === 0) return PREFERRED_KEYS[0];

  const safeSq = SAFE_DISTANCE ** 2;
  for (const key of PREFERRED_KEYS) {
    if (minDistanceSq(usedBins, key) >= safeSq) return key;
  }

  // Semua warna favorit terlalu mirip: cari warna terjauh di seluruh ruang warna.
  let best = PREFERRED_KEYS[0];
  let bestDist = -1;
  for (let r = 0; r < 256; r += 32) {
    for (let g = 0; g < 256; g += 32) {
      for (let b = 0; b < 256; b += 32) {
        const key = (r << 16) | (g << 8) | b;
        const d = minDistanceSq(usedBins, key);
        if (d > bestDist) {
          bestDist = d;
          best = key;
        }
      }
    }
  }
  return best;
}

// Langkah 4: isi piksel tembus dengan warna kunci.
export function applyKeyColor(data, key) {
  const r = (key >> 16) & 0xff;
  const g = (key >> 8) & 0xff;
  const b = key & 0xff;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}
