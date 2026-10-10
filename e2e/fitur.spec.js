// Fitur A2–A5: undo color picker, simpan pengaturan setelah refresh, nama file export.
import { test, expect } from "@playwright/test";
import {
  STORAGE_KEY,
  editorState,
  openColorPicker,
  openEditor,
  openExportModal,
  pickSegment,
  readHex,
  typeHex,
} from "./helpers.js";

test("A3: satu kali geser color picker = 1 langkah undo", async ({ page }) => {
  await openEditor(page);
  const undo = page.getByRole("button", { name: "Undo" });
  const before = await readHex(page, "color");
  await expect(undo).toBeDisabled();

  // Geser di area warna dengan banyak gerakan kecil, seperti tangan user
  const popover = await openColorPicker(page, "color");
  const box = await popover.locator(".color-area").boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, { steps: 25 });
  await page.mouse.up();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();

  const after = await readHex(page, "color");
  expect(after, "warna harus berubah setelah digeser").not.toBe(before);

  // Satu Undo langsung kembali ke warna awal, dan tidak ada langkah lain yang tersisa
  await undo.click();
  await expect.poll(() => readHex(page, "color")).toBe(before);
  await expect(undo).toBeDisabled();
});

test("A5: refresh halaman menyimpan pengaturan", async ({ page }) => {
  await openEditor(page);

  await page.locator(".character-card", { hasText: "Capybara" }).click();
  await page.locator(".select__trigger").click();
  await page.getByRole("option", { name: "Love" }).click();
  await typeHex(page, "color", "#22C55E");
  await typeHex(page, "background", "#3B82F6");
  await page.getByRole("textbox", { name: "Project name" }).fill("Kopi Pagi");

  // Tunggu sampai tersimpan (aplikasi menyimpan 300ms setelah perubahan terakhir)
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .toContain("Kopi Pagi");

  await page.reload();
  await expect(page.locator(".character-card", { hasText: "Capybara" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".select__value")).toHaveText(/love/i);
  expect(await readHex(page, "color")).toBe("22C55E");
  expect(await readHex(page, "background")).toBe("3B82F6");
  await expect(page.getByRole("textbox", { name: "Project name" })).toHaveValue("Kopi Pagi");
});

test("A2: nama proyek 'Kopi Pagi' jadi nama file kopi-pagi", async ({ page }) => {
  await openEditor(page, { state: editorState(), projectName: "Kopi Pagi" });
  const dialog = await openExportModal(page);
  await pickSegment(dialog, "Format", "SVG");

  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Export", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("kopi-pagi.svg");
});

test("A2: nama proyek kosong jadi <karakter>-<mood>", async ({ page }) => {
  await openEditor(page, { state: editorState({ characterId: "capybara", mood: "love", shapePreset: null }) });
  const dialog = await openExportModal(page);
  await pickSegment(dialog, "Format", "SVG");

  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Export", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("capybara-love.svg");
});
