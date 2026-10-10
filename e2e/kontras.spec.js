// B3 poin 3: teks utama & teks di tombol aksen minimal 4.5:1, di mode terang dan gelap.
import { test, expect } from "@playwright/test";
import { openEditor, openExportModal, exportButton } from "./helpers.js";

const MIN_RATIO = 4.5;

async function measure(locator) {
  await expect(locator).toBeVisible();
  return locator.evaluate((el) => ({ name: window.__b3.describe(el), ...window.__b3.contrastOf(el) }));
}

function report(testInfo, results) {
  const lines = results.map((r) => `${r.ratio.toFixed(2)}:1  ${r.fg} di atas ${r.bg}  ${r.name}`);
  testInfo.annotations.push({ type: "kontras", description: lines.join("\n") });
  console.log(lines.join("\n"));
}

for (const theme of ["light", "dark"]) {
  test.describe(`mode ${theme === "light" ? "terang" : "gelap"}`, () => {
    test("teks utama & teks tombol aksen minimal 4.5:1", async ({ page }, testInfo) => {
      await openEditor(page, { theme });

      const targets = [
        // Teks utama (token `text`)
        page.getByRole("heading", { name: "Customizer" }),
        page.locator("aside span", { hasText: /^Characters$/ }),
        page.locator(".character-card .font-semibold").first(),
        page.locator(".select__value"),
        page.locator(".color-picker__trigger span").first(),
        page.getByText("Remove Background", { exact: true }),
        // Teks aksen: tombol Export (glossy) & link Reset
        exportButton(page),
        page.getByRole("button", { name: "Reset" }).first(),
      ];
      const results = [];
      for (const target of targets) results.push(await measure(target));

      // Jendela Export: judul + tombol Export di dalamnya
      const dialog = await openExportModal(page);
      await expect(dialog).not.toHaveAttribute("data-entering", "true");
      results.push(await measure(dialog.getByRole("heading", { name: "Export" })));
      results.push(await measure(dialog.getByRole("button", { name: "Export", exact: true })));

      report(testInfo, results);
      const failed = results.filter((r) => r.ratio < MIN_RATIO);
      expect(failed, `Kontras di bawah ${MIN_RATIO}:1`).toEqual([]);
    });
  });
}
