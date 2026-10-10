import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Folder kerja server tes Playwright (lihat next.config.mjs)
    ".next-e2e/**",
    // Laporan & hasil buatan Playwright (berisi kode rekaman, bukan kode kita)
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
