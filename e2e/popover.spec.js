// DESIGN.md bagian 3, 5 & 8: semua popover & dropdown memakai surface-raised dengan sudut 12px,
// dan elemen isian di dalamnya (kolom, tombol berlatar) memakai surface. Mode terang dan gelap.
import { test, expect } from "@playwright/test";
import { colorTrigger, openColorPicker, openEditor } from "./helpers.js";

const SURFACE_RAISED = { light: "rgb(236, 236, 239)", dark: "rgb(35, 35, 40)" };
const SURFACE = { light: "rgb(255, 255, 255)", dark: "rgb(22, 22, 24)" };
const RADIUS = "12px";
// Elemen isian & tombol berlatar (sama dengan aturan umum di globals.css)
const FIELDS = ".input, .input-group, .color-input-group, .text-area, .button--secondary, .button--tertiary";

// Cara membuka tiap popover + selector popover-nya
const POPOVERS = [
  { name: "dropdown mood", selector: ".select__popover", open: (page) => page.locator(".select__trigger").click() },
  { name: "color picker Background", selector: ".color-picker__popover", open: (page) => colorTrigger(page, "background").click() },
  { name: "color picker Color", selector: ".color-picker__popover", open: (page) => colorTrigger(page, "color").click() },
];

for (const theme of ["light", "dark"]) {
  test(`mode ${theme === "light" ? "terang" : "gelap"}: popover surface-raised 12px, isian di dalamnya surface`, async ({ page }, testInfo) => {
    await openEditor(page, { theme });
    const found = [];

    for (const popover of POPOVERS) {
      await popover.open(page);
      const el = page.locator(popover.selector);
      await expect(el).toBeVisible();
      await expect(el).not.toHaveAttribute("data-entering", "true");
      found.push(
        await el.evaluate(
          (node, { name, fields }) => {
            const cs = getComputedStyle(node);
            return {
              name,
              background: cs.backgroundColor,
              radius: cs.borderRadius,
              fields: [...node.querySelectorAll(fields)].map((f) => ({
                field: f.getAttribute("aria-label") || f.className.split(" ")[0],
                background: getComputedStyle(f).backgroundColor,
              })),
              // Kotak berlatar/bergaris di dalam popover yang sudutnya tidak lebih kecil dari popover
              innerRadiusTooBig: [...node.querySelectorAll(".color-area, " + fields)]
                .filter((f) => parseFloat(getComputedStyle(f).borderTopLeftRadius) >= parseFloat(cs.borderTopLeftRadius))
                .map((f) => f.className.split(" ")[0]),
            };
          },
          { name: popover.name, fields: FIELDS },
        ),
      );
      await page.keyboard.press("Escape");
      await expect(el).toBeHidden();
    }

    testInfo.annotations.push({ type: "popover", description: JSON.stringify(found) });

    // Semua popover: latar & sudut sama
    expect(found.map(({ name, background, radius }) => ({ name, background, radius }))).toEqual(
      POPOVERS.map((p) => ({ name: p.name, background: SURFACE_RAISED[theme], radius: RADIUS })),
    );

    // Aturan sudut bersarang (DESIGN.md bagian 5): isi popover lebih kecil dari 12px
    expect(found.flatMap((p) => p.innerRadiusTooBig)).toEqual([]);

    // Elemen isian di dalam popover: surface. Color picker wajib punya kolom hex + tombol acak.
    const fields = found.flatMap((p) => p.fields.map((f) => ({ popover: p.name, ...f })));
    expect(found.filter((p) => p.name.startsWith("color picker")).every((p) => p.fields.length >= 2)).toBe(true);
    expect(fields).toEqual(fields.map((f) => ({ ...f, background: SURFACE[theme] })));
  });
}

// Jarak popover color picker ke kolom warna: 8px saat dibuka, dan tetap sama setelah warna
// diganti lewat preset, geser kotak warna, atau ketik hex (dulu popover melompat setelah klik
// preset karena patokan posisinya pindah ke tombol acak).
const GAP = 8;
// Posisi popover dibulatkan ke piksel bulat, sedangkan kolom bisa di posisi pecahan
const GAP_TOLERANCE = 1;

async function popoverGap(page, which) {
  return colorTrigger(page, which).evaluate((trigger) => {
    const field = trigger.parentElement.getBoundingClientRect();
    const popover = document.querySelector(".color-picker__popover").getBoundingClientRect();
    return popover.bottom <= field.top ? field.top - popover.bottom : popover.top - field.bottom;
  });
}

for (const which of ["background", "color"]) {
  test(`color picker ${which}: jarak popover ke kolom tetap ${GAP}px setelah ganti warna`, async ({ page }, testInfo) => {
    await openEditor(page);
    const popover = await openColorPicker(page, which);
    const gaps = [["dibuka", await popoverGap(page, which)]];

    for (const index of [0, 3, 6]) {
      await popover.locator(".color-swatch-picker__item").nth(index).click();
      await page.waitForTimeout(200);
      gaps.push([`preset ${index + 1}`, await popoverGap(page, which)]);
    }

    const area = await popover.locator(".color-area").boundingBox();
    await page.mouse.move(area.x + area.width * 0.3, area.y + area.height * 0.3);
    await page.mouse.down();
    await page.mouse.move(area.x + area.width * 0.7, area.y + area.height * 0.6, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    gaps.push(["geser kotak warna", await popoverGap(page, which)]);

    const field = popover.getByRole("textbox");
    await field.fill("#3B82F6");
    await field.press("Enter");
    await page.waitForTimeout(200);
    gaps.push(["ketik hex", await popoverGap(page, which)]);

    testInfo.annotations.push({ type: "jarak", description: gaps.map(([k, v]) => `${k}: ${v.toFixed(1)}px`).join(", ") });
    for (const [step, gap] of gaps) {
      expect(Math.abs(gap - gaps[0][1]), `jarak berubah setelah ${step}`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(gap - GAP), `jarak ${step} harus ±${GAP}px`).toBeLessThanOrEqual(GAP_TOLERANCE);
    }
  });
}

// Kolom hex di popover: jarak kiri & jarak kotak warna → teks sama dengan kolom warna di sidebar.
test("kolom hex di popover sejajar dengan kolom warna di sidebar", async ({ page }) => {
  await openEditor(page);
  const sidebar = await colorTrigger(page, "color").evaluate((trigger) => {
    const box = trigger.parentElement.getBoundingClientRect();
    const swatch = trigger.querySelector("div").getBoundingClientRect();
    const text = trigger.querySelector("span").getBoundingClientRect();
    return { left: swatch.left - box.left, swatchToText: text.left - swatch.right };
  });
  const popover = await openColorPicker(page, "color");
  const inPopover = await popover.locator(".color-input-group").evaluate((group) => {
    const box = group.getBoundingClientRect();
    const swatch = group.querySelector('[data-slot="color-input-group-prefix"]').firstElementChild.getBoundingClientRect();
    const input = group.querySelector("input");
    const textLeft = input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft);
    return { left: swatch.left - box.left, swatchToText: textLeft - swatch.right };
  });
  expect(inPopover.left).toBeCloseTo(sidebar.left, 0);
  expect(inPopover.swatchToText).toBeCloseTo(sidebar.swatchToText, 0);
});
