// Pengaturan tes browser otomatis (Fase 2 B3). Jalankan: npm run test:e2e
//
// Batas waktu wajib (supaya tidak ada lagi tes yang macet berjam-jam):
//   - per tes maksimal 60 detik
//   - total semua tes maksimal 10 menit
// Browser selalu ditutup otomatis oleh Playwright, baik tes lulus, gagal, maupun kehabisan waktu.
//
// Server: tes SELALU menyalakan dev server sendiri di port 3100 (folder kerja .next-e2e), tidak
// pernah memakai server yang sudah jalan. Jadi selalu jelas kode mana yang dites, dan
// `npm run dev` biasa (port 3000) boleh tetap menyala.
//
// Tidak ikut di sini, jalankan terpisah:
//   - tes ukur (e2e/ukur-*.spec.js): npm run ukur:gif
//   - foto referensi (e2e/screenshot.spec.js, menimpa docs/reference/fase-2/): npm run test:screenshot

import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/ukur-*.spec.js", "**/screenshot.spec.js"],
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

  // Server sendiri, dinyalakan lalu dimatikan otomatis. Kalau port 3100 sudah terpakai, tes berhenti
  // dengan pesan error (bukan diam-diam memakai server lain).
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/editor`,
    env: { NEXT_DIST_DIR: ".next-e2e" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
