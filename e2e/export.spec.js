// A4 & A6: export GIF / WebM / SVG dengan background warna dan transparan (cek piksel pojok),
// dan klik Export dua kali = 1 file.
import { test, expect } from "@playwright/test";
import {
  editorState,
  openEditor,
  openExportModal,
  pickSegment,
  readDownloadedPixel,
} from "./helpers.js";

const RED = "#EF4444";
const RED_RGB = [239, 68, 68];
// GIF memakai palet terbatas dan WebM dikompres, jadi warna boleh meleset sedikit.
const TOLERANCE = 12;

const FORMATS = [
  { label: "GIF", ext: "gif", mime: "image/gif", size: 240 },
  { label: "WebM", ext: "webm", mime: "video/webm", size: 240 },
  { label: "SVG", ext: "svg", mime: "image/svg+xml" },
];

async function exportFile(page, format) {
  const dialog = await openExportModal(page);
  await pickSegment(dialog, "Format", format.label);
  if (format.size) {
    // Resolusi & fps terkecil supaya tes cepat
    await pickSegment(dialog, "Resolution", "240p");
    await pickSegment(dialog, "Frame rate", "30 fps");
  }
  const download = page.waitForEvent("download", { timeout: 50_000 });
  await dialog.getByRole("button", { name: "Export", exact: true }).click();
  return download;
}

for (const format of FORMATS) {
  test(`${format.label} dengan background merah: pojok merah`, async ({ page }) => {
    await openEditor(page, { state: editorState({ backgroundColor: RED }) });
    const download = await exportFile(page, format);
    expect(download.suggestedFilename()).toBe(`mochi-idle.${format.ext}`);

    const pixel = await readDownloadedPixel(page, download, format.mime);
    if (format.size) expect([pixel.width, pixel.height]).toEqual([format.size, format.size]);
    expect(pixel.rgba[3], "pojok harus padat").toBe(255);
    pixel.rgba.slice(0, 3).forEach((v, i) => expect(Math.abs(v - RED_RGB[i])).toBeLessThanOrEqual(TOLERANCE));
  });

  test(`${format.label} dengan Remove Background: pojok transparan`, async ({ page }) => {
    await openEditor(page, { state: editorState({ backgroundColor: RED, isBgRemoved: true }) });
    const download = await exportFile(page, format);

    const pixel = await readDownloadedPixel(page, download, format.mime);
    if (format.size) expect([pixel.width, pixel.height]).toEqual([format.size, format.size]);
    expect(pixel.rgba[3], `pojok harus tembus (alpha 0), dapat ${pixel.rgba}`).toBeLessThanOrEqual(5);
  });
}

test("klik Export dua kali cepat = 1 file", async ({ page }) => {
  await openEditor(page, { state: editorState() });
  const downloads = [];
  page.on("download", (d) => downloads.push(d));

  const dialog = await openExportModal(page);
  await pickSegment(dialog, "Format", "GIF");
  await pickSegment(dialog, "Resolution", "240p");
  await pickSegment(dialog, "Frame rate", "30 fps");
  await dialog.getByRole("button", { name: "Export", exact: true }).dblclick();

  await expect.poll(() => downloads.length, { timeout: 50_000 }).toBeGreaterThan(0);
  await expect(dialog).toBeHidden();
  // Beri waktu untuk file kedua (kalau ada) supaya ikut terhitung
  await page.waitForTimeout(2_000);
  expect(downloads.map((d) => d.suggestedFilename())).toEqual(["mochi-idle.gif"]);
});
