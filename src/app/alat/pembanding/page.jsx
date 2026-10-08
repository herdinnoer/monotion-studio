// Halaman alat kerja: membandingkan Capybara buatan kode dengan gambar referensi.
// BUKAN untuk user. Wajib dihapus sebelum rilis (Fase 5), lihat B18.0 di
// docs/fase-1-sistem-karakter.md. Sementara itu halaman ini disembunyikan
// (404) di build produksi, jadi hanya bisa dibuka lewat `npm run dev`.

import { notFound } from "next/navigation";
import { Pembanding } from "./Pembanding";

export const metadata = {
  title: "Pembanding Capybara (alat kerja)",
  robots: { index: false, follow: false },
};

export default function PembandingPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Pembanding />;
}
