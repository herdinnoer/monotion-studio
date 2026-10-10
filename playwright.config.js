// Pengaturan tes browser otomatis (Fase 2 B3). Jalankan: npm run test:e2e
//
// Batas waktu wajib (supaya tidak ada lagi tes yang macet berjam-jam):
//   - per tes maksimal 60 detik
//   - total semua tes maksimal 10 menit
// Browser selalu ditutup otomatis oleh Playwright, baik tes lulus, gagal, maupun kehabisan waktu.

import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  globalTimeout: 10 * 60_000,
  expect: { timeout: 10_000 },

  // Satu per satu: export memakai banyak tenaga komputer, dan semua tes memakai satu server.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: true,

  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",

  use: {
    baseURL: `http://localhost:${PORT}`,
    acceptDownloads: true,
    // Jejak & foto hanya disimpan kalau tes gagal, untuk mencari penyebabnya.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],

  // Pakai server dev yang sudah jalan kalau ada; kalau belum, dinyalakan lalu dimatikan otomatis.
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}/editor`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
