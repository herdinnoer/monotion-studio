// Fase 3 F1c (P-18): mata berkedip saat preview diputar, tapi tidak pernah saat export.
// Jam halaman dikendalikan Playwright (page.clock), jadi 15 detik "waktu halaman" selesai cepat.
import { test, expect } from "@playwright/test";
import { editorState, openEditor } from "./helpers.js";

// Dipasang di halaman: hitung berapa kali mata terpejam muncul (mata bulat Mochi saat kedip =
// garis hitam, lihat _core/parts/Eyes.jsx). Begitu kedip pertama terlihat, langsung kirim
// sinyal "mulai export", sama seperti exportUtils.js, supaya kasus "export mulai di tengah
// kedip" ikut dites.
function watchBlinks() {
  const blinkSelector = '#character-workspace g[stroke="#18181B"] > line';
  window.__kedip = { beforeExport: 0, afterExport: 0, exporting: false };
  const observer = new MutationObserver((records) => {
    const added = records.some((r) =>
      [...r.addedNodes].some((n) => n.nodeType === 1 && (n.matches(blinkSelector) || n.querySelector(blinkSelector))),
    );
    if (!added) return;
    if (window.__kedip.exporting) {
      window.__kedip.afterExport++;
      return;
    }
    window.__kedip.beforeExport++;
    window.__kedip.exporting = true;
    window.dispatchEvent(
      new CustomEvent("character-timeline-update", {
        detail: { progress: 0, isPlaying: false, isExporting: true, durationMs: 3600 },
      }),
    );
  });
  observer.observe(document.querySelector("#character-workspace"), { childList: true, subtree: true });
  window.__kedipTerlihat = () => document.querySelectorAll(blinkSelector).length;
}

test("F1c: kedip saat diputar, tidak pernah kedip selama export", async ({ page }) => {
  await page.clock.install();
  await openEditor(page, { state: editorState() });
  await page.evaluate(watchBlinks);

  // Diputar: kedip pasti muncul dalam 5,13 detik (jeda maksimal 5 detik + 130ms terpejam)
  await page.clock.runFor(6_000);
  const awal = await page.evaluate(() => window.__kedip);
  expect(awal.beforeExport, "mata harus berkedip saat preview diputar").toBe(1);

  // Export dimulai tepat saat mata terpejam: mata harus terbuka lagi dan tidak kedip lagi
  await page.clock.runFor(15_000);
  const akhir = await page.evaluate(() => ({ ...window.__kedip, terpejam: window.__kedipTerlihat() }));
  expect(akhir.terpejam, "mata tidak boleh tertinggal terpejam").toBe(0);
  expect(akhir.afterExport, "tidak boleh ada kedip selama export").toBe(0);
});
