// B3 poin 7–9: OS gelap + Monotion terang, background karakter tidak ikut tema,
// dan prefers-reduced-motion (modal/popover hanya fade, tanpa skala).
import { test, expect } from "@playwright/test";
import {
  TOKENS,
  colorTrigger,
  currentTheme,
  editorState,
  exportButton,
  openEditor,
  switchTheme,
} from "./helpers.js";

test.describe("OS gelap", () => {
  test.use({ colorScheme: "dark" });

  test("pilih mode terang di Monotion → tetap terang, juga setelah refresh", async ({ page }) => {
    await openEditor(page);
    expect(await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches)).toBe(true);

    await switchTheme(page, "light");
    await page.reload();
    await expect(exportButton(page)).toBeVisible();

    expect(await currentTheme(page)).toBe("light");
    await expect(page.locator("body")).toHaveCSS("background-color", TOKENS.light.bgApp);
    await expect(page.locator("header")).toHaveCSS("background-color", TOKENS.light.surface);
    await expect(page.locator("header")).toHaveCSS("color", "rgb(17, 17, 19)");
  });
});

for (const [bg, rgb] of [
  ["#FFFFFF", "rgb(255, 255, 255)"],
  ["#EF4444", "rgb(239, 68, 68)"],
]) {
  test(`background karakter ${bg} tidak berubah saat ganti tema`, async ({ page }) => {
    await openEditor(page, { theme: "dark", state: editorState({ backgroundColor: bg }) });
    const workspace = page.locator("#character-workspace");
    await expect(workspace).toHaveCSS("background-color", rgb);
    await switchTheme(page, "light");
    await expect(workspace).toHaveCSS("background-color", rgb);
    await switchTheme(page, "dark");
    await expect(workspace).toHaveCSS("background-color", rgb);
  });
}

// Rekam gaya elemen di setiap frame selama 1 detik setelah dibuka: apakah ada animasi fade
// (mulai dari transparan), skala (bukan 1), atau geser. Tailwind menulis skala sebagai
// "calc(97*1%)", jadi diubah dulu jadi angka 0.97.
async function recordOpening(page, selector, open) {
  await page.evaluate((selector) => {
    const toScale = (raw) => {
      const pct = raw.match(/calc\(([\d.]+)\s*\*\s*1%\)/);
      if (pct) return parseFloat(pct[1]) / 100;
      const n = parseFloat(raw);
      return Number.isNaN(n) ? 1 : n;
    };
    const rec = { frames: 0, animatedFrames: 0, minScale: 1, fade: false, moved: false };
    window.__opening = rec;
    const start = performance.now();
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        rec.frames++;
        const cs = getComputedStyle(el);
        const v = (name) => cs.getPropertyValue(name).trim();
        if (cs.animationName !== "none") {
          rec.animatedFrames++;
          rec.minScale = Math.min(rec.minScale, toScale(v("--tw-enter-scale")));
          if (parseFloat(v("--tw-enter-opacity")) === 0) rec.fade = true;
          if (parseFloat(v("--tw-enter-translate-x") || "0") || parseFloat(v("--tw-enter-translate-y") || "0")) {
            rec.moved = true;
          }
        }
      }
      if (performance.now() - start < 1000) requestAnimationFrame(tick);
      else rec.done = true;
    };
    requestAnimationFrame(tick);
  }, selector);
  await open();
  await expect.poll(() => page.evaluate(() => window.__opening.done)).toBe(true);
  return page.evaluate(() => window.__opening);
}

async function recordBoth(page) {
  const popover = await recordOpening(page, ".color-picker__popover", () => colorTrigger(page, "color").click());
  await page.keyboard.press("Escape");
  await expect(page.locator(".color-picker__popover")).toBeHidden();
  const modal = await recordOpening(page, ".modal__container", () => exportButton(page).click());
  return { popover, modal };
}

test.describe("reduced-motion aktif", () => {
  test.use({ reducedMotion: "reduce" });

  test("modal & popover muncul tanpa skala/geser", async ({ page }, testInfo) => {
    await openEditor(page);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const seen = await recordBoth(page);
    testInfo.annotations.push({ type: "rekaman gerakan", description: JSON.stringify(seen) });

    for (const [kind, rec] of Object.entries(seen)) {
      expect(rec.frames, `${kind} harus tampil`).toBeGreaterThan(0);
      expect(rec.minScale, `${kind} tidak boleh membesar`).toBe(1);
      expect(rec.moved, `${kind} tidak boleh bergeser`).toBe(false);
    }
  });

  // DESIGN.md bagian 7: "matikan animasi skala, sisakan fade".
  test("modal & popover tetap fade (DESIGN.md bagian 7)", async ({ page }, testInfo) => {
    await openEditor(page);
    const seen = await recordBoth(page);
    testInfo.annotations.push({ type: "rekaman gerakan", description: JSON.stringify(seen) });
    expect(seen.popover.fade, "popover fade").toBe(true);
    expect(seen.modal.fade, "modal fade (sekarang muncul seketika tanpa animasi)").toBe(true);
  });
});

test("pembanding tanpa reduced-motion: modal membesar dari 0.95, popover dari 0.97", async ({ page }) => {
  await openEditor(page);
  const seen = await recordBoth(page);
  expect(seen.modal.minScale).toBeCloseTo(0.95, 2);
  expect(seen.popover.minScale).toBeCloseTo(0.97, 2);
  expect(seen.modal.fade && seen.popover.fade).toBe(true);
});
