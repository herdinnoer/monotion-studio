// Alat bantu bersama untuk tes browser Fase 2 B3.
import { expect } from "@playwright/test";
import fs from "node:fs";

// Kunci penyimpanan editor (sama dengan src/lib/editorStorage.js) dan tema (next-themes).
export const STORAGE_KEY = "monotion:editor:v1";
export const THEME_KEY = "theme";

// Nilai token DESIGN.md bagian 3 yang dicek tes.
export const TOKENS = {
  light: { bgApp: "rgb(245, 245, 247)", surface: "rgb(255, 255, 255)", accent: [11, 111, 208] },
  dark: { bgApp: "rgb(28, 28, 30)", surface: "rgb(22, 22, 24)", accent: [14, 137, 248] },
};

// Fungsi yang dipasang di halaman sebelum aplikasi jalan (window.__b3).
// Ditulis sebagai satu fungsi utuh karena kode ini berjalan di dalam browser, bukan di Node.
function pageHelpers() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // Ubah warna CSS apa pun (rgb, oklab, hex, ...) jadi [r, g, b, a] 0–255 / 0–1.
  const toRgba = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };

  const blend = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
  };

  const luminance = ([r, g, b]) => {
    const lin = (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const COLOR_FN = /(?:rgba?|oklab|oklch|lab|lch|hsla?|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;

  // Warna latar yang benar-benar terlihat di belakang elemen: naik ke induk sampai ketemu
  // latar padat, lalu campur semua lapisan setengah transparan. Gradient = rata-rata warnanya
  // (DESIGN.md mengukur tombol glossy di warna tengah gradient).
  const backgroundOf = (el) => {
    const layers = [];
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage.includes("gradient")) {
        const stops = (cs.backgroundImage.match(COLOR_FN) || []).map(toRgba);
        if (stops.length) {
          const avg = [0, 1, 2].map((i) => stops.reduce((s, c) => s + c[i], 0) / stops.length);
          layers.push(avg.concat(1));
          break;
        }
      }
      const bg = toRgba(cs.backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 1) break;
    }
    let result = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) result = blend(layers[i], result);
    return result;
  };

  const contrastOf = (el) => {
    const bg = backgroundOf(el);
    let fg = toRgba(getComputedStyle(el).color);
    if (fg[3] < 1) fg = blend(fg, bg);
    const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
    return { ratio: Math.round(ratio(fg, bg) * 100) / 100, fg: hex(fg), bg: hex(bg) };
  };

  // Cincin fokus terlihat = garis (outline) atau bayangan cincin minimal 2px berwarna aksen.
  // Elemen yang fokusnya ada di <input> tersembunyi (switch, slider) menggambar cincinnya di
  // elemen tetangga yang ditandai data-focus-visible, jadi itu ikut diperiksa.
  const ringOf = (el, accent) => {
    const close = (c) => c[3] > 0.9 && c.slice(0, 3).every((v, i) => Math.abs(v - accent[i]) <= 3);
    const hasRing = (node) => {
      const cs = getComputedStyle(node);
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 && close(toRgba(cs.outlineColor))) {
        return true;
      }
      // Pecah daftar bayangan: "rgb(...) 0px 0px 0px 2px inset, ..."
      for (const part of cs.boxShadow.split(/,(?![^()]*\))/)) {
        const color = part.match(COLOR_FN)?.[0];
        const nums = part.replace(COLOR_FN, "").match(/-?[\d.]+px/g) || [];
        const spread = parseFloat(nums[3] ?? "0");
        if (color && spread >= 2 && close(toRgba(color))) return true;
      }
      return false;
    };
    const candidates = new Set([el]);
    for (let n = el.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) candidates.add(n);
    // <input> tersembunyi (switch, slider): cincin digambar di bagian yang terlihat
    const scope = el.closest("label, .slider, .switch, .color-area, .color-slider");
    scope?.querySelectorAll("*").forEach((n) => candidates.add(n));
    return [...candidates].some(hasRing);
  };

  const describe = (el) => {
    const label = el.getAttribute("aria-label") || el.textContent.trim().slice(0, 30) || el.className;
    return `${el.tagName.toLowerCase()} "${label}"`;
  };

  // Ambil warna satu piksel dari file hasil export (GIF/SVG lewat <img>, WebM lewat <video>).
  const readPixel = async (base64, mime, x, y) => {
    const blob = await (await fetch(`data:${mime};base64,${base64}`)).blob();
    const url = URL.createObjectURL(blob);
    try {
      let source;
      let width;
      let height;
      if (mime.startsWith("video/")) {
        const video = document.createElement("video");
        video.muted = true;
        video.src = url;
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = () => reject(new Error("Video tidak bisa dibuka browser"));
        });
        video.currentTime = 0.05;
        await new Promise((resolve) => (video.onseeked = resolve));
        [source, width, height] = [video, video.videoWidth, video.videoHeight];
      } else {
        const img = new Image();
        img.src = url;
        await img.decode();
        [source, width, height] = [img, img.naturalWidth, img.naturalHeight];
      }
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const cctx = c.getContext("2d");
      cctx.drawImage(source, 0, 0);
      return { width, height, rgba: [...cctx.getImageData(x, y, 1, 1).data] };
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  window.__b3 = { contrastOf, ringOf, describe, readPixel, toRgba };
}

// Buka editor dalam keadaan bersih. `theme` = "light" | "dark" (disimpan seperti next-themes),
// `state` = paket kondisi editor yang langsung dipasang (lewati klik-klik persiapan).
export async function openEditor(page, { theme, state, projectName = "" } = {}) {
  await page.addInitScript(pageHelpers);
  if (theme || state) {
    await page.addInitScript(
      ({ theme, state, projectName, keys }) => {
        // Hanya sekali per tab, supaya tes "refresh" tetap membaca simpanan aplikasi sendiri.
        if (sessionStorage.getItem("__b3-seeded")) return;
        sessionStorage.setItem("__b3-seeded", "1");
        if (theme) localStorage.setItem(keys.theme, theme);
        if (state) localStorage.setItem(keys.storage, JSON.stringify({ state, projectName }));
      },
      { theme, state, projectName, keys: { theme: THEME_KEY, storage: STORAGE_KEY } },
    );
  }
  await page.goto("/editor");
  await expect(exportButton(page)).toBeVisible({ timeout: 30_000 });
}

// Paket kondisi lengkap (bentuknya sama dengan src/lib/editorState.js).
export function editorState(overrides = {}) {
  return {
    characterId: "mochi",
    mood: "idle",
    shapePreset: "mochi",
    color: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    isBgRemoved: false,
    ...overrides,
  };
}

export const exportButton = (page) =>
  page.locator("header").getByRole("button", { name: "Export", exact: true });

export async function currentTheme(page) {
  return page.evaluate(() => (document.documentElement.classList.contains("dark") ? "dark" : "light"));
}

export async function switchTheme(page, theme) {
  await page.getByRole("radio", { name: theme === "light" ? "Light mode" : "Dark mode" }).click();
  await expect.poll(() => currentTheme(page)).toBe(theme);
}

// Kotak warna di panel kanan: 0 = Background, 1 = Color (warna karakter).
export const colorTrigger = (page, which) =>
  page.locator(".color-picker__trigger").nth(which === "background" ? 0 : 1);

export async function readHex(page, which) {
  return (await colorTrigger(page, which).textContent()).trim().toUpperCase();
}

export async function openColorPicker(page, which) {
  await colorTrigger(page, which).click();
  const popover = page.locator(".color-picker__popover");
  await expect(popover).toBeVisible();
  await expect(popover).not.toHaveAttribute("data-entering", "true");
  return popover;
}

// Ketik kode hex di color picker lalu Enter (= satu langkah undo), lalu tutup.
export async function typeHex(page, which, hex) {
  const popover = await openColorPicker(page, which);
  const field = popover.getByRole("textbox");
  await field.fill(hex);
  await field.press("Enter");
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect.poll(() => readHex(page, which)).toBe(hex.replace("#", "").toUpperCase());
}

export async function openExportModal(page) {
  await exportButton(page).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

// Pilih item di grup segmented (Format, Resolution, Frame rate) di jendela Export.
export async function pickSegment(dialog, group, label) {
  const item = dialog.getByRole("radiogroup", { name: group }).getByRole("radio", { name: label, exact: true });
  await item.click();
  await expect(item).toHaveAttribute("aria-checked", "true");
}

// Ambil warna piksel dari file hasil download.
export async function readDownloadedPixel(page, download, mime, x = 2, y = 2) {
  const file = await download.path();
  const base64 = fs.readFileSync(file).toString("base64");
  return page.evaluate(({ base64, mime, x, y }) => window.__b3.readPixel(base64, mime, x, y), {
    base64,
    mime,
    x,
    y,
  });
}

// Sembunyikan tombol kecil "N" milik Next.js dev supaya tidak ikut di screenshot.
export async function hideDevOverlay(page) {
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
}
