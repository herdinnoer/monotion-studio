// Tes simpan/baca pengaturan di browser (Fase 2 A5 & A6). Jalankan: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadSaved, parseSaved } from "./editorStorage.js";
import { createInitialState } from "./editorState.js";
import { covey, testCharacters } from "./testCharacters.js";

const defaults = { state: createInitialState(covey), projectName: "" };

test("T-1: isi localStorage rusak / bukan objek / kosong → default tanpa error", () => {
  for (const text of [null, "", "ngawur{{", '"teks"', "42", "[1,2]", "null", '{"state":5}']) {
    assert.deepEqual(parseSaved(text, testCharacters), defaults, `isi: ${text}`);
  }
});

test("T-2 & T-3 lewat localStorage: karakter & mood tak dikenal dirapikan", () => {
  const text = JSON.stringify({ state: { characterId: "kucing", mood: "terbang" } });
  const { state } = parseSaved(text, testCharacters);
  assert.equal(state.characterId, "covey");
  assert.equal(state.mood, "idle");
});

test("T-21: nama proyek ikut tersimpan dan terbaca lagi", () => {
  const text = JSON.stringify({ state: defaults.state, projectName: "Kopi Pagi" });
  assert.equal(parseSaved(text, testCharacters).projectName, "Kopi Pagi");
});

test("nama proyek bukan teks → kosong", () => {
  const text = JSON.stringify({ state: defaults.state, projectName: 42 });
  assert.equal(parseSaved(text, testCharacters).projectName, "");
});

test("tanpa browser (tidak ada window) → default tanpa error", () => {
  assert.deepEqual(loadSaved(testCharacters), defaults);
});
