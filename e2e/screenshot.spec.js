// B3 "Selesai kalau": screenshot terang + gelap tiap layar, disimpan di docs/reference/fase-2/.
import { test, expect } from "@playwright/test";
import path from "node:path";
import { hideDevOverlay, openColorPicker, openEditor, openExportModal } from "./helpers.js";

const OUT_DIR = path.join("docs", "reference", "fase-2");
const MODE_NAME = { light: "terang", dark: "gelap" };

for (const theme of ["light", "dark"]) {
  test(`screenshot mode ${MODE_NAME[theme]}`, async ({ page }) => {
    await openEditor(page, { theme });
    await hideDevOverlay(page);
    // Hentikan karakter supaya gambar tidak blur di tengah gerakan
    await page.getByRole("button", { name: "Pause" }).click();
    const shot = (name) =>
      page.screenshot({ path: path.join(OUT_DIR, `${name}-${MODE_NAME[theme]}.png`), animations: "disabled" });

    await shot("utama");

    const popover = await openColorPicker(page, "color");
    await shot("color-picker");
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();

    const dialog = await openExportModal(page);
    await expect(dialog).not.toHaveAttribute("data-entering", "true");
    await shot("export");
  });
}
