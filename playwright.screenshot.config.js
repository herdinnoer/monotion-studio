// Pengaturan tes FOTO REFERENSI (Fase 3 F1c). Jalankan: npm run test:screenshot
//
// Sama dengan playwright.config.js (server sendiri di port 3100, batas 60 detik per tes &
// 10 menit total), tapi hanya menjalankan e2e/screenshot.spec.js. Tes ini MENIMPA foto
// docs/reference/fase-2/, jadi tidak ikut `npm run test:e2e`; jalankan hanya kalau foto
// referensi memang ingin diperbarui.

import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: "**/screenshot.spec.js",
  reporter: [["list"]],
  outputDir: "test-results/screenshot",
});
