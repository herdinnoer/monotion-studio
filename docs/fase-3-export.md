# Fase 3: Export yang Bisa Diandalkan

Tujuan fase ini: file hasil export (GIF, WebM, SVG) **sama dengan yang terlihat di preview**,
jalan di Chrome, Edge, Firefox, dan WebKit (mesin Safari), bisa dibatalkan, dan bisa dibuat
dalam beberapa rasio frame.

Nomor baris di dokumen ini mengacu ke kode saat analisis (commit `ed33ed2`).
Setelah kode diubah, nomor baris bisa bergeser.

Status: **rencana disetujui** (semua keputusan di bagian 3 sudah dijawab). Mulai dari F1.

---

## 0. Keputusan Herdin di awal Fase 3

| # | Keputusan |
|---|---|
| H-1 | SVG tetap **gambar diam**, ikut background atau transparan seperti sekarang (K-3 Fase 2) |
| H-2 | **Lottie & Copy React Component dihapus permanen**: kode, pilihan tersembunyi, dan library yang hanya dipakai fitur itu. Bug B-7 ditutup |
| H-3 | **Kecepatan animasi tidak dibuat.** Dihapus dari catatan ide `docs/fase-2-fitur-inti.md` bagian 6 |
| H-4 | Browser target: **Chrome, Edge, Firefox, dan WebKit** (lewat Playwright, karena tidak ada Mac/iPhone) |
| H-5 | **Fitur baru FRAME:** section "FRAME" di paling atas Customizer. Segmented 6 pilihan: 16:9, 4:3, 1:1, 4:5, 3:4, 9:16. Tiap pilihan = ikon kotak sesuai rasio + label di bawahnya. Rasio memengaruhi **preview kanvas dan hasil export semua format** |

---

## 1. Kondisi export sekarang

### 1.1 Cara kerja (analogi Figma)

Export sekarang bekerja seperti **screenshot berulang**: untuk tiap frame, karakter
"dibekukan" di posisi tertentu (mode seek), lalu kotak `#character-workspace` di layar
difoto (`html-to-image`), dikecilkan/dibesarkan ke ukuran persegi, lalu foto-foto itu
dijahit jadi GIF atau WebM.

Bedanya dengan Figma: di Figma, export memotret **frame** yang ukurannya pasti
(misalnya 1080×1080). Di Monotion, yang dipotret adalah **area tengah editor**, yang
ukurannya ikut besar-kecilnya jendela browser. Ini akar beberapa masalah di bawah, dan
fitur FRAME sekaligus membereskannya.

```
ExportModal.jsx  (pilih format, resolusi, fps)
  ├─ GIF  → exportAsGif   → foto tiap frame → simpan mentah di memori → gif.js (worker) → .gif
  ├─ WebM → exportAsWebm  → foto tiap frame → simpan WebP → VideoEncoder VP9
  │                           ├─ latar warna  → webm-muxer → .webm
  │                           ├─ transparan   → encode 2× (warna + alpha) → webmAlphaMuxer.js → .webm
  │                           └─ cadangan     → MediaRecorder (rekam kanvas) → .webm
  └─ SVG  → exportAsSvg   → salin <svg> karakter + kotak background → .svg
```

### 1.2 Peta file export

| File | Peran |
|---|---|
| `src/lib/exportUtils.js` | Mesin export GIF, SVG, WebM (+ Lottie, React, JSON yang tidak dipakai) |
| `src/lib/webmAlphaMuxer.js` | Penjahit WebM transparan buatan sendiri (Fase 2 A4) |
| `src/lib/gifKeyColor.js` | Pemilih warna kunci GIF transparan |
| `src/components/Editor/ExportModal.jsx` | Jendela Export: format, resolusi, fps, progress |
| `src/components/Editor/CenterWorkspace.jsx` | Kanvas + kotak `#character-workspace` yang dipotret |
| `src/characters/_core/useTimeline.js` | Sinyal timeline: player & export "memutar" karakter ke posisi tertentu |
| `e2e/export.spec.js` | Tes export sekarang: cek ukuran file + warna **satu piksel pojok** |
| `playwright.config.js` | Tes browser, sekarang **hanya Chromium** |

### 1.3 Masalah yang ditemukan

| # | Masalah | Lokasi |
|---|---|---|
| P-1 | **Kode Lottie & React** masih ada walau pilihannya disembunyikan (B-7). `lottie-web` terpasang di `devDependencies` tapi **tidak di-import di mana pun** | `exportUtils.js:723–926`; `ExportModal.jsx:21–22`, `:114–132`, `:147–154`, `:212`, `:237`, `:289`, `:318–320`; `package.json:35` |
| P-2 | **Kode mati:** `exportAsJson` tidak dipakai siapa pun. `cleanupWorkspaceAnimations` mencari `<style id="timeline-step-style">` dan `sessionStorage "timeline-was-playing"` yang tidak pernah dibuat siapa pun, jadi selalu "tidak ada". Daftar format `MediaRecorder` berisi `daala`, `h264`, `mp4` | `exportUtils.js:137–162`, `:117–135`, `:25–47` |
| P-3 | **Hasil export bergantung ukuran jendela browser.** Kotak yang dipotret selebar area tengah (`w-full h-full`), bukan persegi. Saat dimasukkan ke file persegi (mode "contain"), karakter mengecil dan sisa atas/bawah diisi warna background. Contoh jendela 1440×900: kotak ±816×696, karakter 500px → di file 720×720 karakter ±441px (61%). Jendela lebih kecil = karakter di file lebih kecil | `CenterWorkspace.jsx:20–22`, `exportUtils.js:93–100` |
| P-4 | **Sudut preview ≠ sudut file.** Kotak workspace di layar bersudut bulat 12px (`rounded-xl`), file export bersudut tajam | `CenterWorkspace.jsx:22` |
| P-5 | **Buram di resolusi besar.** `html-to-image` memotret seukuran layar (tanpa `pixelRatio`). Di laptop biasa (skala 100%), WebM 1080p = foto ±816px yang **diperbesar** → buram | `exportUtils.js:70–73` |
| P-6 | Karakter ukurannya tetap 500px. Di jendela kecil, karakter lebih besar dari area tengah dan terpotong | `CenterWorkspace.jsx:31`, `:14` (`overflow-hidden`) |
| P-7 | **GIF lebih lambat/cepat dari preview.** Format GIF menyimpan jeda per frame dalam 1/100 detik, jadi angka dibulatkan. 60 fps: 16,7ms → 20ms, animasi **20% lebih lambat** (3,6 detik jadi 4,32 detik). 30 fps: 33,3ms → 30ms, **10% lebih cepat**. Pilihan awal di modal = 60 fps | `exportUtils.js:199`, `node_modules/gif.js/src/GIFEncoder.js:94`, `ExportModal.jsx:30` |
| P-8 | **GIF boros memori.** Semua frame disimpan mentah dulu (perlu untuk memilih warna kunci transparan). 720×720 × 216 frame (60 fps, 3,6 detik) ≈ **448 MB**. Rasio 9:16 di 720p ≈ **796 MB** → browser bisa crash | `exportUtils.js:219`, `:249–253` |
| P-9 | `gif.js` versi 0.2.0 (rilis terakhir 2016, tidak dirawat). Dipakai dengan `quality: 1` (paling teliti, paling lambat). Perlu script `postinstall` untuk menyalin worker ke `public/`. Ukuran file GIF belum pernah diukur | `exportUtils.js:273–280`, `package.json:11` |
| P-10 | **WebM berlatar kurang 1 frame di durasinya** (3,566 detik, harusnya 3,600). `webm-muxer` menulis durasi = waktu mulai frame terakhir, tanpa lama frame terakhir itu. Penjahit sendiri (`webmAlphaMuxer.js`) sudah benar | `node_modules/webm-muxer/build/webm-muxer.mjs:1253`, bandingkan `webmAlphaMuxer.js:136` |
| P-11 | **WebM transparan sedikit kurang tajam** (44–49 dB vs 55–59 dB), penyebab belum ketemu (catatan A4 Fase 2). Kandidat yang belum dicoba: foto perantara WebP **lossy** 0,95 (ada penurunan kualitas sebelum masuk encoder), bitrate tetap 4 Mbps | `exportUtils.js:585`, `:389–390` |
| P-12 | **Jalur cadangan `MediaRecorder` bermasalah.** Sudah ditolak di A4 Fase 2 (jarak frame acak, warna bergeser). Di Safari bisa memilih `video/mp4`, jadi file bernama `.webm` padahal isinya MP4. Cek dukungan VP9 hanya untuk 720×720, bukan ukuran yang benar-benar dipilih | `exportUtils.js:670–705`, `:34`, `:400–405` |
| P-13 | **Tidak bisa dibatalkan.** Modal terkunci selama export, loop foto tidak pernah mengecek "stop", worker GIF & encoder WebM tidak dihentikan | `ExportModal.jsx:52–54`, `:166–168`; `exportUtils.js:226`, `:563` |
| P-14 | **Menunggu karakter "selesai digambar" pakai tebakan waktu** (16ms GIF, 25ms WebM). Di komputer/browser lambat, foto bisa diambil sebelum pose baru tergambar → frame dobel/loncat. Belum terbukti, akan ketahuan di tes F2 | `exportUtils.js:236–240`, `:572` |
| P-15 | **SVG bisa beda pose dengan layar.** Pembersih teks menghapus **seluruh** atribut `style` yang berisi `transform-origin`, termasuk posisi gerakan dari Framer Motion. SVG juga selalu 400×400 dan kotak background = viewBox persegi | `exportUtils.js:364`, `:340–345`, `:350–358` |
| P-16 | Daftar resolusi ditulis 3× dan hanya persegi. GIF tidak punya 1080p | `exportUtils.js:188–193`, `:528–534`, `:786–792`; `ExportModal.jsx:156–159` |
| P-17 | Tes export hanya mengecek ukuran file + **satu piksel pojok**, tidak mengecek pose, durasi, atau jumlah frame. Hanya jalan di Chromium | `e2e/export.spec.js:36–56`, `playwright.config.js` (`projects`) |

---

## 2. Langkah-langkah

Diurutkan dari yang paling ringan/aman ke yang paling berisiko. Satu langkah = satu tugas
kecil, dites dulu sebelum lanjut. Semua tes browser lewat `npm run test:e2e` (Playwright,
batas 60 detik per tes, 10 menit per jalan).

| Langkah | Isi | Risiko |
|---|---|---|
| F1 | Hapus Lottie & React + kode mati | Ringan (hanya menghapus) |
| F2 | Tes otomatis "export = preview" | Ringan (hanya menambah tes) |
| F3 | Tes export di Chrome, Edge, Firefox, WebKit | Ringan (tes), tapi bisa memunculkan temuan |
| F4 | Durasi WebM berlatar (frame terakhir) | Kecil |
| F5 | GIF: waktu, memori, evaluasi `gif.js`, ukuran file | Sedang |
| F6 | Tombol Cancel export | Sedang |
| F7 | FRAME bagian 1: data, panel, preview kanvas | Tinggi |
| F8 | FRAME bagian 2: export GIF & WebM sesuai rasio | Tinggi |
| F9 | FRAME bagian 3: export SVG sesuai rasio | Sedang |
| F10 | Ketajaman WebM transparan | Tidak pasti (penyebab belum ketemu) |

Kenapa tes (F2, F3) dikerjakan **sebelum** perubahan besar: seperti membuat "frame
pembanding" di Figma sebelum mengubah desain. Kalau F4–F10 merusak sesuatu, tes langsung
memberi tahu.

### F1. Hapus Lottie & Copy React Component (H-2)

**Isi:**
- `exportUtils.js`: hapus `copyReactComponent` & `exportAsLottieJson` (`:723–926`).
- `ExportModal.jsx`: hapus import (`:21–22`), `case "lottie"` & `case "react"`
  (`:114–132`), baris yang di-comment (`:152–153`), `|| format === "lottie"` (`:212`, `:237`,
  `:289`), teks tombol "Copy Code" (`:318–320`). Komentar "5 Format utama" (`:147`) dirapikan.
- `package.json`: hapus `lottie-web` (`npm uninstall lottie-web`, `package-lock.json` ikut berubah).
- Kode mati P-2 (perlu persetujuan, lihat keputusan **e5**): `exportAsJson`, bagian
  `cleanupWorkspaceAnimations` yang mencari style & `sessionStorage` yang tidak ada.
- Dokumen: `docs/fase-1-sistem-karakter.md` B-7 & 5.8 → "Ditutup di Fase 3 F1 (fitur dihapus)".
  `docs/fase-2-fitur-inti.md`: hapus ide "Kecepatan animasi" di ringkasan & bagian 6 (H-3).

**Selesai kalau:**
- `git grep -niE "lottie|copyReact|Copy Code"` di `src/` dan `package.json` = 0 hasil.
- `npm test`, `npm run test:e2e`, `npm run lint`, `npm run build` lulus.
- Jendela Export tetap menampilkan GIF, SVG, WebM, dan ketiganya tetap jalan.

**Cara tes:** perintah di atas. Tes export yang sudah ada (`e2e/export.spec.js`) cukup.

### F2. Tes otomatis "export = preview" (Mochi & Capybara)

Analogi Figma: menumpuk hasil export di atas desain asli dengan opacity 50% dan melihat
apakah ada yang "geser". Bedanya, ini dilakukan komputer, angka demi angka.

**Isi:** file tes baru `e2e/export-preview.spec.js`. Tidak mengubah kode aplikasi.
1. **Pose seek vs file export.** Untuk Mochi & Capybara, 2–3 mood yang gerakannya paling
   banyak (dipilih saat langkah ini, misalnya yang memakai bagian bergerak & pose):
   - Export GIF dan WebM (240p, 30 fps).
   - Untuk beberapa titik (misalnya frame ke-0, ¼, ½, ¾): putar preview ke titik yang sama
     (pause + geser timeline), foto kotak workspace, kecilkan ke ukuran file.
   - Bongkar frame yang sama dari file: GIF lewat `ImageDecoder`, WebM lewat `<video>` yang
     dimajukan ke tengah frame itu (keduanya bawaan Chromium, tanpa library).
   - Bandingkan: selisih warna rata-rata di bawah batas (angka batas ditentukan dari hasil
     pertama; GIF lebih longgar karena paletnya terbatas).
2. **Semua mood, tanpa export (cepat).** Untuk tiap mood kedua karakter: pause di beberapa
   titik, cek pose tidak "loncat" dibanding saat diputar (play → pause di titik yang sama
   harus terlihat sama). Kalau jam palsu Playwright (`page.clock`) bisa mengendalikan
   gerakan Framer Motion, perbandingannya tepat; kalau tidak, toleransinya dilonggarkan.
3. **Durasi & jumlah frame.**
   - GIF: total jeda semua frame = durasi mood (toleransi 1 frame).
   - WebM: durasi video = durasi mood, jumlah frame = durasi × fps.
   - Tes yang **sudah pasti gagal sekarang** (GIF P-7, WebM P-10) ditandai "diketahui gagal"
     (`test.fail`) dengan catatan nomor masalahnya, lalu tandanya dicabut di F4/F5.

**Selesai kalau:**
- Tes jalan di Chromium dalam batas waktu (per tes < 60 detik).
- Hasil pertama dicatat di dokumen ini: lulus/gagal per mood, angka selisih.
- Kalau ada temuan baru (misalnya P-14 frame dobel), dicatat sebagai masalah baru, belum diperbaiki.

### F3. Tes export di Chrome, Edge, Firefox, WebKit (H-4)

**Isi:**
- Pasang browser tes: `npx playwright install firefox webkit`. Ini **mengunduh browser**
  (±200 MB, disimpan di folder Playwright), **bukan library baru** di website.
- `playwright.config.js`: tambah "projects": `chromium` (yang sudah ada), `chrome`
  (Chrome terpasang di laptop), `msedge` (Edge bawaan Windows), `firefox`, `webkit`.
- Supaya tetap di bawah 10 menit per jalan: tes tampilan B3 tetap hanya Chromium; browser
  lain hanya menjalankan tes export (`export.spec.js` + `export-preview.spec.js`).
  Dijalankan per browser, misalnya `npm run test:e2e -- --project=firefox`.
- Langkah ini **hanya mencatat** hasil per browser. Perbaikan masuk langkah sesuai
  masalahnya (atau langkah baru kalau di luar F4–F10).

**Catatan penting soal WebKit:** WebKit di Playwright Windows **bukan Safari asli**. Mesin
gambarnya sama, tapi dukungan video (encoder VP9, `MediaRecorder`) bisa beda dengan Safari
di Mac/iPhone. Jadi: lulus di WebKit = kemungkinan besar aman di Safari; gagal di bagian video
bisa jadi khusus WebKit Windows. Hasil WebKit dicatat dengan catatan itu.

**Tabel hasil (diisi saat F3):**

| Tes | Chrome | Edge | Firefox | WebKit |
|---|---|---|---|---|
| GIF background warna / transparan | | | | |
| WebM background warna / transparan | | | | |
| SVG background warna / transparan | | | | |
| Export = preview (F2) | | | | |
| Peringatan "tidak bisa WebM transparan" tampil kalau tidak didukung | | | | |

**Selesai kalau:** tabel terisi, setiap kegagalan punya nomor masalah dan langkah perbaikannya.

### F4. Durasi WebM berlatar (frame terakhir) (P-10)

**Isi:**
- WebM berlatar memakai penjahit sendiri `webmAlphaMuxer.js` juga (tanpa lapisan alpha),
  yang sudah menulis durasi = jumlah frame × lama satu frame. Penjahitnya diberi pilihan
  "dengan/tanpa alpha".
- `webm-muxer` dihapus dari `package.json` (keputusan **e4**, disetujui) **hanya setelah**
  tes F2 dan F3 lulus dengan penjahit sendiri, supaya penggantiannya terbukti oleh tes.
- Pengaturan VP9 (`codec`, `bitrate`) yang ditulis dua kali (`exportUtils.js:389–390` dan
  `:627–632`) disatukan.

**Selesai kalau:** tes durasi WebM F2 lulus (tanda `test.fail` dicabut): WebM berlatar
Mochi idle = **3,600 detik**, 108 frame (30 fps) / 216 frame (60 fps). Tes export lama tetap lulus.

**Cara tes:** F2 + F3 (semua browser yang bisa WebM). Manual: buka file di Chrome, Firefox,
dan VLC, cek durasi & tidak ada kedip di sambungan loop.

### F5. GIF: waktu, memori, evaluasi `gif.js`, ukuran file (P-7, P-8, P-9)

**Isi:**
1. **Waktu (P-7):** GIF hanya bisa jeda kelipatan 10ms, dan jeda di bawah 20ms diperlambat
   oleh browser. Jadi 60 fps tidak mungkin akurat di GIF. Keputusan **e2**: pilihan fps
   GIF jadi **25 fps (40ms) dan 50 fps (20ms)**, keduanya pas tanpa pembulatan, **default
   25 fps**. WebM tetap 30/60 fps. Saat ganti format, fps yang tidak tersedia pindah ke
   pilihan default format itu.
2. **Memori (P-8):** ukur pemakaian memori export GIF terbesar. Kalau terlalu besar, simpan
   frame dalam bentuk yang lebih hemat (misalnya hanya piksel yang sudah "padat/tembus",
   bukan 4 angka per piksel), atau batasi resolusi GIF (keputusan **c**).
3. **Evaluasi `gif.js` & ukuran file:** ukur, untuk Mochi & Capybara (mood terpanjang):

   | Pengaturan | Waktu export | Ukuran file | Tampilan (dicek mata) |
   |---|---|---|---|
   | 480p 25 fps, `quality` 1 / 10 / 20 | | | |
   | 720p 25 fps, `quality` 1 / 10 / 20 | | | |
   | 720p 50 fps, `quality` 10 | | | |

   `quality` = seberapa teliti `gif.js` memilih 256 warna per frame (1 paling teliti &
   paling lambat). Target usulan: pengaturan default < 5 MB dan < 20 detik di laptop Herdin.
4. **Kalau angka `gif.js` buruk** (lambat, file besar, warna belang), baru pertimbangkan
   library pengganti (misalnya `gifenc`, kecil & lebih baru). Itu **library baru**, jadi
   dijelaskan dulu dan menunggu izin. Kalau `gif.js` cukup, tetap dipakai.

**Selesai kalau:**
- Tes durasi GIF F2 lulus (tanda `test.fail` dicabut): total jeda = durasi mood.
- Tabel ukuran terisi dan pengaturan default GIF diputuskan dari angka itu.
- Export GIF pengaturan terbesar tidak membuat tab crash (dicek di F3: Chrome & Firefox).

### F6. Tombol Cancel export (P-13)

**Isi:**
- Selama export, tombol **Close** di footer berubah jadi **Cancel** (tombol kedua, bukan
  aksen, DESIGN.md bagian 8). Tombol ✕ di header tetap nonaktif.
- Mesin export menerima "sinyal berhenti" (`AbortController`, bawaan browser) yang dicek
  di setiap frame. Saat berhenti: worker GIF dihentikan (`gif.abort()`, sudah ada di
  `gif.js`), encoder WebM ditutup, player dikembalikan ke kondisi normal, **tidak ada file
  yang terunduh**.
- Toast "Export canceled". Modal kembali ke keadaan siap (bisa langsung export lagi).
- Esc & klik di luar tetap diabaikan selama export (keputusan **e7**).

**Selesai kalau:**
- Cancel di tengah GIF (saat memotret **dan** saat `gif.js` mengompres) dan di tengah WebM
  → tidak ada file terunduh, toast muncul, player bisa diputar lagi.
- Setelah Cancel, export ulang langsung berhasil dan hasilnya benar (tidak tercampur sisa
  export sebelumnya).

**Cara tes (Playwright):** mulai export → klik Cancel di progress ±30% dan ±70% → cek
tidak ada event download dalam 5 detik, toast tampil, export kedua menghasilkan file yang
lulus tes pojok. Plus tes keyboard: Tab ke Cancel → Enter.

### F7. FRAME bagian 1: data, panel, preview kanvas (H-5)

Analogi Figma: sekarang Monotion belum punya "frame", jadi export memotret seluruh area
kerja. F7 memasang frame seperti Frame tool di Figma: kotak dengan rasio pasti, karakter
di dalamnya, dan **hanya isi frame** yang jadi hasil.

**Isi:**
1. **Data:** paket kondisi ditambah `frameRatio` (`"16:9"`, `"4:3"`, `"1:1"`, `"4:5"`,
   `"3:4"`, `"9:16"`). Di `editorState.js`: `createInitialState`, `sanitizeState` (nilai
   tak dikenal → default), `isSameState`. Ikut undo & disimpan di browser sesuai keputusan
   **a**. Data lama tanpa `frameRatio` otomatis dapat default, jadi kunci penyimpanan tidak
   perlu naik ke `v2`.
2. **Panel:** section **FRAME** di paling atas Customizer (sebelum Shape Preset), label
   section 12px kapital `text-muted` seperti section lain.
   - `ToggleButtonGroup` HeroUI kelas `segmented` (sama dengan Shape Preset), 6 pilihan,
     urutan 16:9, 4:3, 1:1, 4:5, 3:4, 9:16.
   - Isi tiap pilihan: ikon kotak bergaris sesuai rasio (sisi terpanjang 16px, garis 1.5px,
     sudut 2px) + label 11px di bawahnya. Ikonnya **dibuat sendiri** sebagai kotak CSS
     (bukan Lucide), karena Lucide tidak punya ikon persis untuk 6 rasio ini. Tombolnya
     tetap `ToggleButton` HeroUI.
   - Lebar: panel 290px → tiap pilihan ±38px. Padding samping tombol segmented sekarang
     10px (`globals.css:216`), terlalu besar untuk 6 pilihan; grup FRAME diberi padding
     lebih kecil + tinggi lebih besar (ikon + label, ±48px).
   - Warna terpilih ikut DESIGN.md (`surface` + `shadow-sm`, ikon & label `text`); tidak
     terpilih ikon & label `text-muted`. Lihat keputusan **e1** soal mode terang.
   - Pakai keyboard: panah kiri/kanan pindah pilihan (bawaan HeroUI), `aria-label` "Frame
     ratio", tiap pilihan terbaca "16:9" dst.
3. **Preview kanvas:** `#character-workspace` jadi **frame**: rasio pasti (CSS
   `aspect-ratio`), sebesar mungkin di area tengah dengan jarak 32px (padding sekarang),
   sudut **tajam** (sama dengan file, beres P-4), garis tepi sesuai keputusan **d**.
4. **Ukuran karakter** ikut ukuran frame, bukan 500px tetap (beres P-6), sesuai keputusan **b**.
   Caranya: ukuran frame diukur (`ResizeObserver`, bawaan browser) lalu dikirim ke `size`
   karakter. Tidak perlu mengubah Master tiap karakter.

**Selesai kalau:**
- 6 pilihan tampil sesuai H-5, kanvas berubah rasio seketika, karakter tetap di tengah
  dengan ukuran sesuai keputusan **b**.
- Ganti rasio = 1 langkah undo (kalau keputusan **a** = ya); pilih rasio yang sama = tidak
  ada langkah baru; refresh → rasio tetap.
- Perkecil jendela browser → frame & karakter ikut mengecil, tidak terpotong.
- **Sebelum angka ±60% dikunci** (syarat keputusan **b**): semua mood Mochi & Capybara di
  16:9 dan 9:16 dicek tidak ada yang terpotong tepi frame, termasuk partikel (Zzz, bintang,
  tanda marah, kilau), aksesori (beanie, santa hat, glasses), glow mood, dan pose `puffed`.
  Dicek di seluruh putaran animasi (beberapa titik progress), bukan hanya frame pertama.
  Dibuat sebagai tes Playwright: area di luar kotak aman frame harus kosong (warna
  background saja).
- Tes B3 tetap lulus (kontras, fokus keyboard, mode terang/gelap); foto layar baru per
  rasio di `docs/reference/fase-3/`.
- `npm test`: tes baru untuk `sanitizeState` (rasio tak dikenal, tidak ada) & `isSameState`.

**Catatan:** setelah F7 dan sebelum F8, export GIF/WebM masih persegi (frame non-persegi
dimasukkan ke file persegi dengan pita background). Karena itu **F8 dikerjakan langsung
setelah F7**, dan tes "export = preview" untuk rasio non-persegi baru diaktifkan di F8.

### F8. FRAME bagian 2: export GIF & WebM sesuai rasio

**Isi:**
1. **Ukuran file dari rasio + resolusi** (keputusan **c**). Satu fungsi murni
   `frameSize(ratio, resolution)` di file tanpa alias `@/` (bisa dites `node --test`),
   menggantikan 3 daftar resolusi (P-16). Lebar & tinggi selalu **genap** (syarat encoder
   VP9).
2. **Foto langsung di ukuran file** (beres P-3 & P-5): `html-to-image` memotret frame dengan
   `pixelRatio` = lebar file ÷ lebar frame di layar. Jadi 1080p benar-benar digambar 1080
   piksel, bukan diperbesar, dan hasil tidak lagi bergantung ukuran jendela. Mode "contain"
   + pita background di `captureAndScaleToTarget` tidak diperlukan lagi.
3. Cek dukungan VP9 memakai **ukuran yang benar-benar dipilih**, bukan 720×720 (P-12).
4. Jendela Export menampilkan ukuran piksel asli di samping resolusi, format
   **"720p · 720×1280"** (keputusan **c**), supaya user tahu hasilnya sebelum export.
   Teksnya tampil di samping label "Resolution" (lihat catatan di keputusan **c**) dan
   **ikut berubah saat resolusi atau rasio diganti**.
5. Saat format GIF, tombol **1080p tetap tampil tapi nonaktif** (bukan disembunyikan),
   dengan tooltip **"GIF maksimal 720p"**. Kalau resolusi sedang 1080p lalu pindah ke GIF,
   resolusi pindah ke 720p (perilaku sekarang, `ExportModal.jsx:60–62`).
   Catatan teknis: tombol nonaktif biasanya tidak menerima hover, jadi tooltip bisa tidak
   muncul. Kalau `Tooltip` HeroUI tidak muncul di tombol nonaktif, tombolnya dibungkus
   elemen pemicu tooltip; tetap HeroUI, bukan komponen sendiri.

**Selesai kalau:**
- 6 rasio × GIF & WebM: ukuran file = tabel di keputusan **c**.
- Tes F2 "export = preview" lulus untuk minimal 1:1, 16:9, 9:16 (kedua karakter).
- Export dari jendela besar & jendela kecil (Playwright mengubah ukuran viewport) =
  file yang sama (selisih piksel di bawah batas).
- WebM 1080p lebih tajam dari sebelumnya (dicek angka PSNR seperti catatan A4 + dicek mata).
- Label "720p · 720×1280" berubah saat resolusi diganti **dan** saat rasio diganti (tes Playwright).
- Format GIF: tombol 1080p tampil, nonaktif, tooltip "GIF maksimal 720p" muncul saat hover
  & fokus keyboard.
- F3 diulang: tabel per browser tetap lulus.

### F9. FRAME bagian 3: export SVG sesuai rasio (H-1, P-15)

**Isi:**
- `viewBox` SVG diperlebar/ditinggikan mengikuti rasio, dengan karakter di tengah dan
  ukuran relatif yang sama dengan preview (keputusan **b**). Kotak background mengisi seluruh
  `viewBox` baru; transparan kalau Remove Background menyala.
- `width`/`height` SVG mengikuti rasio (bukan 400×400 tetap).
- Perbaiki P-15: pembersih teks hanya membuang `transform-origin`, bukan seluruh `style`,
  supaya pose di SVG = pose di layar. Pose SVG sesuai keputusan **e6**: pose yang sedang
  tampil di kanvas saat tombol Export ditekan.
- Teks bantu kecil di jendela Export saat SVG dipilih (11px `text-muted`, seperti catatan
  GIF transparan): **"SVG menyimpan pose yang sedang tampil. Pause dan geser timeline untuk
  memilih pose."** (lihat catatan bahasa di keputusan **e6**).

**Selesai kalau:**
- SVG 6 rasio: perbandingan sisi `viewBox` = rasio; background penuh; transparan saat
  Remove Background.
- Tes: SVG dibuka di browser dan difoto, dibandingkan dengan foto frame preview di pose yang
  sama → selisih di bawah batas. Dicek juga dengan membuka SVG di Figma (manual, sekali).

### F10. Ketajaman WebM transparan (P-11)

Paling akhir karena penyebabnya belum diketahui (riset), dan F8 sudah mengubah cara
memotret yang mungkin ikut memperbaiki.

**Isi:** ukur dulu ulang setelah F8, lalu coba satu per satu, masing-masing diukur PSNR
(cara ukur sama dengan catatan A4 Fase 2):
1. Foto perantara tanpa kompresi lossy: simpan frame sebagai gambar mentah/PNG, bukan WebP 0,95.
2. Bitrate lebih tinggi untuk lapisan warna, atau mode kualitas tetap (`bitrateMode: "quantizer"`
   di `VideoEncoder`, kalau didukung).
3. Isi warna area tembus dengan warna tepi karakter (bukan hitam), supaya encoder tidak
   membuang data untuk tepi tajam yang tidak terlihat.

**Selesai kalau:** selisih ketajaman WebM transparan vs berlatar < 3 dB di bagian dalam
karakter, **atau** penyebabnya ketemu dan dicatat sebagai batas yang diterima. Ukuran file
tidak naik lebih dari 1,5×.

---

## 3. Keputusan untuk Herdin

Tiap poin: rekomendasi + alasan. Jawab "setuju" atau pilih alternatif.

### Status jawaban

| # | Jawaban Herdin |
|---|---|
| a | **Setuju** |
| b | **Setuju**, dengan syarat: sebelum ±60% dikunci, cek semua mood (partikel, aksesori, pose `puffed`) tidak terpotong di 16:9 dan 9:16 (masuk "Selesai kalau" F7) |
| c | **Setuju**, ditambah ukuran piksel asli "720p · 720×1280" di samping label "Resolution", ikut berubah saat resolusi **atau rasio** diganti. Saat GIF, tombol 1080p **nonaktif (tidak disembunyikan)** dengan tooltip "GIF maksimal 720p" (F8) |
| d | **Setuju** |
| e1 | **Ikut DESIGN.md** |
| e2 | **Setuju**: GIF 25 & 50 fps, **default 25**. WebM tetap 30 & 60 (F5) |
| e3 | **Setuju** |
| e4 | **Setuju**, tapi `webm-muxer` baru dihapus setelah tes F2 & F3 ada dan lulus (F4) |
| e5 | **Setuju**, dihapus di F1 |
| e6 | **Setuju**: pose yang sedang terlihat, + teks bantu di modal saat SVG dipilih (F9) |
| e7 | **Setuju** (F6) |
| e8 | **Setuju**: uji Safari asli dicatat sebagai tugas Fase 5 |

Semua keputusan Fase 3 sudah dijawab.

### a. Rasio ikut undo & disimpan di browser? Default 1:1?

**Rekomendasi: ikut undo, ikut disimpan, default 1:1.**
- **Ikut undo:** di Figma, mengubah ukuran frame bisa di-Ctrl+Z. Rasio mengubah hasil karya
  (file export), sama seperti warna dan mood, jadi wajar ikut riwayat.
- **Ikut disimpan:** sama dengan pengaturan lain di A5 Fase 2. Membuka editor lagi = frame
  sama seperti terakhir.
- **Default 1:1:** sama dengan hasil export sekarang (persegi), jadi user lama tidak kaget.
  Data tersimpan lama (tanpa rasio) otomatis jadi 1:1.

### b. Ukuran & posisi karakter di frame non-persegi

**Rekomendasi: karakter selalu di tengah, ukurannya mengikuti sisi PENDEK frame.**
- Analogi Figma: seperti constraint "Center" + "Scale" yang dikunci ke sisi pendek.
- Contoh: di 16:9 karakter sama besar dengan di 1:1 setinggi itu, sisanya ruang kosong
  kiri-kanan (cocok untuk banner/YouTube). Di 9:16 ruang kosong di atas-bawah (cocok untuk
  Story/Reels, ada tempat untuk teks di aplikasi lain).
- Kalau mengikuti sisi panjang, di 9:16 karakter jadi terlalu besar dan terpotong.
- Besarnya: kotak karakter = **±60% sisi pendek**, kira-kira sama dengan hasil export
  sekarang di jendela 1440×900 (61%). Angka pastinya dicek mata bersama di F7. Partikel
  (Zzz, bintang, tanda marah) sudah berada di dalam kotak karakter, jadi tidak terpotong.
- Geser/perbesar karakter sendiri (seperti drag di Figma) **tidak** di Fase 3. Bisa jadi ide fase berikutnya.

### c. Arti pilihan resolusi setelah ada rasio, dan batas ukuran GIF

**Rekomendasi: angka resolusi = panjang sisi PENDEK (dalam piksel).**
Sama dengan kebiasaan video: "1080p" di YouTube = 1920×1080 (sisi pendek 1080).

| Resolusi | 1:1 | 16:9 | 4:3 | 4:5 | 3:4 | 9:16 |
|---|---|---|---|---|---|---|
| 240p | 240×240 | 426×240 | 320×240 | 240×300 | 240×320 | 240×426 |
| 360p | 360×360 | 640×360 | 480×360 | 360×450 | 360×480 | 360×640 |
| 480p | 480×480 | 854×480 | 640×480 | 480×600 | 480×640 | 480×854 |
| 720p | 720×720 | 1280×720 | 960×720 | 720×900 | 720×960 | 720×1280 |
| 1080p (WebM) | 1080×1080 | 1920×1080 | 1440×1080 | 1080×1350 | 1080×1440 | 1080×1920 |

**Batas GIF (rekomendasi):** tetap maksimal 720p, tanpa 1080p, dengan pilihan **25/50 fps**
(lihat **e2**). Alasan: GIF tidak dikompres sebaik video. GIF 720p 9:16 hampir 2× lebih
banyak piksel dari 720p persegi, jadi file & memori ikut membengkak. Angka pasti diputuskan
setelah pengukuran F5: kalau GIF 720p 9:16 ternyata > 15 MB atau membuat tab crash, batas GIF
diturunkan ke 480p untuk rasio non-persegi. Default jendela Export untuk GIF juga diputuskan
dari tabel F5.

**Catatan penempatan "720p · 720×1280":** pilihan resolusi berupa segmented 5 tombol di
modal selebar 480px. Kalau teks lengkap ditulis di **dalam tiap tombol**, satu tombol butuh
±100px → total ±500px, tidak muat. Usulan: tombol tetap "240p … 1080p", lalu teks
"720p · 720×1280" untuk pilihan yang sedang aktif tampil di samping label "Resolution"
(kiri baris, teks 11px `text-subtle`), dan ikut berubah saat pilihan diganti.

### d. Batas frame di kanvas saat Remove Background menyala

Masalahnya: saat Remove Background menyala, frame transparan dan menyatu dengan pola titik
kanvas, jadi user tidak bisa melihat rasio yang dipilih.

**Rekomendasi: garis tepi tipis 1px warna `border-selected` di sekeliling frame, SELALU
tampil** (bukan hanya saat Remove Background), sudut tajam.
- Analogi Figma: frame di Figma selalu punya batas yang kelihatan walau isinya kosong.
- Selalu tampil, karena background putih (default) di atas kanvas mode terang (`#F5F5F7`)
  juga hampir tidak terlihat batasnya.
- Garis ini hanya di layar, **tidak ikut** ke file export.
- Pakai token yang sudah ada (tidak ada warna baru), tidak melanggar DESIGN.md.
- Alternatif yang tidak direkomendasikan: menggelapkan area di luar frame (lebih ramai, dan
  pola titik jadi tidak konsisten), atau tanda sudut saja (kurang jelas di rasio panjang).
- Kalau setuju, DESIGN.md bagian 3 "Kanvas" ditambah satu aturan ini di F7.

### e. Temuan lain yang butuh keputusan

**e1. Warna pilihan terpilih di mode terang.** Herdin menulis "terpilih = kotak lebih gelap
dengan ikon terang". Di mode **gelap** itu sudah sesuai DESIGN.md (terpilih `surface`
`#161618`, lebih gelap dari grup `#232328`). Di mode **terang**, DESIGN.md membuat yang
terpilih **putih** (lebih terang dari grup `#ECECEF`), sama dengan segmented lain (Shape
Preset, Format, Resolusi).
**Rekomendasi:** ikut DESIGN.md di kedua mode, supaya semua segmented seragam.
Kalau Herdin memang ingin "lebih gelap" di mode terang juga, itu jadi aturan baru untuk
**semua** segmented dan DESIGN.md diubah.

**e2. Pilihan fps GIF jadi 25 & 50 fps.** GIF hanya bisa menyimpan jeda kelipatan 1/100
detik, jadi 30 dan 60 fps tidak pernah pas (lihat P-7: animasi jadi 10% lebih cepat atau
20% lebih lambat dari preview).
**Rekomendasi:** GIF 25 & 50 fps (pas, tanpa pembulatan), WebM tetap 30 & 60 fps.
Alternatif: tetap tulis 30 fps tapi jeda dibuat bergantian 30ms/40ms supaya total durasi
pas (gerakan sedikit tidak rata, hampir tak terlihat). 60 fps di GIF tidak bisa dibuat pas.

**e3. Hapus jalur cadangan `MediaRecorder` di WebM.** Sudah ditolak di A4 Fase 2 karena
hasilnya tidak rapi, dan di Safari bisa menghasilkan file MP4 bernama `.webm` (P-12).
**Rekomendasi:** hapus. Kalau browser tidak punya encoder VP9, pilihan WebM menampilkan
pesan jelas ("Browser ini tidak bisa export WebM, pakai GIF atau Chrome/Edge/Firefox")
dan tombol Export nonaktif. Lebih jujur daripada file yang diam-diam rusak.

**e4. Hapus library `webm-muxer`.** Setelah F4, WebM berlatar juga memakai penjahit sendiri,
jadi library ini tidak dipakai lagi. **Rekomendasi:** hapus (satu library lebih sedikit,
masalah durasi beres). Penjahit sendiri sudah terbukti di tes A4.

**e5. Hapus kode mati** (`exportAsJson`, sisa `cleanupWorkspaceAnimations`, format
`daala`/`h264`/`mp4`). Tidak dipakai siapa pun. **Rekomendasi:** hapus di F1.

**e6. Pose di SVG.** SVG adalah gambar diam, jadi harus memilih satu momen.
**Rekomendasi:** SVG = pose yang **sedang terlihat** di kanvas saat tombol Export ditekan
(player di-pause sebentar saat memotret). Analogi Figma: export = apa yang ada di frame
saat itu. User yang mau pose tertentu tinggal pause & geser timeline dulu.
Alternatif: selalu pose awal (frame 0), lebih bisa ditebak tapi user tidak bisa memilih pose.

**Catatan bahasa (belum diputuskan, ditanyakan lagi di F8/F9):** teks bantu SVG dan tooltip
"GIF maksimal 720p" dicatat persis sesuai permintaan Herdin (bahasa Indonesia), padahal
semua teks UI lain berbahasa Inggris ("Export failed", "GIF transparency is on or off per
pixel…"). Pilihannya: tetap Indonesia, atau versi Inggris yang setara ("SVG saves the pose
currently shown. Pause and drag the timeline to pick a pose." / "GIF is limited to 720p").

**e7. Esc saat export.** **Rekomendasi:** Esc & klik di luar tetap diabaikan, membatalkan
hanya lewat tombol Cancel. Supaya export panjang tidak batal karena salah pencet.

**e8. Uji Safari asli.** WebKit di Windows tidak 100% sama dengan Safari (bagian video bisa
beda). **Rekomendasi:** terima hasil WebKit untuk Fase 3, lalu catat "uji di Safari asli
(pinjam Mac/iPhone atau layanan uji browser)" sebagai tugas sebelum rilis (Fase 5).

---

## 4. Library

**Tidak ada library baru untuk aplikasi.** Yang dipakai sudah ada di browser:
`AbortController` (Cancel), `ResizeObserver` (ukuran frame), `ImageDecoder` & `<video>`
(membongkar file di tes), `VideoEncoder` (WebM).

| Perubahan | Status |
|---|---|
| `lottie-web` dihapus | Pasti (H-2), F1 |
| `webm-muxer` dihapus | Kalau **e4** disetujui, F4 |
| `gif.js` diganti | **Hanya kalau** pengukuran F5 buruk. Penggantinya library baru → dijelaskan dulu, tunggu izin |
| Browser Firefox & WebKit untuk Playwright | Unduhan alat tes (bukan library website), F3 |

---

## 5. Catatan untuk fase berikutnya

| Ide | Asal |
|---|---|
| Geser & perbesar karakter di dalam frame | Keputusan **b** |
| **Tugas Fase 5:** uji export di Safari asli (pinjam Mac/iPhone atau layanan uji browser) sebelum rilis | **e8**, disetujui |
