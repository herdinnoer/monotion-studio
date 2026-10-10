// DESIGN.md bagian 3: semua popover & dropdown memakai surface-raised, di mode terang dan gelap.
import { test, expect } from "@playwright/test";
import { colorTrigger, openEditor } from "./helpers.js";

const SURFACE_RAISED = { light: "rgb(236, 236, 239)", dark: "rgb(35, 35, 40)" };

// Cara membuka tiap popover + selector popover-nya
const POPOVERS = [
  { name: "dropdown mood", selector: ".select__popover", open: (page) => page.locator(".select__trigger").click() },
  { name: "color picker Background", selector: ".color-picker__popover", open: (page) => colorTrigger(page, "background").click() },
  { name: "color picker Color", selector: ".color-picker__popover", open: (page) => colorTrigger(page, "color").click() },
];

for (const theme of ["light", "dark"]) {
  test(`mode ${theme === "light" ? "terang" : "gelap"}: semua popover memakai surface-raised`, async ({ page }, testInfo) => {
    await openEditor(page, { theme });
    const found = [];

    for (const popover of POPOVERS) {
      await popover.open(page);
      const el = page.locator(popover.selector);
      await expect(el).toBeVisible();
      await expect(el).not.toHaveAttribute("data-entering", "true");
      found.push({ name: popover.name, background: await el.evaluate((n) => getComputedStyle(n).backgroundColor) });
      await page.keyboard.press("Escape");
      await expect(el).toBeHidden();
    }

    testInfo.annotations.push({ type: "latar popover", description: JSON.stringify(found) });
    expect(found).toEqual(POPOVERS.map((p) => ({ name: p.name, background: SURFACE_RAISED[theme] })));
  });
}
