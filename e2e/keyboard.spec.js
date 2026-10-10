// B3 poin 4 & B2: fokus keyboard selalu terlihat, dan Tab tidak keluar dari jendela Export.
import { test, expect } from "@playwright/test";
import { TOKENS, openEditor, openExportModal } from "./helpers.js";

// Cincin fokus HeroUI muncul dengan animasi singkat, jadi tunggu sebelum diukur.
const RING_SETTLE_MS = 300;

for (const theme of ["light", "dark"]) {
  test(`mode ${theme === "light" ? "terang" : "gelap"}: fokus Tab selalu terlihat cincin biru 2px`, async ({ page }, testInfo) => {
    await openEditor(page, { theme });
    const accent = TOKENS[theme].accent;
    const seen = [];
    const missing = [];

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(RING_SETTLE_MS);
      const result = await page.evaluate((accent) => {
        const el = document.activeElement;
        // Tombol "N" Next.js hanya ada saat `npm run dev`, bukan bagian aplikasi
        if (!el || el === document.body || el.tagName === "NEXTJS-PORTAL") return null;
        return {
          name: window.__b3.describe(el),
          // Nama proyek sengaja tanpa cincin (DESIGN.md bagian 8, input nama proyek)
          exempt: Boolean(el.closest(".inline-field") || el.classList.contains("inline-field")),
          visible: window.__b3.ringOf(el, accent),
        };
      }, accent);
      if (!result) continue;
      seen.push(`${result.visible ? "ok " : "X  "}${result.name}${result.exempt ? " (pengecualian)" : ""}`);
      if (!result.visible && !result.exempt) missing.push(result.name);
    }

    testInfo.annotations.push({ type: "urutan Tab", description: seen.join("\n") });
    console.log(seen.join("\n"));
    expect(seen.length, "Tab harus berpindah ke elemen").toBeGreaterThan(5);
    expect(missing, "Elemen tanpa cincin fokus terlihat").toEqual([]);
  });
}

test("Tab & Shift+Tab tidak keluar dari jendela Export", async ({ page }) => {
  await openEditor(page);
  const dialog = await openExportModal(page);
  await expect(dialog).not.toHaveAttribute("data-entering", "true");

  const insideDialog = () =>
    page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));

  for (const key of [...Array(20).fill("Tab"), ...Array(20).fill("Shift+Tab")]) {
    await page.keyboard.press(key);
    expect(await insideDialog(), `fokus keluar dari jendela setelah ${key}`).toBe(true);
  }
});
