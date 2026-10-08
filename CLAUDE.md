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
- **Wajib baca `DESIGN.md`** (arah desain: identitas, palet warna, tipografi, mood) sebelum mengerjakan UI, dan ikuti arahannya.

## Cara menambah karakter baru

Detail & alasan tiap aturan ada di `docs/fase-1-sistem-karakter.md` (bagian 3 & 5). Contoh lengkap: `src/characters/capybara/`.

**1. Buat folder `src/characters/<nama>/` berisi:**

| File | Isi |
|---|---|
| `index.js` | "Kartu identitas": gabungkan config + `moods` + `Component` (salin pola `capybara/index.js`) |
| `<nama>.config.js` | `id`, `name`, `defaultColor`, `defaultMood`, `anatomy`, `parts`, `anchors`, `allowedAccessories`, opsional `shapePresets` & `poses` |
| `<nama>.moods.js` | Semua mood di satu file. Tiap mood minimal `id`, `label`, `motion`, `durationMs` |
| `<Nama>Body.jsx` | Gambar badan + bagian yang menyatu dengan tubuh (telinga, jeruk, tangan) |
| `<Nama>Master.jsx` | Panggung karakter. Belum ada versi bersama di `_core`, jadi salin dari `CapybaraMaster.jsx` lalu sesuaikan |

**2. Aturan cetakan (wajib):**

- **Mood default:** `defaultMood` harus ada di daftar mood. Editor pindah ke mood ini kalau mood yang dipilih tidak dimiliki karakter.
- **Jenis warna** tiap bagian di `parts`: `paint: "base"` (ikut warna user), `"derived"` + `shade` (lebih gelap `<0` / terang `>0` dari warna user, rumus di `_core/derivedColor.js`), atau `"fixed"` (warna tetap, misalnya daun).
- **Bagian bergerak:** tandai `moving: true` + `origin` (titik putar). Gerakannya disebut di mood lewat `parts: { telinga: "droop" }`, pakai preset `_core/motions.js` supaya ikut mode seek (export = preview).
- **Titik tempel** (`anchors`): wajib `hat`, `face`, `zzz`, `stars`, `badge`. Tambah `mouth`, `anger`, `twinkle` hanya kalau ada mood yang memakainya. Angka relatif ke badan (0 = tengah, ±1 = tepi).
- **Pose** (opsional): bentuk badan khusus per mood ditulis di `poses` config, dipilih lewat kunci `pose` di mood (rumus di `_core/poses.js`).
- **Aksesori:** hanya yang ada di `allowedAccessories` (`beanie`, `santa_hat`, `glasses`).
- Mata, mulut, alis, pipi, partikel diambil dari "laci" `_core/parts/`. Varian baru ditambahkan di sana (bukan di folder karakter) supaya style tetap seragam. Kekuatan lapisan mood tidak boleh diatur sendiri (`_core/moodTint.js`).

**3. Daftarkan di `src/characters/registry.js`:** satu `import` + satu baris di array `characters`. Editor tidak boleh menyebut nama karakter di mana pun.

**4. Cek bentuk dengan halaman pembanding** (hanya jalan di `npm run dev`, otomatis 404 di build produksi):

1. Taruh gambar referensi per mood di `docs/reference/<nama>/<mood>.png` (ukuran & posisi seragam).
2. Saat ini halaman `src/app/alat/pembanding/Pembanding.jsx` masih khusus Capybara: ganti `getCharacter("capybara")` dan daftar import gambar referensinya.
3. Buka `http://localhost:3000/alat/pembanding`, pilih mood, pakai mode tumpuk (slider opacity) atau berdampingan, geser/ubah ukuran referensi sampai sejajar, dan bekukan gerakan untuk mencocokkan detail.

Halaman pembanding adalah alat kerja, bukan fitur: wajib dihapus sebelum rilis (Fase 5).
