// F1b: UKUR export GIF tanpa mengubah kode aplikasi. Jalankan: npm run ukur:gif
// (tidak ikut `npm run test:e2e`, lihat playwright.ukur.config.js)
//
// "Stopwatch" dipasang dari luar sebelum aplikasi jalan (addInitScript):
//   - getImageData 1× per frame di exportAsGif  → tahap memotret
//   - pesan ke/dari worker gif.js               → tahap kompresi
//   - klik link unduhan                         → file selesai
// Setelan `quality` gif.js juga diganti dari luar: nilai di pesan ke worker ditimpa
// (kode aplikasi tetap `quality: 1`). File contoh disimpan di ukur-hasil/gif/ (tidak di-commit).
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { editorState, openEditor, openExportModal, pickSegment } from "./helpers.js";

const OUT_DIR = path.join(process.cwd(), "ukur-hasil", "gif");

function installStopwatch({ size, quality }) {
  const u = (window.__ukur = { t0: null, frames: [], posts: [], replies: [], done: null, quality: [] });
  const now = () => performance.now();

  const getImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h, ...rest) {
    if (u.t0 !== null && w === size && h === size) u.frames.push(now());
    return getImageData.call(this, x, y, w, h, ...rest);
  };

  const postMessage = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function (message, ...rest) {
    if (u.t0 !== null) {
      u.posts.push(now());
      if (message && typeof message === "object" && "quality" in message) {
        message.quality = quality;
        u.quality.push(message.quality);
      }
    }
    return postMessage.call(this, message, ...rest);
  };

  const onmessage = Object.getOwnPropertyDescriptor(Worker.prototype, "onmessage");
  Object.defineProperty(Worker.prototype, "onmessage", {
    configurable: true,
    get() {
      return onmessage.get.call(this);
    },
    set(fn) {
      const wrapped =
        typeof fn === "function"
          ? function (e) {
              if (u.t0 !== null) u.replies.push(now());
              return fn.call(this, e);
            }
          : fn;
      onmessage.set.call(this, wrapped);
    },
  });

  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (u.t0 !== null && this.hasAttribute("download")) u.done = now();
    return click.call(this);
  };
}

function summarize(u) {
  const s = (ms) => (ms == null ? null : Math.round(ms / 100) / 10);
  const lastFrame = u.frames.at(-1);
  return {
    frame: u.frames.length,
    quality: [...new Set(u.quality)].join(","),
    total: s(u.done != null ? u.done - u.t0 : null),
    memotret: s(lastFrame != null ? lastFrame - u.t0 : null),
    kompresi: s(u.posts.length && u.replies.length ? u.replies.at(-1) - u.posts[0] : null),
  };
}

const CHARACTERS = [
  { id: "mochi", state: editorState() },
  { id: "capybara", state: editorState({ characterId: "capybara", shapePreset: null, color: "#F28C3E" }) },
];
const SIZES = [240, 720];
const QUALITIES = [1, 10, 20];

for (const size of SIZES) {
  for (const c of CHARACTERS) {
    for (const quality of QUALITIES) {
      const name = `${c.id}-${size}p-q${quality}`;
      test(name, async ({ page }) => {
        await page.addInitScript(installStopwatch, { size, quality });
        await openEditor(page, { state: c.state });

        const dialog = await openExportModal(page);
        await pickSegment(dialog, "Format", "GIF");
        await pickSegment(dialog, "Resolution", `${size}p`);
        await pickSegment(dialog, "Frame rate", "30 fps");

        const download = page.waitForEvent("download", { timeout: 55_000 });
        download.catch(() => {});
        await page.evaluate(() => (window.__ukur.t0 = performance.now()));
        await dialog.getByRole("button", { name: "Export", exact: true }).click();

        // Angka tetap dilaporkan walau export tidak selesai dalam batas waktu tes.
        let sizeKb = null;
        try {
          const file = await download;
          fs.mkdirSync(OUT_DIR, { recursive: true });
          const target = path.join(OUT_DIR, `${name}.gif`);
          await file.saveAs(target);
          sizeKb = Math.round(fs.statSync(target).size / 1024);
        } finally {
          const result = { ...summarize(await page.evaluate(() => window.__ukur)), "ukuran (KB)": sizeKb };
          console.log(`[UKUR] ${name} ${JSON.stringify(result)}`);
        }
        expect(sizeKb).not.toBeNull();
      });
    }
  }
}
