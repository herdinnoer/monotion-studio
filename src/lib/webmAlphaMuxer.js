// Penyusun file WebM transparan (Fase 2 A4).
//
// Kenapa ada file ini: encoder video browser (VideoEncoder) belum bisa menyimpan
// transparansi, dan webm-muxer 5 tidak bisa menulis "lapisan alpha" per frame.
// Format resmi WebM transparan: tiap frame berisi dua gambar VP8/VP9,
//   1. gambar warna (biasa),
//   2. gambar alpha (hitam = tembus, putih = padat), disimpan di "BlockAdditions".
// Kedua gambar di-encode terpisah dengan VideoEncoder, lalu dijahit di sini.
//
// Kenapa buatan sendiri: tidak ada library terpasang yang bisa. VideoEncoder dengan
// alpha: "keep" ditolak Chrome 154, dan webm-muxer 5.1.4 cuma menulis tanda AlphaMode
// tanpa lapisan alpha per frame. Detail tes: docs/fase-2-fitur-inti.md, "Catatan temuan A4".
//
// Sudah dites di pemutar (file 1080p dibuat di Chrome, Windows):
//   - Chrome 154: transparan (juga tes otomatis: jumlah frame, durasi, ketajaman)
//   - Edge, Firefox, Figma: transparan (tes manual)
//   - Safari, editor video: belum dites
//
// Fungsi murni tanpa DOM & tanpa alias `@/`, supaya bisa dites dengan `node --test` (A6).

// --- Penulis EBML (format "kotak dalam kotak" yang dipakai WebM) ---

function idBytes(id) {
  const out = [];
  for (let v = id; v > 0; v = Math.floor(v / 256)) out.unshift(v & 0xff);
  return out;
}

// Ukuran isi kotak, selalu ditulis 8 byte supaya posisi mudah dihitung.
function sizeBytes(size) {
  const out = [0x01];
  for (let i = 6; i >= 0; i--) out.push(Math.floor(size / 2 ** (8 * i)) & 0xff);
  return out;
}

function uintBytes(value, width) {
  const out = [];
  let v = value;
  do {
    out.unshift(v & 0xff);
    v = Math.floor(v / 256);
  } while (v > 0);
  while (width && out.length < width) out.unshift(0);
  return out;
}

function concat(parts) {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

// Satu kotak EBML: [id][ukuran][isi]
function el(id, body) {
  const data = body instanceof Uint8Array ? body : Array.isArray(body) ? concat(body) : body;
  return concat([new Uint8Array(idBytes(id)), new Uint8Array(sizeBytes(data.length)), data]);
}
const uint = (id, value, width) => el(id, new Uint8Array(uintBytes(value, width)));
const str = (id, text) => el(id, new TextEncoder().encode(text));
function float64(id, value) {
  const buf = new Uint8Array(8);
  new DataView(buf.buffer).setFloat64(0, value);
  return el(id, buf);
}
function int16(id, value) {
  const buf = new Uint8Array(2);
  new DataView(buf.buffer).setInt16(0, value);
  return el(id, buf);
}

// --- Info warna ---
// Tanpa info ini pemutar menebak rumus warna sendiri dan warnanya bisa bergeser
// (diuji: putih 250 jadi 255). Pola yang sama dengan webm-muxer.

const MATRIX_IDS = { rgb: 1, bt709: 1, bt470bg: 5, smpte170m: 6 };
const TRANSFER_IDS = { bt709: 1, smpte170m: 6, "iec61966-2-1": 13 };
const PRIMARIES_IDS = { bt709: 1, bt470bg: 5, smpte170m: 6 };
const VP9_COLOR_SPACE_IDS = { rgb: 7, bt709: 2, bt470bg: 1, smpte170m: 3 };

function colourElement(colorSpace) {
  const parts = [];
  if (MATRIX_IDS[colorSpace.matrix]) parts.push(uint(0x55b1, MATRIX_IDS[colorSpace.matrix]));
  if (TRANSFER_IDS[colorSpace.transfer]) parts.push(uint(0x55ba, TRANSFER_IDS[colorSpace.transfer]));
  if (PRIMARIES_IDS[colorSpace.primaries]) {
    parts.push(uint(0x55bb, PRIMARIES_IDS[colorSpace.primaries]));
  }
  if (typeof colorSpace.fullRange === "boolean") parts.push(uint(0x55b9, colorSpace.fullRange ? 2 : 1));
  return el(0x55b0, parts);
}

function readBits(bytes, start, end) {
  let value = 0;
  for (let i = start; i < end; i++) {
    value = (value << 1) | ((bytes[i >> 3] >> (7 - (i & 7))) & 1);
  }
  return value;
}

function writeBits(bytes, start, end, value) {
  for (let i = start; i < end; i++) {
    const bit = (value >> (end - i - 1)) & 1;
    const mask = 1 << (7 - (i & 7));
    bytes[i >> 3] = bit ? bytes[i >> 3] | mask : bytes[i >> 3] & ~mask;
  }
}

// Tulis kode rumus warna ke kepala keyframe VP9 (diubah langsung).
export function fixVp9ColorSpace(data, matrix) {
  const id = VP9_COLOR_SPACE_IDS[matrix];
  if (id === undefined || readBits(data, 0, 2) !== 2) return; // bukan frame VP9
  let i = 2;
  const profile = (readBits(data, i + 1, i + 2) << 1) + readBits(data, i, i + 1);
  i += 2;
  if (profile === 3) i++;
  if (readBits(data, i, i + 1)) return; // show_existing_frame
  i++;
  if (readBits(data, i, i + 1) !== 0) return; // bukan keyframe
  i += 3;
  if (readBits(data, i, i + 24) !== 0x498342) return; // sync code
  i += 24;
  if (profile >= 2) i++;
  writeBits(data, i, i + 3, id);
}

// --- Penyusun file ---

// frames: [{ timestampMs, isKey, data: Uint8Array (warna), alpha: Uint8Array }]
// codecId: "V_VP9" atau "V_VP8"
// colorSpace: dari metadata VideoEncoder (decoderConfig.colorSpace), opsional
export function muxAlphaWebm({ width, height, codecId, frameDurationMs, frames, colorSpace }) {
  const durationMs = frames.length * frameDurationMs;

  const header = el(0x1a45dfa3, [
    uint(0x4286, 1), // EBMLVersion
    uint(0x42f7, 1), // EBMLReadVersion
    uint(0x42f2, 4), // EBMLMaxIDLength
    uint(0x42f3, 8), // EBMLMaxSizeLength
    str(0x4282, "webm"), // DocType
    uint(0x4287, 4), // DocTypeVersion
    uint(0x4285, 2), // DocTypeReadVersion
  ]);

  const info = el(0x1549a966, [
    uint(0x2ad7b1, 1_000_000), // TimecodeScale: 1 satuan = 1 ms
    float64(0x4489, durationMs), // Duration
    str(0x4d80, "Monotion Studio"), // MuxingApp
    str(0x5741, "Monotion Studio"), // WritingApp
  ]);

  const tracks = el(0x1654ae6b, [
    el(0xae, [
      uint(0xd7, 1), // TrackNumber
      uint(0x73c5, 1), // TrackUID
      uint(0x83, 1), // TrackType: video
      uint(0x9c, 0), // FlagLacing: tidak
      uint(0x55ee, 1), // MaxBlockAdditionID: ada lapisan alpha
      str(0x86, codecId), // CodecID
      el(0xe0, [
        uint(0xb0, width), // PixelWidth
        uint(0xba, height), // PixelHeight
        uint(0x53c0, 1), // AlphaMode: video punya transparansi
        ...(colorSpace ? [colourElement(colorSpace)] : []),
      ]),
    ]),
  ]);

  // Satu cluster (kelompok) per keyframe, supaya video bisa di-seek.
  const clusters = [];
  let current = null;
  let previousTs = 0;
  for (const frame of frames) {
    const ts = Math.round(frame.timestampMs);
    if (frame.isKey || !current) {
      current = { timestampMs: ts, blocks: [] };
      clusters.push(current);
    }
    if (frame.isKey && codecId === "V_VP9" && colorSpace) fixVp9ColorSpace(frame.data, colorSpace.matrix);
    const relative = ts - current.timestampMs;
    const block = el(0xa1, [
      new Uint8Array([0x81]), // nomor track 1
      new Uint8Array([(relative >> 8) & 0xff, relative & 0xff]),
      new Uint8Array([0x00]), // flags
      frame.data,
    ]);
    const parts = [block, uint(0x9b, Math.round(frameDurationMs))]; // BlockDuration
    // Frame non-keyframe wajib menyebut frame acuannya (ReferenceBlock, relatif).
    if (!frame.isKey) parts.push(int16(0xfb, previousTs - ts));
    parts.push(
      el(0x75a1, [
        el(0xa6, [
          uint(0xee, 1), // BlockAddID 1 = alpha
          el(0xa5, frame.alpha), // BlockAdditional
        ]),
      ])
    );
    current.blocks.push(el(0xa0, parts)); // BlockGroup
    previousTs = ts;
  }
  const clusterBytes = clusters.map((c) => el(0x1f43b675, [uint(0xe7, c.timestampMs), ...c.blocks]));

  // Daftar lompatan (Cues) ditaruh SEBELUM cluster, supaya pemutar langsung menemukannya.
  // Posisi cluster ditulis 8 byte, jadi ukuran Cues bisa dihitung sebelum posisinya diketahui.
  const buildCues = (positions) =>
    el(
      0x1c53bb6b,
      clusters.map((c, i) =>
        el(0xbb, [
          uint(0xb3, c.timestampMs), // CueTime
          el(0xb7, [uint(0xf7, 1), uint(0xf1, positions[i], 8)]), // CueTrack, CueClusterPosition
        ])
      )
    );
  const cuesSize = buildCues(clusters.map(() => 0)).length;
  const positions = [];
  let offset = info.length + tracks.length + cuesSize;
  for (const bytes of clusterBytes) {
    positions.push(offset);
    offset += bytes.length;
  }
  const cues = buildCues(positions);

  const segment = el(0x18538067, [info, tracks, cues, ...clusterBytes]);
  return concat([header, segment]);
}
