/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Folder kerja Next. Server tes Playwright memakai folder sendiri (.next-e2e), supaya bisa
  // jalan bersamaan dengan `npm run dev` biasa (Next menolak dua dev server di folder yang sama).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
