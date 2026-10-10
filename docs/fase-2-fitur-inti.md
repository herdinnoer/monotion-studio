# Fase 2: Fitur Inti Editor

Tujuan fase ini: alur utama editor (pilih karakter → pilih mood → ganti warna karakter
& background → export) jadi rapi, bisa diandalkan, dan tampilannya ikut `DESIGN.md`.

Fase ini dibagi dua kelompok:

- **Kelompok A (mesin):** cara editor menyimpan, mengubah, membatalkan, dan mengirim pengaturan.
- **Kelompok B (tampilan):** token desain, komponen HeroUI, dan tes mode terang/gelap.

Nomor baris di dokumen ini mengacu ke kode saat analisis (commit `e38c557`).
Setelah kode diubah, nomor baris bisa bergeser.

---

## Ringkasan: Fase 2 selesai

**Status: selesai** (A2–A6, B1–B3). Pemeriksaan akhir: `npm test`, `npm run test:e2e`,
lint, dan build lulus.

### Yang selesai

| Bagian | Hasil |
|---|---|
| A2 Paket kondisi | Semua pengaturan karya user di satu paket. Nama proyek jadi nama file export (`Kopi Pagi` → `kopi-pagi.gif`). Klik karakter yang sudah dipilih tidak mereset warna |
| A3 Undo/redo | Satu kali geser color picker = 1 langkah. Langkah kosong ditolak, riwayat maks 100 |
| A4 Background & export | GIF/WebM/SVG ikut warna background atau transparan (Remove Background). WebM transparan lewat penjahit sendiri `webmAlphaMuxer.js` |
| A5 Simpan di browser | Pengaturan & nama proyek tetap ada setelah refresh; data rusak tidak bikin error |
| A6 Tes kasus aneh | `npm test` (Node) untuk rumus & kasus aneh |
| B1 Token | Warna, font, radius dari DESIGN.md dipasang ke tema HeroUI; tidak ada kode warna langsung di komponen |
| B2 Komponen HeroUI | Select, segmented, Modal, Toast, Slider, ProgressBar, tombol ikon + tooltip, kartu karakter. Fokus terkurung di jendela Export (T-13) |
| B3 Tes dua mode | Tes browser otomatis `npm run test:e2e` (Playwright, 29 tes) + 6 temuan diperbaiki |

### Keputusan yang berubah selama Fase 2

| Topik | Rencana awal | Akhirnya | Asal |
|---|---|---|---|
| Papan catur Remove Background | Pola papan catur 8px di kanvas | **Dibatalkan.** Kanvas tetap pola titik; export transparan tidak berubah | K-4, B2 |
| Menu kecepatan player | Diganti `Dropdown` HeroUI | **Dihapus**, karena karakter tidak ikut melambat/mempercepat | K-11, B2 |
| Penghitung frame | Mono 10px di player bar | **Dihapus**; hanya penghitung waktu (mono + `tabular-nums`) | B2 |
| Radius | Nama sendiri (`radius-xs` … `radius-2xl`) | **Skala bawaan Tailwind** (`rounded-md` 6px … `rounded-3xl` 24px), satu token tambahan `rounded-button` 10px | K-6, B1 |
| Garis kartu karakter terpilih | Garis 2px `accent` | **Garis 1px abu `border-selected`**; biru hanya untuk cincin fokus keyboard | B2 |
| Popover | `surface-raised` (tanpa detail) | `surface-raised`, sudut 12px, jarak 8px dari pemicunya, **isian di dalamnya `surface`** | B3 |
| Library | Tidak ada library baru | Tetap, kecuali alat tes `@playwright/test` (devDependency, tidak ikut ke website) | B3 |

### Ide untuk fase berikutnya

Rinciannya di bagian 6.
- **Tombol Cancel export**, supaya user tidak harus menunggu export selesai.

---

## 1. Kondisi sekarang

### 1.1 Peta file editor

| File | Peran |
|---|---|
| `src/app/editor/page.jsx` | "Otak" editor: menyimpan riwayat undo/redo, karakter terpilih, `config`, shortcut keyboard |
| `src/components/Editor/TopBar.jsx` | Logo, Projects, tombol undo/redo, nama proyek, pengalih tema, Export, avatar |
| `src/components/Editor/LeftSidebar.jsx` | Daftar kartu karakter |
| `src/components/Editor/CenterWorkspace.jsx` | Kanvas bertitik + kotak `#character-workspace` (background + karakter) |
| `src/components/Editor/AnimationPlayerBar.jsx` | Play/pause, scrub, loop, kecepatan; menghitung durasi mood |
| `src/components/Editor/RightSidebar.jsx` | Customizer: shape preset, mood, background, remove background, warna |
| `src/components/UI/ColorInput.jsx` | Kotak warna + popover color picker HeroUI + tombol acak |
| `src/components/Editor/ExportModal.jsx` | Pilih format/resolusi/fps, memanggil fungsi export |
| `src/components/UI/GlossyButton.js` | Tombol glossy (Export) |
| `src/lib/exportUtils.js` | Mesin export GIF, SVG, WebM (+ Lottie/React yang disembunyikan) |
| `src/characters/registry.js` | Sumber daftar karakter, mood default, durasi mood |

### 1.2 Alur data sekarang

```
page.jsx
 ├─ history[]  ── tiap isi: { selectedCharacterId, config }
 │                config = { mood, shapePreset, color, backgroundColor, isBgRemoved }
 ├─ historyIndex
 ├─ currentDurationMs  (disalin dari AnimationPlayerBar)
 │
 ├─ LeftSidebar    → handleSelectCharacter(id)       → pushState
 ├─ RightSidebar   → onConfigChange({...config, x})  → pushState
 ├─ CenterWorkspace ← config (tampilan saja)
 ├─ AnimationPlayerBar ← mood; kirim balik durasi
 └─ ExportModal    ← characterId, config, durationMs
                     └─ exportAsGif / exportAsWebm  ✗ config TIDAK diteruskan (B-9)
                     └─ exportAsSvg                 ✗ background tidak dipakai sama sekali
```

Semua perubahan (pilih mood, ganti warna, toggle background) masuk ke satu fungsi
`pushState` (`page.jsx:51–67`), yang menambah satu langkah baru ke riwayat.

### 1.3 Masalah yang ditemukan (Kelompok A)

| # | Masalah | Lokasi | Dibereskan di |
|---|---|---|---|
| M-1 | **Geser color picker = ratusan langkah undo.** `ColorArea` & `ColorSlider` memanggil `onChange` di setiap gerakan mouse; tiap panggilan langsung jadi `pushState`. Satu kali geser bisa butuh puluhan Ctrl+Z untuk kembali | `ColorInput.jsx:57–61` → `RightSidebar.jsx:22–24`, `:31–33` → `page.jsx:82–84` | A3 |
| M-2 | Klik kartu karakter yang **sudah terpilih** tetap membuat langkah baru dan **mereset warna & bentuk** ke default (warna user hilang tanpa sengaja) | `page.jsx:70–79`, `LeftSidebar.jsx:23` | A2 |
| M-3 | Perubahan yang tidak mengubah apa-apa tetap dicatat (pilih mood yang sama, Reset saat sudah default) → langkah undo "kosong" | `page.jsx:51–67` (tidak ada cek "sama atau tidak") | A3 |
| M-4 | Riwayat tidak dibatasi, terus bertambah selama sesi | `page.jsx:53–63` | A3 |
| M-5 | **Tiga versi background default:** awal `#f5f5f7` (`page.jsx:38`), tombol Reset `#FFFFFF` (`RightSidebar.jsx:37`), cadangan tampilan `#FFFFFF` (`RightSidebar.jsx:135`), cadangan export `#f5f5f7` (`exportUtils.js:76`). Reset tidak mengembalikan ke kondisi awal | file di kolom kiri | A2 |
| M-6 | Ctrl+Z diabaikan kalau fokus ada di `<input>` apa pun, termasuk **slider timeline** (`<input type="range">`) dan Switch. Setelah scrub timeline atau klik Switch, undo tidak jalan sampai user klik tempat lain | `page.jsx:104–112`, `AnimationPlayerBar.jsx:217` | A3 |
| M-7 | Spasi (play/pause) tidak mengecek tombol/select yang sedang fokus: spasi di tombol memicu dua aksi sekaligus (klik tombol + play/pause) | `AnimationPlayerBar.jsx:161–173` | A3 |
| M-8 | Durasi mood disimpan dobel: dihitung di `AnimationPlayerBar`, lalu disalin ke `page.jsx` lewat `useEffect`. Padahal bisa dihitung langsung dari registry. Fungsinya ditulis inline (`page.jsx:175`) jadi efeknya jalan ulang tiap render | `page.jsx:28`, `:175`, `AnimationPlayerBar.jsx:23–30` | A2 |
| M-9 | **B-9:** export GIF & WebM tidak menerima `config`, jadi selalu memakai cadangan `#f5f5f7`. Rinciannya di 1.4 | `ExportModal.jsx:40–48`, `:61–69`, `exportUtils.js:76` | A4 |
| M-10 | Remove Background di kanvas memperlihatkan pola titik kanvas, jadi user tidak bisa membedakan "transparan" dengan "kanvas kosong" | `CenterWorkspace.jsx:16`, `:24` | A4 (+ desain di B2) |
| M-11 | Pengaturan hilang saat halaman di-refresh | `page.jsx:31–43` (selalu mulai dari default) | A5 |
| M-12 | Nama proyek hidup sendiri di `TopBar` (tidak masuk `config`, tidak dipakai nama file export, ikut hilang saat refresh) | `TopBar.jsx:17`, `ExportModal.jsx:36` | A2 (keputusan K-2) |
| M-13 | Prop `onExport` dikirim tapi tidak pernah dipakai (sisa kode) | `page.jsx:191–193` | A2 |
| M-14 | Fungsi export memakai mood cadangan `"idle"` kalau `config` kosong, padahal tidak semua karakter punya mood `idle`. Saat ini aman karena durasi selalu dikirim, tapi rapuh | `exportUtils.js:175`, `:351` | A4 |

### 1.4 Bedah bug B-9 (background di export)

Bug ini lebih dari sekadar "lupa kirim `config`". Ada empat lapis masalah:

1. **`config` tidak dikirim.** `ExportModal` hanya mengirim `config` ke Lottie & React
   (yang disembunyikan), tidak ke GIF & WebM (`ExportModal.jsx:40–48`, `:61–69`).
   Akibatnya `exportUtils.js:165` / `:346` memakai `config = {}` dan `:76` mengisi kanvas `#f5f5f7`.
2. **Pita abu-abu di pinggir.** Kotak `#character-workspace` bentuknya mengikuti area tengah
   (lebar, bukan persegi). Saat diskalakan ke kanvas persegi (`exportUtils.js:85–102`, mode
   "contain"), sisa atas/bawah atau kiri/kanan diisi warna cadangan `#f5f5f7`, bukan warna
   background user. Jadi walau background user merah, hasil export punya pita abu-abu muda.
   (Perlu dikonfirmasi saat tes A4, tapi alurnya jelas dari kode.)
3. **GIF memang tidak bisa transparan dengan setelan sekarang.** `gif.js` dipasang dengan
   `transparent: null` (`exportUtils.js:213`). GIF hanya kenal transparan "nyala/mati" per
   piksel (tidak ada setengah transparan), jadi tepi karakter yang halus bisa terlihat
   bergerigi atau ada garis tipis (halo). Perlu teknik "warna kunci": isi latar dengan satu
   warna yang tidak dipakai karakter, lalu beri tahu `gif.js` warna itu = transparan.
4. **WebM membuang transparansi.** `VideoEncoder` dikonfigurasi tanpa `alpha: "keep"`
   (`exportUtils.js:438–443`) dan `Muxer` tanpa opsi alpha (`:423–431`). Jalur cadangan
   `MediaRecorder` (`:481–515`) dukungan transparansinya tergantung browser. Frame
   perantara sudah WebP (`:411`), yang mendukung transparan, jadi bagian itu aman.

Tambahan: **SVG mengabaikan background sepenuhnya** (`exportUtils.js:290–333` hanya mengambil
`<svg>` karakter). Hasil SVG selalu transparan walau user memilih warna background.
Perlu keputusan (lihat A4).

---

## 2. Kelompok A — Mesin

Urutan dikerjakan: A2 → A3 → A4 → A5 → A6. Satu langkah = satu tugas kecil, dites dulu
sebelum lanjut.

### A2. Paket kondisi editor

**Isi:**
- Satukan semua yang mendefinisikan "hasil karya" ke satu paket:
  `{ characterId, mood, shapePreset, color, backgroundColor, isBgRemoved }`.
  Karakter masuk ke paket yang sama (sekarang terpisah jadi `selectedCharacterId` + `config`).
- Buat satu file kecil (usulan: `src/lib/editorState.js`) berisi:
  - `DEFAULT_BACKGROUND = "#FFFFFF"` — satu nilai saja (keputusan K-1). Dipakai oleh state
    awal, tombol Reset, tampilan, dan export (beres M-5).
    **Jangan tertukar** dengan token `bg-app` (`#F5F5F7`) di DESIGN.md: `bg-app` adalah latar
    UI editor, `DEFAULT_BACKGROUND` adalah background karakter (bagian dari hasil karya).
  - `createInitialState(character)` — paket awal.
  - `sanitizeState(raw)` — merapikan paket dari luar (dipakai A5): karakter tak dikenal →
    karakter default, mood tak dimiliki → `pickMood`, warna bukan hex → default, dst.
  - `isSameState(a, b)` — dipakai A3 untuk menolak langkah kosong.
- Durasi mood dihitung langsung dari registry di `page.jsx` (`getMoodDuration`), hapus
  salinan `currentDurationMs` & `onDurationChange` (beres M-8).
- Hapus prop `onExport` yang tidak terpakai (M-13).
- **Bug klik karakter yang sudah terpilih (M-2):** `handleSelectCharacter` langsung berhenti
  kalau `id` sama dengan karakter yang aktif. Warna & bentuk tidak direset, tidak ada langkah baru.
- **Nama proyek → nama file export (M-12, keputusan K-2):**
  - Input nama proyek di top bar tetap tampil, placeholder **"Untitled"**, isi awal kosong.
  - Fungsi `exportFilename({ projectName, characterName, mood })` di `editorState.js`:
    huruf kecil, spasi jadi `-` (contoh: `"Kopi Pagi"` → `kopi-pagi.gif`).
  - Kalau nama proyek kosong → nama karakter + mood (contoh: `capybara-happy.gif`).
  - `ExportModal` memakai fungsi ini untuk GIF, WebM, dan SVG (ganti `ExportModal.jsx:36`).
  - Pembersihan nama (K-9): simbol terlarang (`/ \ : * ? " < > |`) dan emoji **diganti strip**,
    strip berurutan digabung jadi satu, strip di awal/akhir dibuang. Kalau hasilnya kosong →
    nama karakter + mood. Contoh: `"Kopi/Pagi?"` → `kopi-pagi.gif`.
  - Nama proyek **tidak ikut undo/redo**, tapi **ikut disimpan di browser** (K-10, lihat A5).
- File fungsi murni (`editorState.js`) **tidak boleh** memakai import alias `@/`, supaya bisa
  dites langsung dengan Node di A6.

**Selesai kalau:**
- Hanya ada satu nilai background default karakter: `DEFAULT_BACKGROUND` di `editorState.js`
  (`grep -rni "#f5f5f7\|#ffffff" src/components src/app/editor src/lib/exportUtils.js` tidak
  menemukan background karakter lain).
- Klik kartu karakter yang sedang aktif → warna tidak berubah, tombol undo tidak menyala.
- Nama file export sesuai aturan K-2.
- `page.jsx` tidak lagi punya `currentDurationMs`.
- Selain M-2, nama file, dan background default, editor berperilaku sama seperti sebelumnya
  (sisanya "pindah barang", bukan ubah fitur).

**Cara tes:**
1. `npm run dev`, buka `/editor`.
2. Ganti karakter, mood, warna, background, toggle Remove Background: semua tetap jalan.
3. Klik Reset background → `#FFFFFF`, sama dengan saat editor pertama dibuka.
4. Ganti warna karakter → klik kartu karakter yang sama → warna tetap, tidak ada langkah undo baru.
5. Export dengan nama proyek `Kopi Pagi` → file `kopi-pagi.gif`. Kosongkan nama proyek →
   file `<karakter>-<mood>.gif`.
6. Ganti mood ke yang lebih panjang/pendek → angka total detik di player bar ikut berubah,
   export GIF durasinya sesuai.
7. `npm run lint` bersih.

### A3. Undo/redo rapi

**Isi:**
- **Pisahkan "pratinjau" dan "simpan langkah".** Analogi Figma: saat kamu geser warna di
  Figma, kotaknya berubah terus, tapi Ctrl+Z cuma mundur satu kali ke warna sebelum digeser.
  - `ColorPicker` HeroUI hanya punya `onChange`, tapi `ColorArea` dan `ColorSlider` di dalamnya
    punya `onChangeEnd` (dari React Aria, sudah terpasang). Rencananya:
    - selama digeser → `onChange` memperbarui **draf** (tampilan berubah, riwayat tidak);
    - saat mouse dilepas → `onChangeEnd` menyimpan **satu** langkah;
    - klik swatch, tombol acak, ketik hex lalu Enter/blur → langsung satu langkah.
  - Di `page.jsx`: tambah `draft` (paket sementara). Yang ditampilkan = `draft ?? history[index]`.
    Fungsi baru `previewState(next)` mengisi draf, `commitState(next)` menyimpan langkah dan
    mengosongkan draf.
- Tolak langkah kosong: kalau paket baru sama dengan sekarang (`isSameState`), jangan dicatat (M-3).
- Batasi riwayat 100 langkah (K-5); yang paling lama dibuang (M-4).
- Gabungkan `history` + `historyIndex` ke satu state (atau `useReducer` bawaan React) supaya
  tidak ada risiko keduanya tidak sinkron. Tanpa library baru.
- Shortcut (M-6, M-7):
  - Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y hanya diabaikan di kolom ketik teks (input teks, input hex,
    textarea), **tidak** di slider, switch, atau tombol.
  - Spasi hanya play/pause kalau fokus tidak sedang di tombol, select, atau kolom ketik.

**Selesai kalau:**
- Geser color area / hue slider bolak-balik selama 5 detik, lepas, lalu Ctrl+Z **sekali**
  → warna kembali ke warna sebelum digeser.
- Pilih mood yang sama dari dropdown → tidak ada langkah baru.
- Setelah scrub timeline, Ctrl+Z langsung jalan.

**Cara tes (manual, urut):**
1. Buka editor segar. Tombol undo harus nonaktif.
2. Ganti warna karakter dengan menggeser color area lama. Ctrl+Z 1× → warna awal. Ctrl+Shift+Z 1× → warna hasil geser.
3. Sama untuk hue slider dan color picker background.
4. Ketik hex `FF0000` di kolom hex → Enter → 1 langkah.
5. Tombol acak 3× → Ctrl+Z 3× kembali ke awal.
6. Undo 2×, lalu ganti mood → tombol redo nonaktif (cabang masa depan dibuang).
7. Scrub slider timeline, lalu Ctrl+Z → undo jalan. Tekan spasi saat fokus di tombol Export → modal terbuka, animasi tidak ikut pause.
8. Lakukan 120 perubahan (tombol acak) → undo maksimal 100× lalu berhenti.

### A4. Background transparan + bug B-9

**Isi:**
1. `ExportModal` mengirim `config` lengkap (background + mood) ke GIF dan WebM.
2. `captureAndScaleToTarget` mengisi kanvas dengan `backgroundColor` user (bukan cadangan),
   atau **dibiarkan kosong** kalau `isBgRemoved` → pita abu-abu hilang.
3. **GIF transparan:** pakai warna kunci (misalnya hijau `#00FF00` yang tidak dipakai karakter),
   isi latar dengan warna itu, set `transparent: 0x00FF00` di `gif.js`. Batasan: tepi
   karakter bisa bergerigi/berhalo karena GIF tidak punya setengah transparan. Ini batas
   format GIF, bukan bug; disampaikan ke user lewat teks kecil di modal export.
   *Dikerjakan:* warna kunci dipilih otomatis (`src/lib/gifKeyColor.js`): warna yang paling
   jauh dari semua warna karakter di semua frame + warna pilihan user. Karakter `#00FF00`
   → kunci pindah ke `#FF00FF`. Piksel dengan alpha < 128 jadi tembus, sisanya padat
   (tanpa campuran warna kunci, jadi tidak ada halo hijau).
4. **WebM transparan:** ~~`VideoEncoder.configure({ ..., alpha: "keep" })` + opsi alpha di
   `Muxer` (`webm-muxer` sudah mendukung, tidak perlu library baru).~~ **Koreksi (hasil tes
   A4):** rencana ini tidak jalan, lihat "Catatan temuan A4" di bawah. Cek dukungan browser
   dengan `VideoEncoder.isConfigSupported`; kalau tidak didukung, tampilkan peringatan
   (token `warning` DESIGN.md) dan export dengan latar warna, bukan diam-diam gagal.
5. **SVG (keputusan K-3):** ikut aturan background yang sama dengan GIF/WebM. Kalau background
   **tidak** dihapus, tambahkan `<rect>` warna background di belakang karakter; kalau dihapus,
   biarkan transparan.
6. Hapus cadangan mood `"idle"` di `exportUtils.js` (M-14): mood selalu dari `config`.
7. Tampilan Remove Background di kanvas (M-10, keputusan K-4): ganti pola titik dengan
   **pola papan catur** (tanda universal "transparan", seperti di Figma/Photoshop).
   Kotak 8px. Terang: `surface` (`#FFFFFF`) + `surface-hover` (`#E4E4E8`).
   Gelap: `surface-raised` (`#232328`) + `surface-hover` (`#2C2C32`).
   Aturannya sudah ditulis di DESIGN.md bagian 3 "Kanvas"; tokennya dipasang di B1.
   **Diubah di B2 (lihat K-4):** papan catur dibatalkan, kanvas kembali menampilkan pola titik.

**Selesai kalau:**
- Export GIF/WebM dengan background merah → seluruh kotak merah, tidak ada pita abu-abu.
- Export GIF/WebM/SVG dengan Remove Background → latar transparan.
- SVG dengan background biasa → ada warna background.
- Di browser yang tidak mendukung WebM transparan, user melihat peringatan yang jelas.

**Cara tes:**
1. Untuk tiap format (GIF, WebM, SVG) × (background warna, Remove Background) = 6 file.
2. GIF transparan: buka di browser di atas halaman gelap & terang (tarik file ke tab baru,
   ganti tema DevTools), dan di Figma (taruh di atas frame berwarna).
3. WebM transparan: buka di **Chrome** dan **Firefox** di atas halaman berwarna; impor ke Figma
   atau editor video yang mendukung alpha. Catat hasil per pemutar di tabel tes (catatan
   B-9 di Fase 1: "perlu dites di beberapa pemutar video").
4. Cek dimensi file = resolusi yang dipilih (misalnya 720×720).
5. Cek warna background di file sama dengan kode hex di panel (pakai pipet di Figma).

**Catatan temuan A4 (WebM transparan):**

Yang ternyata **tidak bisa** (dites di Chrome 154):
- `VideoEncoder` dengan `alpha: "keep"`: `isConfigSupported` menjawab tidak didukung, baik
  VP9 maupun VP8.
- `webm-muxer` 5.1.4 opsi `alpha: true` hanya menulis tanda "video ini transparan" di kepala
  file. Lapisan alpha per frame (BlockAdditions) tidak bisa ditulis lewat API-nya.
- `MediaRecorder` VP8 (merekam kanvas) memang menyimpan transparansi, tapi **ditolak**:
  - warna bergeser ±9 tingkat (putih `250` jadi `255`);
  - waktu tiap frame ikut jam asli, jadi jarak antar frame acak (14–99 ms, harusnya 33 ms);
  - frame pertama berisi sisa gambar kanvas (109 frame, harusnya 108);
  - pindah tab membuat timer browser melambat, jadi video bisa patah-patah.

Yang **dipakai**: tiap frame di-encode **dua kali** dengan `VideoEncoder` VP9 (sama seperti
WebM biasa): sekali untuk warna, sekali untuk alpha (sebagai gambar hitam-putih). Keduanya
dijahit jadi satu file oleh `src/lib/webmAlphaMuxer.js` (buatan sendiri, tanpa library
baru), mengikuti format resmi WebM transparan (`AlphaMode` + `BlockAdditions`). Info rumus
warna (`Colour`) dari encoder ikut ditulis; tanpa itu warna bergeser (ketajaman ±27 dB).

Hasil tes di Chrome 154 (Mochi, mood idle 3,6 detik):

| | WebM transparan | WebM berlatar warna |
|---|---|---|
| Jumlah frame (720p 30 fps / 1080p 60 fps) | 108 / 216, sama dengan sumber | 108 / 216 |
| Jarak antar frame | 33–34 ms / 16–17 ms | sama |
| Durasi di pemutar | 3,600 detik | 3,566 detik (tanpa durasi frame terakhir) |
| Ketajaman (PSNR vs frame sumber, bagian dalam karakter) | 44–49 dB | 55–59 dB |
| Pindah tab 15 detik saat export | hasil identik, export lebih lama | (tidak dites) |

Hasil tes manual (laptop Windows user, file dibuat di Chrome):

| Tes | Hasil |
|---|---|
| 3. WebM transparan 1080p di Chrome | Transparan |
| 3. WebM transparan 1080p di Edge | Transparan |
| 3. WebM transparan 1080p di Firefox | Transparan |
| 3. WebM transparan 1080p di Figma | Transparan |
| 3. WebM transparan di Safari | Belum dites |
| 3. WebM transparan di editor video (Premiere, DaVinci, dll) | Belum dites |
| 4. Dimensi file sesuai resolusi yang dipilih | Ya |
| 5. Warna background (pipet) sama dengan kode hex di panel | Ya |
| Export dari browser selain Chrome (Firefox, Safari) | Belum dites |

Batasan yang tersisa:
- Ketajaman WebM transparan sedikit di bawah WebM biasa (selisih rata-rata < 1 tingkat warna,
  paling besar 6–20 tingkat di beberapa piksel). Penyebabnya belum ketemu. Sudah dicoba dan
  bukan penyebab: tepi tajam ke area tembus (color bleeding), jalur input warna ke encoder.
  Perlu dicek mata: bandingkan dua file berdampingan.
- File transparan sudah tampil transparan di Chrome, Edge, Firefox, dan Figma. Yang belum
  dites: memutar di Safari & editor video, dan **membuat** export dari Firefox/Safari
  (peringatan "tidak mendukung" muncul kalau browser tidak punya encoder VP9).
- Kalau tab disembunyikan, export jadi lebih lama (timer browser diperlambat), hasilnya tetap
  sama.

### A5. Simpan pengaturan terakhir di browser

**Isi:**
- Simpan paket kondisi (A2) ke `localStorage` (memori kecil di browser, tanpa server, tanpa
  library baru). Kunci usulan: `monotion:editor:v1` (angka versi supaya kalau bentuk paket
  berubah, data lama bisa diabaikan dengan aman).
- Yang disimpan hanya kondisi **sekarang**, bukan riwayat undo (setelah refresh, undo mulai kosong,
  sama seperti Figma setelah file dibuka ulang).
- Simpan dengan jeda kecil (usulan 300ms setelah perubahan terakhir), dan **tidak** saat masih
  draf geser warna, supaya tidak menulis ratusan kali per detik.
- Baca sekali saat editor dibuka, lewat `sanitizeState` (A2). Halaman editor sudah menunggu
  "mounted" sebelum tampil (`page.jsx:141–143`), jadi membaca `localStorage` di sini tidak
  bikin bentrok tampilan server vs browser.
- Semua baca/tulis dibungkus `try/catch`: mode privat atau penyimpanan penuh tidak boleh
  bikin editor error.
- Nama proyek ikut disimpan (K-10), di kunci yang sama tapi di luar riwayat undo.
- Pengaturan player (kecepatan, loop) dan tema: tema sudah disimpan `next-themes`; kecepatan &
  loop **tidak** ikut disimpan (bukan bagian hasil karya).

**Selesai kalau:**
- Pilih Capybara, mood lain, warna & background custom → refresh → semua kembali sama.
- Data rusak/kuno di `localStorage` tidak bikin editor error, editor mulai dari default.

**Cara tes:**
1. Atur editor → refresh → cek sama.
2. DevTools → Application → Local Storage: ubah nilai jadi teks acak → refresh → editor tampil default, tidak error.
3. Ubah `characterId` jadi `"kucing"` → refresh → karakter default.
4. Ubah `mood` jadi mood yang tidak dimiliki karakter → refresh → mood default karakter.
5. Buka di jendela privat → editor jalan normal.

### A6. Tes kasus aneh

**Isi:**
- Tes otomatis untuk fungsi murni (`sanitizeState`, `isSameState`, logika riwayat undo,
  warna kunci GIF di `gifKeyColor.js`) pakai
  **`node --test` bawaan Node 24** (sudah terpasang, tanpa library baru). Tambah script
  `"test": "node --test"` di `package.json`.
- Daftar tes manual untuk hal yang butuh browser.

**Kasus yang dites:**

| # | Kasus | Hasil yang benar |
|---|---|---|
| T-1 | `localStorage` berisi JSON rusak / bukan objek / kosong | Default, tanpa error |
| T-2 | Karakter dihapus dari registry tapi masih tersimpan | Karakter default |
| T-3 | Mood tersimpan tidak dimiliki karakter | `defaultMood` karakter |
| T-4 | Warna `"merah"`, `"#12"`, `null`, `"#GGGGGG"` | Warna default |
| T-5 | Warna huruf kecil vs besar (`#ff0000` vs `#FF0000`) | Dianggap sama (bukan langkah baru) |
| T-6 | Undo di awal / redo di akhir riwayat | Tidak terjadi apa-apa, tidak error |
| T-7 | Undo lalu ubah sesuatu | Cabang redo terbuang |
| T-8 | Lebih dari batas riwayat | Langkah tertua terbuang, index tetap benar |
| T-9 | Ganti karakter saat draf geser warna masih aktif | Draf dibatalkan atau disimpan dulu, tidak bocor ke karakter baru |
| T-10 | Toggle Remove Background lalu ganti warna background | Remove Background mati otomatis (perilaku sekarang, dipertahankan) |
| T-11 | Ctrl+Z saat modal export terbuka / saat export berjalan | Diabaikan (export memakai kondisi saat tombol ditekan) |
| T-12 | Klik Export 2× cepat | Hanya satu export berjalan |
| T-13 | **Sempat temuan, beres di B2.** Mouse tidak bisa (lapisan modal menutupi editor), tapi dulu modal belum "mengurung" fokus keyboard: Tab bisa pindah ke tombol mood di belakang modal, lalu Enter mengganti mood saat export berjalan. Sekarang jendela Export memakai `Modal` HeroUI: fokus terkurung di dalam, Esc & klik di luar diabaikan selama export, tombol ✕ & Close tampil nonaktif sampai export selesai | Lolos |
| T-14 | Nama proyek `"  Kopi   Pagi  "` (spasi berlebih) | `kopi-pagi` |
| T-15 | Nama proyek kosong / hanya spasi | `<karakter>-<mood>` |
| T-16 | Nama proyek `"Kopi/Pagi?"` | `kopi-pagi` (simbol jadi strip, strip di akhir dibuang) |
| T-17 | Nama proyek `"a//b"`, `"a / b"`, `"Kopi 🐹 Pagi"` | `a-b`, `a-b`, `kopi-pagi` (strip berurutan digabung) |
| T-18 | Nama proyek `"?Kopi*"`, `"--Kopi--"` | `kopi` (strip di awal/akhir dibuang) |
| T-19 | Nama proyek hanya simbol/emoji (`"???"`, `"🐹🐹"`) | `<karakter>-<mood>` |
| T-20 | Undo setelah ganti nama proyek | Nama proyek tidak berubah (K-10) |
| T-21 | Ganti nama proyek → refresh | Nama proyek tetap (K-10) |
| T-22 | `pickKeyColor`: karakter tidak memakai warna neon | Kunci `#00FF00` |
| T-23 | `pickKeyColor`: karakter memakai `#00FF00` (atau hijau mirip, misalnya `#05F50A`) | Kunci bukan hijau (`#FF00FF`) |
| T-24 | `pickKeyColor`: `#00FF00`, `#FF00FF`, `#00FFFF` dipakai | Kunci warna favorit berikutnya (`#0000FF`) |
| T-25 | `pickKeyColor`: semua 6 warna favorit dipakai | Warna terjauh di ruang warna; jaraknya ke tiap warna karakter > 60 |
| T-26 | `pickKeyColor`: tidak ada warna tercatat (frame kosong) | Kunci `#00FF00`, tanpa error |
| T-27 | `prepareFrame`: alpha 100 dan 200 | Alpha 100 → tembus (0), alpha 200 → padat (255), warna piksel padat tidak berubah |
| T-28 | `applyKeyColor`: piksel tembus | Diisi warna kunci + alpha 255; piksel padat tidak berubah |
| T-29 | `hexToRgbNumber`: `"#0f0"`, `"00FF00"`, `"bukan-hex"` | `0x00FF00`, `0x00FF00`, `null` |

**Selesai kalau:** `npm test` lulus semua, daftar manual T-9 s/d T-13 sudah dicoba dan hasilnya dicatat di dokumen ini.

**Hasil A6:**

- Tes otomatis: `npm test` → **32 tes, 32 lulus**. File tes ada di sebelah file yang dites
  (`src/lib/*.test.js`), memakai karakter tiruan `src/lib/testCharacters.js` karena registry asli
  berisi komponen React yang tidak bisa dimuat Node.
- Script test memakai `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`: tanpa `"type": "module"`
  di `package.json`, Node memberi peringatan tiap file. Menambah `"type": "module"` berisiko untuk
  `tailwind.config.js`, jadi peringatannya saja yang dimatikan.
- Bug yang ketemu dan sudah diperbaiki:
  - **T-29:** `hexToRgbNumber("bukan-hex")` menghasilkan `11` (huruf `b` dibaca sebagai hex),
    bukan `null`. Sekarang dicek dengan pola hex 3/6 digit dulu.
  - **T-11:** Ctrl+Z / Ctrl+Y tetap jalan saat modal export terbuka. Sekarang shortcut undo/redo
    diabaikan selama modal terbuka (`page.jsx`).
  - **T-12:** tombol Export tidak terkunci selama export (salah nama prop, lihat tabel).

Tes manual (butuh browser). Kolom "Analisis kode" dari membaca kode; kolom "Dicoba" diisi
setelah dicoba di browser.

| # | Analisis kode | Dicoba |
|---|---|---|
| T-9 | **Aman.** Dengan mouse tidak mungkin: selama geser, pointer "dipegang" color picker, dan melepasnya langsung menyimpan langkah. Dengan keyboard, tiap tekan panah langsung disimpan. Kalau draf tetap ada, ganti karakter menyimpan draf background bersama karakter baru (= "disimpan dulu"); warna karakter tetap direset ke warna karakter baru | Lolos |
| T-10 | **Aman.** Ganti/geser/reset warna background selalu mematikan Remove Background (`RightSidebar.jsx`) | Lolos |
| T-11 | **Sempat gagal, sudah diperbaiki.** Tombol undo/redo di top bar tertutup lapisan modal; shortcut keyboard sekarang ikut diabaikan | Lolos |
| T-12 | **Sempat salah, sudah diperbaiki.** Tombol Export memakai `disabled`/`onClick`, padahal `Button` HeroUI memakai `isDisabled`/`onPress`, jadi tombol tidak terkunci selama export. Sekarang `ExportModal.jsx` & `TopBar.jsx` memakai nama HeroUI. Tombol HeroUI lain di proyek sudah benar | Lolos |
| T-13 | **Temuan, ditunda ke B2** (sudah masuk "Selesai kalau" B2). Mouse tidak bisa (lapisan modal menutupi editor), tapi modal belum "mengurung" fokus keyboard: Tab bisa pindah ke tombol mood di belakang modal, lalu Enter mengganti mood saat export berjalan. Export memotret tampilan langsung, jadi frame bisa berubah di tengah jalan. Diusulkan beres di B2 saat modal pindah ke `Modal` HeroUI (fokus otomatis terkurung) | Ditunda ke B2 |

---

## 3. Kelompok B — Tampilan (ikut DESIGN.md)

Wajib baca `DESIGN.md` dan `.github/antislop.md` sebelum mulai tiap langkah.

### 3.1 Masalah yang ditemukan (Kelompok B)

| # | Masalah | Lokasi |
|---|---|---|
| U-1 | **Variabel tema memakai nama HeroUI v2** (`--heroui-foreground`, `--heroui-divider`). HeroUI v3 tidak membaca nama ini, jadi blok ini **tidak berpengaruh apa pun**. Nama v3 yang benar ada di `node_modules/@heroui/styles/dist/themes/default/variables.css` (`--background`, `--foreground`, `--surface`, `--border`, `--accent`, dst.) | `globals.css:19–29` |
| U-2 | Class `border-divider` dipakai 21× tapi **tidak ada** di HeroUI v3 (yang ada `border-border` / `border-separator`). Class-nya diabaikan, garis tepi jatuh ke warna `--border` bawaan HeroUI (`base/base.css:21`), bukan warna DESIGN.md | TopBar (5), RightSidebar (7), ColorInput (6), LeftSidebar (2), ExportModal (1) |
| U-3 | Class `.bg-dot-pattern` **tidak dipakai di mana pun**. Pola titik kanvas malah ditulis ulang langsung di `CenterWorkspace`, ditambah class tidak sah `bg-[none]` | `globals.css:31–45`, `CenterWorkspace.jsx:15–17` |
| U-4 | `tailwind.config.js` adalah format Tailwind 3. Tailwind 4 **tidak membacanya** kecuali dipanggil `@config` di CSS (tidak ada). Jadi `font-sans` kemungkinan besar **bukan** Plus Jakarta Sans. Perlu dicek di DevTools (tab Computed → font-family) | `tailwind.config.js`, `globals.css` |
| U-5 | Kode warna langsung (hex & `gray-*`/`blue-*`) tersebar: ±91 hex + ±121 class warna Tailwind | Terbanyak: ExportModal (12 hex/45 class), AnimationPlayerBar (8/29), RightSidebar (14/17), ColorInput (18/11, 9 di antaranya preset warna karakter yang memang boleh), GlossyButton (21/1), TopBar (9/12), `page.jsx:142,149`, `layout.js:20` |
| U-6 | **Skala radius bentrok nama.** Di HeroUI v3 `radius-lg` = 8px (dihitung dari `--radius`), di DESIGN.md `radius-lg` = 12px. Kalau cuma mengubah `--radius`, angka DESIGN.md tidak bisa dicapai semua (perbandingannya beda) | `themes/shared/theme.css` (HeroUI) vs `DESIGN.md` bagian 5 |
| U-7 | Varian `dark:` dari HeroUI punya cadangan "ikuti setting OS gelap". Perlu dipastikan mode terang tetap terang walau OS user dalam mode gelap | `@heroui/styles/dist/variants/index.css:84–107` |
| U-8 | Komponen buatan sendiri padahal HeroUI punya: dropdown mood (`<select>` biasa), tombol segmented di modal, modal export, menu kecepatan, slider timeline (`<input type="range">`), progress bar, tombol ikon, input nama proyek, pengalih tema, notifikasi (`alert()`) | Lihat tabel B2 |
| U-9 | Tombol **Projects** tidak berfungsi, **avatar** contoh dari layanan luar (dicebear, dengan nama asli) | `TopBar.jsx:38–43`, `:131–137` |
| U-10 | Ikon pakai ukuran campur (12, 14, 15, 16, 18) dan tebal garis bawaan 2 | Semua komponen editor |
| U-11 | Teks "Remove Background" adalah `<span>` yang bisa diklik, bukan label; Switch tanpa `aria-label`. Tombol ikon tanpa `aria-label`/tooltip | `RightSidebar.jsx:141–156`, `TopBar.jsx`, `AnimationPlayerBar.jsx` |
| U-12 | Panel memakai bayangan (`dark:shadow-xl`), DESIGN.md melarang bayangan di panel | `LeftSidebar.jsx:8`, `RightSidebar.jsx:50`, `TopBar.jsx:23`, `AnimationPlayerBar.jsx:194` |

### B1. Token warna/radius/font ke tema HeroUI + ganti semua kode warna manual

**Isi:**
1. Hapus blok `--heroui-*` di `globals.css:19–29` (U-1) dan `.bg-dot-pattern` (U-3).
2. Pasang token DESIGN.md ke **nama variabel HeroUI v3** di `globals.css`, dua kali: untuk
   `:root, .light, [data-theme="light"]` dan `.dark, [data-theme="dark"]`.

   | Token DESIGN.md | Variabel HeroUI v3 | Catatan |
   |---|---|---|
   | `bg-app` | `--background` | |
   | `surface` | `--surface`, `--overlay` (modal) | |
   | `surface-raised` | `--surface-secondary`, `--default`, `--field-background`, `--segment` (grup) | Popover juga `surface-raised` → perlu dicek apakah popover HeroUI pakai `--overlay` |
   | `surface-hover` | `--default-hover`, `--field-hover` | `--surface-hover` HeroUI artinya hover di atas `surface`, beda arti; ditimpa juga supaya konsisten |
   | `border` | `--border`, `--separator` | Lalu ganti semua `border-divider` → `border-border` (U-2) |
   | `text` | `--foreground` | |
   | `text-muted` | `--muted` | |
   | `text-subtle` | (tidak ada) | Token baru lewat `@theme` → class `text-subtle` |
   | `accent`, `accent-hover` | `--accent`, `--accent-hover` | HeroUI menaruh `--accent` di blok bersama; harus ditimpa per mode karena nilai terang ≠ gelap |
   | `focus-ring` | `--focus` | |
   | `success`, `danger`, `warning` | `--success`, `--danger`, `--warning` | |
   | Glossy (3 keadaan) | Token baru `--glossy-*` | Satu-satunya gradient |
   | Pola titik kanvas | Token baru `--canvas-dot` | Ganti `CenterWorkspace.jsx:15–17` |
   | Papan catur (A4) | ~~Token baru `--checker-a`, `--checker-b`~~ | Dihapus di B2 (K-4 diubah) |

3. **Radius (U-6, keputusan K-6):** nilai piksel **tetap ikut DESIGN.md**. Cara memetakannya
   ke nama HeroUI (`--radius`, `--field-radius`, `--radius-xs` … `--radius-3xl`) **belum
   diputuskan**: di awal B1 disiapkan usulan pemetaan (tabel nama DESIGN.md → nama HeroUI →
   komponen HeroUI yang terdampak) dan diajukan ke user sebelum dipasang.
4. **Font (U-4):** pindahkan font ke CSS (`@theme { --font-sans: var(--font-plus-jakarta), sans-serif; }`)
   lalu hapus `tailwind.config.js` (K-8: jelaskan & minta izin dulu sebelum menghapus file).
   Tambah token `--font-mono` untuk penghitung waktu/frame.
5. Ganti semua kode warna manual di komponen (U-5) dengan class token (`bg-surface`,
   `bg-surface-secondary`, `text-muted`, `border-border`, `bg-accent`, ...).
   Pengecualian yang boleh tetap: 9 preset warna di `ColorInput.jsx:27–37` (itu "cat" untuk
   karakter, bukan warna UI) dan warna di dalam folder `src/characters`.
6. `layout.js:20` & `page.jsx:142,149`: ganti `bg-[#1C1C1E] text-white` dengan `bg-background text-foreground`.

**Selesai kalau:**
- `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components src/app` hanya menemukan: preset warna
  `ColorInput`, dan token di `globals.css`.
- `grep -rnE "(gray|blue|orange)-[0-9]" src/components src/app` = 0 hasil.
- `grep -rn "border-divider\|--heroui-\|bg-dot-pattern" src` = 0 hasil.
- DevTools menunjukkan font Plus Jakarta Sans di teks editor.

**Cara tes:** cek dengan grep di atas, lalu lihat B3.

### B2. Rapikan komponen sesuai DESIGN.md bagian 8

**Isi:** satu komponen per langkah kecil.

| Bagian | Sekarang | Jadi (HeroUI) |
|---|---|---|
| Dropdown mood | `<select>` biasa (`RightSidebar.jsx:93`) | `Select` |
| Shape preset | Tombol biasa (`RightSidebar.jsx:66–79`) | `ToggleButtonGroup` (segmented) |
| Format / resolusi / fps | Tombol biasa (`ExportModal.jsx:139–205`) | `ToggleButtonGroup` |
| Modal export | `div` buatan sendiri (`ExportModal.jsx:118`) | `Modal` (dapat fokus terkunci, Esc untuk tutup, animasi sesuai DESIGN.md) |
| Progress export | `div` (`ExportModal.jsx:211–224`) | `ProgressBar` |
| Notifikasi berhasil/gagal | `alert()` (`ExportModal.jsx:88`, `:97`) | `Toast` |
| Menu kecepatan | Menu buatan (`AnimationPlayerBar.jsx:239–268`) | **Dihapus** (K-11). Sempat diganti `Dropdown`, lalu dihapus karena tidak berfungsi |
| Slider timeline | `<input type="range">` (`AnimationPlayerBar.jsx:217`) | `Slider` |
| Tombol ikon (undo, redo, play, reset, loop, close) | `button` biasa | `Button isIconOnly` 32×32 + `Tooltip` + `aria-label` |
| Pengalih tema | 2 tombol biasa (`TopBar.jsx:102–125`) | `ToggleButtonGroup` |
| Switch Remove Background | `Switch` + `span` | `Switch` dengan label di dalamnya (U-11) |
| Kartu karakter | Tombol buatan (`LeftSidebar.jsx:21–45`) | `ToggleButton` HeroUI dulu (K-7). Kalau harus buatan sendiri: jelaskan alasannya ke user dan tunggu izin. Terpilih: `surface-raised` + garis 2px `accent` |
| Tombol glossy | 3 varian warna (`GlossyButton.js:16–35`) | Hanya biru, pakai token `--glossy-*`. Hapus varian pink & hijau |
| Projects & avatar | Tampil (`TopBar.jsx:38–43`, `:131–137`) | **Disembunyikan** sampai Fase 6 |
| Nama proyek | `<input>` biasa (`TopBar.jsx:80–97`) | `Input` HeroUI, placeholder "Untitled" (K-2) |
| Bayangan panel | `dark:shadow-xl` (U-12) | Dihapus; hanya popover & modal yang berbayang |
| Ikon | Ukuran campur, tebal 2 (U-10) | `LucideProvider strokeWidth={1.75}` dipasang **sekali** di `providers.js` (sudah ada di `lucide-react`, tanpa library baru). Ukuran 16px di tombol, 14px di input/select |
| Penghitung waktu/frame | `font-mono` saja | `font-mono tabular-nums`, 10–11px |
| Gerakan UI | Campur (`transition-all`, `zoom-in-95`) | 150ms ease-out (hover), 200ms (modal), hormati `prefers-reduced-motion` |

**Selesai kalau:**
- Semua baris tabel di atas sudah dikerjakan.
- Tidak ada `<select>`, `<input type="range">`, atau `alert(` tersisa di `src/components`.
- Projects & avatar tidak terlihat. Tidak ada request ke `api.dicebear.com` di tab Network.
- Semua tombol ikon punya `aria-label` dan tooltip.
- Semua bisa dipakai pakai keyboard saja (Tab, Enter, Esc, panah).
- Tab tidak bisa keluar dari jendela Export selama terbuka (fokus terkurung di dalam modal),
  jadi mood/warna tidak bisa diganti saat export berjalan (temuan T-13 di A6).

**Cara tes:** per komponen yang diganti: klik dengan mouse, lalu ulangi pakai keyboard saja;
cek fitur A2–A5 tetap jalan (terutama undo color picker dan export).

### B3. Tes dua mode

**Status: selesai.** Semua cek dijalankan otomatis lewat `npm run test:e2e` (Playwright,
folder `e2e/`, batas 60 detik per tes & 10 menit total). 29 tes lulus.

**Isi:** cek semua layar di mode terang dan gelap.

**Daftar cek (tiap mode):**
1. Top bar, sidebar kiri, sidebar kanan, kanvas, player bar, modal export, popover warna,
   dropdown mood, toast. (Menu kecepatan sudah dihapus di B2, lihat K-11.)
2. Tidak ada teks yang "hilang" (putih di atas putih / hitam di atas hitam).
3. Kontras: teks utama & teks di tombol aksen minimal 4.5:1.
4. Fokus keyboard (Tab) terlihat cincin biru 2px. Cincin **hanya muncul saat navigasi
   keyboard**, tidak saat klik mouse. Pengecualian: input nama proyek (tanda fokusnya latar +
   kursor ketik, DESIGN.md bagian 8).
5. Radius sesuai tabel DESIGN.md bagian 5, termasuk aturan sudut bersarang.
6. Ganti tema saat modal/popover terbuka → ikut berganti tanpa kedip.
7. **Mode terang saat OS gelap** (U-7): pilih mode terang di Monotion → semua tetap terang.
8. Background karakter (warna pilihan user) **tidak** ikut berubah saat ganti tema.
9. `prefers-reduced-motion` aktif → modal/popover hanya fade, tanpa skala/geser.

**Hasil tes otomatis (`npm run test:e2e`):**

| Cek | File tes | Hasil |
|---|---|---|
| 1. Semua layar | `screenshot.spec.js`: utama, color picker, jendela Export × terang/gelap di `docs/reference/fase-2/` | Lulus. Dropdown mood & toast tidak difoto (dicek mata) |
| 2–3. Kontras | `kontras.spec.js`: teks utama 14–19:1, tombol Export 4.86:1, link Reset 5.00:1 (terang) / 5.12:1 (gelap) | Lulus |
| 4. Fokus keyboard | `keyboard.spec.js`: semua elemen di urutan Tab punya cincin biru ≥ 2px; Tab & Shift+Tab tidak keluar dari jendela Export | Lulus setelah perbaikan (temuan 1) |
| 5. Radius | `popover.spec.js`: semua popover 12px, isi popover lebih kecil (sudut bersarang) | Lulus setelah perbaikan (temuan 4). Radius panel, tombol & modal dicek mata |
| 6. Ganti tema saat modal/popover terbuka | Tidak dites otomatis: tombol tema ada di belakang modal, dan klik di luar menutup popover | Cek mata |
| 7. OS gelap + Monotion terang | `emulasi.spec.js` (juga setelah refresh) | Lulus |
| 8. Background karakter | `emulasi.spec.js` (`#FFFFFF` & `#EF4444`, gelap → terang → gelap) | Lulus |
| 9. Reduced-motion | `emulasi.spec.js`: tanpa skala/geser, modal & popover tetap fade; pembanding tanpa reduced-motion 0.95 / 0.97 | Lulus setelah perbaikan (temuan 2) |
| Fitur A2–A6 | `fitur.spec.js`, `export.spec.js`: undo color picker = 1 langkah, refresh menyimpan pengaturan, nama file `kopi-pagi`, GIF/WebM/SVG × background/transparan (cek piksel pojok), klik Export dua kali = 1 file | Lulus |

**Temuan B3 (semua sudah diperbaiki):**

| # | Temuan | Perbaikan |
|---|---|---|
| 1 | Tombol Reset (Background & Color) `<button>` biasa, cincin fokus bawaan browser | `Button` HeroUI + class `link-button` di `globals.css` |
| 2 | Jendela Export muncul seketika saat reduced-motion (HeroUI mematikan semua animasi modal dengan selector yang lebih kuat) | Aturan fade dipindah ke `@layer utilities` di `globals.css` |
| 3 | Popover color picker berlatar `surface`, beda dengan dropdown mood | Class `bg-surface` dibuang; semua popover `surface-raised` |
| 4 | Isian di dalam popover menyatu dengan latar popover; sudut popover color picker 16px | Aturan umum "isian di dalam popover = `surface`"; popover 12px, isi 8px |
| 5 | Popover color picker melompat 5px setelah klik preset (patokan posisi pindah ke tombol acak) | Patokan dikunci ke kolom warna (`triggerRef`), jarak tetap 8px (`offset`) |
| 6 | Kolom hex di popover: jarak kiri 21px & kotak→teks 4px (padding dobel) | Sama dengan kolom sidebar: 13px & 12px |

**Selesai kalau:** semua cek lulus di kedua mode, dan screenshot terang + gelap tiap layar
disimpan di `docs/reference/fase-2/` sebagai bukti. ✔ Tercapai.

---

## 4. Library

**Tidak ada library baru untuk aplikasi.** Satu-satunya tambahan adalah alat tes `@playwright/test` (devDependency, tidak ikut ke website), disetujui user untuk B3. Semua kebutuhan lain sudah tersedia:

| Kebutuhan | Pakai |
|---|---|
| Undo per geseran warna | `onChangeEnd` di `ColorArea`/`ColorSlider` HeroUI (React Aria) |
| Riwayat | `useState`/`useReducer` bawaan React |
| Simpan pengaturan | `localStorage` bawaan browser |
| GIF transparan | Opsi `transparent` di `gif.js` |
| WebM transparan | `VideoEncoder` VP9 dua kali (warna + alpha) + penjahit sendiri `src/lib/webmAlphaMuxer.js`. Opsi alpha `VideoEncoder` belum didukung Chrome dan `webm-muxer` tidak bisa menulis lapisan alpha (lihat catatan temuan A4) |
| Tes otomatis | `node --test` bawaan Node 24 (rumus, `npm test`) + `@playwright/test` (tes browser B3, `npm run test:e2e`, batas 60 detik per tes & 10 menit total) |
| Tebal ikon global | `LucideProvider` dari `lucide-react` |
| Komponen UI | HeroUI v3 (Select, ToggleButtonGroup, Modal, Toast, Dropdown, Slider, ProgressBar, Tooltip) |

---

## 5. Keputusan

### 5.1 Sudah diputuskan

| # | Pertanyaan | Keputusan | Dipakai di |
|---|---|---|---|
| K-1 | Background default karakter | **`#FFFFFF`**. Beda dengan token `bg-app` (`#F5F5F7`) di DESIGN.md yang khusus latar UI; jangan tertukar | A2 |
| K-2 | Nama proyek | Dipakai sebagai **nama file export**: huruf kecil, spasi jadi `-`. Placeholder **"Untitled"**. Kalau kosong, nama file = nama karakter + mood | A2, B2 |
| K-3 | Export SVG dan background | **Ikut aturan yang sama dengan GIF/WebM**: ada warna background kalau tidak dihapus, transparan kalau dihapus | A4 |
| K-4 | Papan catur untuk Remove Background | **Diubah di B2: tidak pakai papan catur.** Saat Remove Background menyala, area karakter transparan dan pola titik kanvas terlihat (seperti sebelum A4). Token `--checker-a`/`--checker-b` dan class `.bg-checkerboard` dihapus dari `globals.css`, aturannya dihapus dari DESIGN.md bagian 3. Export transparan tidak berubah. *(Keputusan awal di A4: papan catur kotak 8px, terang `surface` + `surface-hover`, gelap `surface-raised` + `surface-hover`.)* | A4, B1, B2 |
| K-5 | Batas riwayat undo | **100 langkah**; yang paling lama dibuang | A3 |
| K-6 | Bentrok nama radius | **Nilai piksel ikut DESIGN.md.** Cara pemetaan ke nama HeroUI diusulkan saat B1, diputuskan user | B1 |
| K-7 | Kartu karakter | **Coba `ToggleButton` HeroUI dulu.** Kalau harus buatan sendiri, jelaskan alasannya dulu dan tunggu izin | B2 |
| K-8 | Hapus `tailwind.config.js` | **Ya**, di B1 setelah font pindah ke CSS, dan setelah minta izin | B1 |
| K-9 | Simbol terlarang (`/ \ : * ? " < > \|`) & emoji di nama file | **Diganti strip** (bukan dibuang), strip berurutan digabung, strip di awal/akhir dibuang. Kalau hasilnya kosong → nama karakter + mood. Contoh: `"Kopi/Pagi?"` → `kopi-pagi.gif` | A2, A6 |
| K-10 | Nama proyek dan undo/penyimpanan | **Tidak ikut undo/redo**, tapi **ikut disimpan di browser** | A2, A5 |
| K-11 | Menu kecepatan (0.5x–2x) di player bar | **Dihapus.** Temuan di B2: kecepatan hanya mempercepat penghitung player bar, karakter tidak ikut karena saat play karakter memakai animasi bawaannya sendiri. Tombol yang tidak berfungsi dilarang DESIGN.md bagian 9. Ide penggantinya (kecepatan yang ikut export) **dibatalkan di Fase 3**: tidak ada pengaturan kecepatan | B2 |
| — | Bug "klik karakter yang sudah dipilih mereset warna" (M-2) | Masuk **A2** | A2 |

Semua keputusan K-1 sampai K-11 sudah dijawab.

---

## 6. Catatan untuk fase berikutnya

Ide yang muncul selama Fase 2 tapi sengaja tidak dikerjakan di fase ini.

| Ide | Asal | Catatan |
|---|---|---|
| **Tombol Cancel export** | T-13 (B2) | Sekarang selama export berjalan modal terkunci (✕ & Close nonaktif) dan user harus menunggu sampai selesai. Tombol Cancel perlu cara menghentikan proses di tengah jalan di `exportUtils.js` (mis. `AbortController` dicek tiap frame), membereskan sisa proses (worker GIF, encoder WebM), lalu toast "Export canceled". Logika export belum boleh diubah di Fase 2 |
