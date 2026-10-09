// Tes warna kunci GIF transparan (Fase 2 A4 & A6). Jalankan: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyKeyColor,
  createColorUsage,
  hexToRgbNumber,
  markColor,
  pickKeyColor,
  prepareFrame,
} from "./gifKeyColor.js";

function usageOf(...colors) {
  const usage = createColorUsage();
  for (const c of colors) markColor(usage, c);
  return usage;
}

function distance(a, b) {
  const dr = ((a >> 16) & 0xff) - ((b >> 16) & 0xff);
  const dg = ((a >> 8) & 0xff) - ((b >> 8) & 0xff);
  const db = (a & 0xff) - (b & 0xff);
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

test("T-22: karakter tanpa warna neon → kunci #00FF00", () => {
  assert.equal(pickKeyColor(usageOf(0xc68b59, 0xffffff, 0x222222)), 0x00ff00);
});

test("T-23: karakter memakai hijau neon → kunci #FF00FF", () => {
  assert.equal(pickKeyColor(usageOf(0x00ff00)), 0xff00ff);
  assert.equal(pickKeyColor(usageOf(0x05f50a)), 0xff00ff);
});

test("T-24: tiga warna favorit pertama dipakai → kunci #0000FF", () => {
  assert.equal(pickKeyColor(usageOf(0x00ff00, 0xff00ff, 0x00ffff)), 0x0000ff);
});

test("T-25: semua 6 warna favorit dipakai → warna terjauh, jarak > 60", () => {
  const used = [0x00ff00, 0xff00ff, 0x00ffff, 0x0000ff, 0xffff00, 0xff0080];
  const key = pickKeyColor(usageOf(...used));
  for (const c of used) {
    assert.ok(distance(key, c) > 60, `jarak ke #${c.toString(16)} = ${distance(key, c)}`);
  }
});

test("T-26: tidak ada warna tercatat → kunci #00FF00", () => {
  assert.equal(pickKeyColor(createColorUsage()), 0x00ff00);
});

test("T-27: prepareFrame: alpha 100 → tembus, alpha 200 → padat, warna tidak berubah", () => {
  const data = new Uint8ClampedArray([10, 20, 30, 100, 40, 50, 60, 200]);
  prepareFrame(data, createColorUsage());
  assert.equal(data[3], 0);
  assert.deepEqual([...data.slice(4)], [40, 50, 60, 255]);
});

test("T-28: applyKeyColor: piksel tembus diisi warna kunci, piksel padat tetap", () => {
  const data = new Uint8ClampedArray([1, 2, 3, 0, 40, 50, 60, 255]);
  applyKeyColor(data, 0x00ff00);
  assert.deepEqual([...data], [0, 255, 0, 255, 40, 50, 60, 255]);
});

test("T-29: hexToRgbNumber", () => {
  assert.equal(hexToRgbNumber("#0f0"), 0x00ff00);
  assert.equal(hexToRgbNumber("00FF00"), 0x00ff00);
  assert.equal(hexToRgbNumber("bukan-hex"), null);
  assert.equal(hexToRgbNumber(null), null);
  assert.equal(hexToRgbNumber("#12"), null);
});
