// Pengaturan tes UKUR (Fase 3 F1b). Jalankan: npm run ukur:gif
//
// Sama dengan playwright.config.js (server sendiri di port 3100, batas 60 detik per tes &
// 10 menit total), tapi hanya menjalankan e2e/ukur-*.spec.js. Tes ukur tidak ikut
// `npm run test:e2e`, karena tujuannya mengukur, bukan memeriksa lulus/gagal fitur.

import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: "**/ukur-*.spec.js",
  reporter: [["list"]],
  outputDir: "test-results/ukur",
});
