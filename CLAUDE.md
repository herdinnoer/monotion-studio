@AGENTS.md

# Monotion Studio

Editor animasi karakter berbasis web. Alurnya:
1. User pilih karakter (misalnya Covey, Mochi, Capybara).
2. User pilih mood (gerakan/ekspresi karakter).
3. User ganti warna karakter dan warna background.
4. User export hasilnya ke GIF, SVG, atau WebM.

## Tech stack

Versi di bawah sesuai yang terpasang di `node_modules`. Cek ulang `package.json` kalau ragu.

- **Next.js 16.3.7** (App Router, folder `src/app`) dengan **React 19.2.8**
- **JavaScript**, bukan TypeScript. Pakai file `.js` / `.jsx`, jangan bikin `.ts` / `.tsx`.
- **Tailwind CSS 4** untuk styling
- **HeroUI 3.2.6** (`@heroui/react` + `@heroui/styles`) sebagai design system
- Library pendukung: `framer-motion` (animasi), `gif.js` (export GIF), `html-to-image` (ubah tampilan karakter jadi gambar untuk export), `webm-muxer` (export WebM), `lucide-react` (ikon)
- Undo/redo ditulis manual pakai `useState` di `src/app/editor/page.jsx`, tanpa library tambahan.

## Aturan UI

- Untuk komponen tampilan (tombol, modal, input, tab, dll), **pakai komponen HeroUI dulu** sebelum bikin komponen sendiri.
- Bikin komponen sendiri hanya kalau HeroUI tidak punya yang cocok. Jelaskan alasannya ke user.
- Komponen HeroUI wajib dikustom lewat tema (warna, radius, shadow) supaya tidak terlihat seperti template HeroUI bawaan.

## Aturan komunikasi

- Selalu jawab pakai **bahasa Indonesia yang santai dan awam**.
- User adalah UI/UX designer yang sedang belajar coding dari nol.
- Setiap istilah teknis **wajib dijelaskan dengan analogi sederhana** (contoh: "commit itu kayak save checkpoint di game").

## Aturan kerja

- Kerjakan **satu tugas kecil per langkah**. Jangan lompat ke tugas berikutnya tanpa diminta.
- **Jelaskan alasan sebelum menghapus file**, dan tunggu persetujuan user.
- **Jangan commit atau push tanpa diminta.**

## Panduan kualitas UI

- Sebelum mengerjakan apa pun yang berhubungan dengan tampilan (UI), baca dulu `.github/antislop.md` dan ikuti aturannya. Abaikan bagian wizard instalasi di file itu.
- `DESIGN.md` (arah desain: identitas, palet warna, tipografi, mood) **belum ada**. File ini akan dibuat dulu sebelum mengerjakan tampilan.
