// Tes paket kondisi editor (Fase 2 A6). Jalankan: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BACKGROUND,
  createInitialState,
  exportFilename,
  isSameState,
  sanitizeState,
} from "./editorState.js";
import { capybara, covey, testCharacters } from "./testCharacters.js";

const coveyDefault = createInitialState(covey);

test("T-1: paket bukan objek / kosong → default karakter pertama", () => {
  for (const raw of [null, undefined, "", "teks", 42, [], [1, 2]]) {
    assert.deepEqual(sanitizeState(raw, testCharacters), coveyDefault);
  }
});

test("T-2: karakter tidak ada di registry → karakter default", () => {
  const result = sanitizeState({ characterId: "kucing", mood: "happy" }, testCharacters);
  assert.equal(result.characterId, "covey");
});

test("T-3: mood tidak dimiliki karakter → defaultMood karakter", () => {
  const result = sanitizeState({ characterId: "capybara", mood: "idle" }, testCharacters);
  assert.equal(result.mood, "happy");
});

test("T-4: warna tidak valid → warna default", () => {
  for (const bad of ["merah", "#12", null, "#GGGGGG"]) {
    const result = sanitizeState(
      { characterId: "capybara", color: bad, backgroundColor: bad },
      testCharacters
    );
    assert.equal(result.color, capybara.defaultColor, `color ${bad}`);
    assert.equal(result.backgroundColor, DEFAULT_BACKGROUND, `background ${bad}`);
  }
});

test("paket valid tetap utuh", () => {
  const saved = {
    characterId: "capybara",
    mood: "sleep",
    shapePreset: "tall",
    color: "#ABCDEF",
    backgroundColor: "#112233",
    isBgRemoved: true,
  };
  assert.deepEqual(sanitizeState(saved, testCharacters), saved);
});

test("T-5: warna huruf kecil vs besar dianggap sama", () => {
  const a = { ...coveyDefault, color: "#ff0000", backgroundColor: "#ffffff" };
  const b = { ...coveyDefault, color: "#FF0000", backgroundColor: "#FFFFFF" };
  assert.equal(isSameState(a, b), true);
  assert.equal(isSameState(a, { ...b, mood: "happy" }), false);
});

// T-14 s/d T-19: nama file export
const filename = (projectName) =>
  exportFilename({ projectName, characterName: "Capybara", mood: "happy" });

test("T-14: spasi berlebih", () => {
  assert.equal(filename("  Kopi   Pagi  "), "kopi-pagi");
});

test("T-15: nama kosong / hanya spasi → <karakter>-<mood>", () => {
  assert.equal(filename(""), "capybara-happy");
  assert.equal(filename("   "), "capybara-happy");
  assert.equal(filename(undefined), "capybara-happy");
});

test("T-16: simbol jadi strip, strip di akhir dibuang", () => {
  assert.equal(filename("Kopi/Pagi?"), "kopi-pagi");
});

test("T-17: strip berurutan digabung", () => {
  assert.equal(filename("a//b"), "a-b");
  assert.equal(filename("a / b"), "a-b");
  assert.equal(filename("Kopi 🐹 Pagi"), "kopi-pagi");
});

test("T-18: strip di awal/akhir dibuang", () => {
  assert.equal(filename("?Kopi*"), "kopi");
  assert.equal(filename("--Kopi--"), "kopi");
});

test("T-19: hanya simbol/emoji → <karakter>-<mood>", () => {
  assert.equal(filename("???"), "capybara-happy");
  assert.equal(filename("🐹🐹"), "capybara-happy");
});
