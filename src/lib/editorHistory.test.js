// Tes riwayat undo/redo (Fase 2 A6). Jalankan: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  createHistory,
  currentState,
  historyReducer,
} from "./editorHistory.js";
import { createInitialState } from "./editorState.js";
import { covey } from "./testCharacters.js";

const start = createInitialState(covey);
const withColor = (color) => ({ ...start, color });

function run(history, ...actions) {
  return actions.reduce(historyReducer, history);
}

test("T-5: commit warna yang sama (beda huruf besar/kecil) bukan langkah baru", () => {
  const h1 = run(createHistory(start), { type: "commit", state: withColor("#ff0000") });
  const h2 = run(h1, { type: "commit", state: withColor("#FF0000") });
  assert.equal(h2, h1);
  assert.equal(h2.entries.length, 2);
});

test("T-6: undo di awal & redo di akhir tidak melakukan apa-apa", () => {
  const h = createHistory(start);
  assert.equal(canUndo(h), false);
  assert.equal(run(h, { type: "undo" }), h);

  const h2 = run(h, { type: "commit", state: withColor("#111111") });
  assert.equal(canRedo(h2), false);
  assert.equal(run(h2, { type: "redo" }), h2);
});

test("T-7: undo lalu ubah sesuatu → cabang redo terbuang", () => {
  const h = run(
    createHistory(start),
    { type: "commit", state: withColor("#111111") },
    { type: "commit", state: withColor("#222222") },
    { type: "undo" },
    { type: "commit", state: withColor("#333333") }
  );
  assert.deepEqual(
    h.entries.map((s) => s.color),
    [start.color, "#111111", "#333333"]
  );
  assert.equal(h.index, 2);
  assert.equal(canRedo(h), false);
});

test("T-8: lebih dari batas riwayat → langkah tertua terbuang, index benar", () => {
  let h = createHistory(start);
  const total = HISTORY_LIMIT + 5;
  for (let i = 1; i <= total; i++) {
    h = historyReducer(h, { type: "commit", state: withColor(`#${String(i).padStart(6, "0")}`) });
  }
  // Langkah aktif + maksimal 100 langkah undo
  assert.equal(h.entries.length, HISTORY_LIMIT + 1);
  assert.equal(h.index, HISTORY_LIMIT);
  assert.equal(currentState(h).color, `#${String(total).padStart(6, "0")}`);
  assert.equal(h.entries[0].color, `#${String(total - HISTORY_LIMIT).padStart(6, "0")}`);

  // Undo 100 kali sampai paling awal, lalu sekali lagi tidak error
  for (let i = 0; i < HISTORY_LIMIT; i++) h = historyReducer(h, { type: "undo" });
  assert.equal(h.index, 0);
  assert.equal(canUndo(h), false);
  assert.equal(historyReducer(h, { type: "undo" }), h);
});

test("draf geser warna: tampil tapi belum jadi langkah; undo membatalkan draf", () => {
  const h = run(createHistory(start), { type: "preview", state: withColor("#ABCDEF") });
  assert.equal(currentState(h).color, "#ABCDEF");
  assert.equal(h.entries.length, 1);
  assert.equal(canUndo(h), true);
  assert.equal(canRedo(h), false);

  const undone = run(h, { type: "undo" });
  assert.equal(undone.draft, null);
  assert.equal(currentState(undone).color, start.color);
});

test("draf lalu commit → satu langkah saja, draf hilang", () => {
  const h = run(
    createHistory(start),
    { type: "preview", state: withColor("#AAAAAA") },
    { type: "preview", state: withColor("#BBBBBB") },
    { type: "commit", state: withColor("#BBBBBB") }
  );
  assert.equal(h.entries.length, 2);
  assert.equal(h.draft, null);
});

test("T-20: nama proyek tidak ada di riwayat undo", () => {
  const h = run(createHistory(start), { type: "commit", state: withColor("#111111") });
  for (const entry of h.entries) assert.equal("projectName" in entry, false);
});
