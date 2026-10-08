# Fase 1: Sistem Karakter

Tujuan fase ini: Mochi jadi patokan, Covey dan Capybara lama dihapus, lalu Mochi
dipindahkan ke "cetakan" standar supaya karakter baru bisa dibuat dengan konsep yang sama.

Nomor baris di dokumen ini mengacu ke kode saat analisis (commit `34eb4d7`).
Setelah kode diubah, nomor baris bisa bergeser.

---

## 1. Bedah Mochi (hasil analisis)

Seluruh Mochi ada di satu file: `src/components/Characters/Mochi/MochiMaster.jsx` (±1.290 baris).

### Urutan layer (bawah ke atas)

| # | Layer | Lokasi |
|---|---|---|
| 1 | Bayangan lantai | `MochiMaster.jsx:546` |
| 2 | Glow luar (error, finished, love) | `MochiMaster.jsx:558` |
| 3 | Tangan melambai (greeting) | `MochiMaster.jsx:575` |
| 4 | Bintang (finished) | `MochiMaster.jsx:603`, fungsi di `:917` |
| 5 | Badan superellipse | `MochiMaster.jsx:605` (dan dobel di `:612`) |
| 6 | Pipi | `renderBlush`, `MochiMaster.jsx:643` |
| 7 | Mata | `renderEyes`, `MochiMaster.jsx:678` |
| 8 | Aksesori: beanie, santa_hat, glasses | `renderAccessories`, `MochiMaster.jsx:1048` |
| 9 | Badge pojok kiri atas | `renderBadge`, `MochiMaster.jsx:949` |
| 10 | Partikel Zzz | `renderParticles`, `MochiMaster.jsx:1248` |

Bentuk badan dibuat oleh `generateSuperellipsePath` (`MochiMaster.jsx:9`), dengan preset
`mochi` (n=2.7), `round` (n=2), `boxy` (n=4.5). Posisi mata/pipi dihitung dari ukuran
badan (proporsi), bukan angka mati (`MochiMaster.jsx:156–171`).

### Gerakan

- Badan: napas naik-turun 3,6 detik; `dancing` goyang 0,8 detik (`MochiMaster.jsx:118`);
  `greeting` tangan melambai 0,75 detik (`MochiMaster.jsx:143`).
- Kecil: kedip otomatis (`:183`), mata ikut mouse (`:203`), mata spiral dizzy (`:715`),
  Zzz, bintang, titik badge berdenyut.
- **Mode seek:** saat export/scrub, pose dihitung dari `progress` (0–1) supaya hasil
  export sama persis dengan preview (`seekBodyPose`, `MochiMaster.jsx:238`). Sinyalnya
  lewat event `"mochi-timeline-update"` (`MochiMaster.jsx:107`, `AnimationPlayerBar.jsx:56`,
  `exportUtils.js:65`). **Wajib dipertahankan.**

### Warna

- Tiap mood punya tema (gradient badan, garis tepi, glow) di `STATE_THEMES` (`MochiMaster.jsx:44`).
- Warna custom user saat ini **mengganti total** gradient mood (`MochiMaster.jsx:178`, `:400`).

### Khas Mochi vs umum

| Bagian | Status |
|---|---|
| Bentuk badan superellipse + preset | Khas |
| Proporsi (cx, cy, rx, ry, posisi mata/pipi) | Khas (angkanya), formatnya umum |
| Tangan melambai | Khas |
| Topi beanie/santa | Setengah (ukuran dipaku ke kepala Mochi, lebar 232) |
| Mesin timeline (play/pause/seek/export) | Umum |
| Gerakan napas & dancing | Umum |
| Kedip & mata ikut mouse | Umum |
| Jenis-jenis mata | Umum |
| Pipi, badge, Zzz, bintang | Umum |
| Tema warna mood & gradient custom | Umum |
| Filter & gradient (bayangan, kilau mata) | Umum |

### Daftar bug Mochi

| # | Bug | Lokasi | Dibereskan di |
|---|---|---|---|
| B-1 | Angka mood tidak konsisten: daftar asli **22**, label panel kanan **"(26)"**, data library **30** | `LeftSidebar.jsx:9`, `RightSidebar.jsx:95`, `characterLibrary.json:22` | Langkah B8 |
| B-2 | Durasi beda: MochiMaster **3600ms**, `exportUtils` **1600ms** | `MochiMaster.jsx:254`, `exportUtils.js:8` | Langkah B8 |
| B-3 | Badan digambar dua kali | `MochiMaster.jsx:605` dan `:612` | Langkah B10 |
| B-4 | Tangan greeting selalu putih (tidak ikut warna dasar) | `MochiMaster.jsx:589` | Langkah B13 |
| B-5 | Warna custom menghapus nuansa mood | `MochiMaster.jsx:178`, `:400` | Langkah B14 |
| B-6 | Sisa Covey: `config.text` tidak dipakai Mochi | `page.jsx:32` | Langkah B9 |
| B-7 | "Copy React Component" cuma placeholder, bukan kode Mochi asli | `exportUtils.js:557` | Di luar Fase 1, dievaluasi di Fase 3 (lihat 5.8) |
| B-8 | Export WebM tidak diberi durasi mood yang dipilih, jadi Greeting/Dancing ikut durasi Idle. Ditemukan saat B16. Perbaikan: `ExportModal` mengirim `animationDuration` ke `exportAsWebm`, sama seperti GIF (durasi dari registry) | `ExportModal.jsx` (case `"webm"`) | Setelah B16 |
| B-9 | Export GIF & WebM tidak diberi pengaturan background (`config`), jadi kanvas export selalu diisi `#f5f5f7` di bawah gambar karakter. Akibatnya "Remove Background" tidak menghasilkan latar transparan (jadi abu-abu muda). Ditemukan saat perbaikan B-8 | `ExportModal.jsx` (case `"gif"` & `"webm"`), `exportUtils.js` (`captureAndScaleToTarget`) | Ditunda ke Fase 2/3, perlu dites di beberapa pemutar video |

---

## 2. Jejak Covey & Capybara lama

### Cukup dihapus

- `src/components/Characters/Covey/` (5 file)
- `src/components/Characters/Capybara/` (5 file)
- `src/components/Characters/CharacterLibrary.jsx` (tidak dipakai)
- `src/data/characters/characterTemplates.json` (dimuat tapi tidak ditampilkan)

### Perlu diubah

| File | Yang diubah |
|---|---|
| `src/components/Editor/CenterWorkspace.jsx:4, 25–40` | Import Covey & cabang "bukan Mochi → Covey" |
| `src/components/Editor/LeftSidebar.jsx:4, 6, 19, 52–53` | Import Covey & coveyMoods, thumbnail Covey |
| `src/components/Editor/RightSidebar.jsx:4, 12, 114–118` | Import coveyMoods, dropdown mood Covey |
| `src/app/editor/page.jsx:67–80` | Logika "kalau Mochi / kalau bukan" |
| `src/data/characters/characterLibrary.json` | Sisakan Mochi |
| `src/hooks/useCharacterTemplates.js:9, 17` | Buang fallback Covey & templates |
| `src/components/Characters/index.js` | 100% Covey/Capybara, tidak di-import siapa pun |

### Risiko

Menghapus folder sebelum melepas import akan membuat halaman editor error total.
Urutannya: lepas rujukan dulu, baru hapus folder.

Catatan: Capybara lama sebenarnya tidak pernah tampil (yang muncul Covey, karena
`CenterWorkspace.jsx:25` cuma kenal "Mochi" atau "selain itu"), dan `Capybara/index.js:1`
salah huruf besar-kecil nama file (gagal di Linux).

---

## 3. Cetakan karakter

### 3.1 Struktur folder

```
src/characters/
├── registry.js              ← daftar semua karakter
├── _core/                   ← mesin & bagian bersama (menjaga style tetap sama)
│   ├── CharacterStage.jsx   ← kanvas: ukuran, bayangan, timeline, seek/export
│   ├── useTimeline.js       ← play/pause/seek dari player bar
│   ├── useBlink.js
│   ├── useEyeTracking.js
│   ├── motions.js           ← preset gerakan (float, dance, wave, droop, bounce)
│   │                          semuanya punya versi seek (dihitung dari progress)
│   ├── moodTint.js          ← kekuatan lapisan tipis warna mood (SATU angka)
│   ├── shapes.js            ← superellipse, spiral
│   ├── sharedDefs.jsx       ← gradient & filter umum
│   ├── MovingPart.jsx       ← pembungkus "bagian bergerak"
│   └── parts/
│       ├── Eyes.jsx
│       ├── Mouth.jsx        ← laci mulut (B18.3)
│       ├── Brows.jsx        ← laci alis & kerutan dahi (B18.5)
│       ├── Blush.jsx
│       ├── Badge.jsx
│       ├── Particles.jsx    ← Zzz, bintang, tanda marah, kilau; ditempel ke titik tempel
│       └── accessories/     ← Beanie, SantaHat, Glasses (menyesuaikan lebar kepala)
├── mochi/
│   ├── index.js
│   ├── mochi.config.js
│   ├── mochi.moods.js
│   └── MochiBody.jsx        ← badan + tangan
└── capybara/
    ├── index.js
    ├── capybara.config.js
    ├── capybara.moods.js
    └── CapybaraBody.jsx     ← badan + telinga + jeruk (menyatu dengan tubuh)
```

### 3.2 Aturan cetakan (wajib dipenuhi tiap karakter)

| Aturan | Di mana | Keputusan |
|---|---|---|
| Punya `defaultMood` | `*.config.js` | 5.3 |
| Punya `defaultColor` (warna dasar awal) | `*.config.js` | 5.3 |
| Tiap bagian badan ditandai `paint: "base"` (ikut warna dasar), `paint: "derived"` (turunan warna dasar, mulai B18.1), atau `paint: "fixed"` (warna tetap) | `*.config.js` → `parts` | 5.2, 5.11 |
| Bagian yang bisa dianimasikan sendiri ditandai `moving: true` + titik putar (`origin`) | `*.config.js` → `parts` | 5.7 |
| Punya titik tempel kepala: `hat`, `face`, `zzz`, `stars`, `badge`. Titik `mouth` (B18.3), `anger` & `twinkle` (B18.6) hanya wajib kalau ada mood yang memakainya | `*.config.js` → `anchors` | 5.4 |
| Punya daftar aksesori yang diizinkan | `*.config.js` → `allowedAccessories` | 5.4 |
| Semua mood ada di satu file; jumlah mood dihitung dari file ini | `*.moods.js` | 5.1 |
| Gerakan bagian bergerak disebut per mood, pakai preset dari `_core/motions.js` | `*.moods.js` | 5.7 |
| Tidak boleh menentukan kekuatan lapisan tipis sendiri | — (diatur `_core`) | 5.6 |

Angka posisi (`origin`, `anchors`) ditulis **relatif ke ukuran badan** (0 = tengah,
±1 = tepi), sama seperti cara Mochi menghitung posisi mata sekarang.

### 3.3 Urutan lapisan warna (sama untuk semua karakter)

```
1. Warna dasar user        → bagian ber-paint "base", dan bagian ber-paint
                             "derived" (dihitung dari warna dasar, lihat 5.11)
2. Warna tetap             → bagian ber-paint "fixed" (daun, mata, pipi, dll)
3. Lapisan tipis mood      → menimpa badan, garis tepi, DAN elemen,
                             opacity = MOOD_TINT_OPACITY dari _core
4. Glow mood               → di luar badan
```

Contoh isi `_core/moodTint.js`:

```js
// Satu angka untuk semua karakter. Mengubahnya = semua karakter ikut berubah.
export const MOOD_TINT_OPACITY = 0.12; // B14 memakai 0.3, diturunkan saat koreksi B18.3–B18.4

export const MOOD_TINTS = {
  red:  "#EF4444",
  pink: "#F43F5E",
  teal: "#10B981",
  // ...
};
```

Karena lapisan mood ada **di atas** warna dasar, memilih warna sendiri tidak lagi
menghapus nuansa mood (bug B-5).

### 3.4 Contoh: Mochi

`mochi.config.js`

```js
export const mochiConfig = {
  id: "mochi",
  name: "Mochi",
  defaultColor: "#FFFFFF",
  defaultMood: "idle",
  shapePresets: ["mochi", "round", "boxy"],

  anatomy: { rx: 1.14, ry: 0.88, eyeSpacing: 0.37, blushSpacing: 0.52 },

  parts: {
    body: { paint: "base" },
    arm:  { paint: "base", moving: true, origin: { x: 0.80, y: 0.02 } }, // tangan ikut warna dasar (bug B-4)
  },

  anchors: {            // titik tempel, relatif ke badan
    hat:   { x: 0,     y: -0.33 },
    face:  { x: 0,     y: -0.02 },
    zzz:   { x: 0.65,  y: -0.45 },
    stars: { x: 0,     y: -0.20 },
    badge: { x: -0.96, y: -1.00 },
  },

  allowedAccessories: ["beanie", "santa_hat", "glasses"],
};
```

`mochi.moods.js` (cuplikan, totalnya 22)

```js
export const mochiMoods = [
  { id: "idle",     label: "Idle",     motion: "float", eyes: "round" },
  { id: "greeting", label: "Greeting", motion: "float", eyes: "round",
    parts: { arm: "wave" } },                       // bagian bergerak
  { id: "error",    label: "Error",    motion: "float", eyes: "angry",
    tint: "red",  glow: "red",  badge: "exclamation" },
  { id: "love",     label: "Love",     motion: "float", eyes: "hearts",
    tint: "pink", glow: "pink", blush: "hearts", badge: "heart" },
  { id: "sleeping", label: "Sleeping", motion: "float", eyes: "sleepy",
    blush: "none", particles: "zzz" },
  { id: "beanie",   label: "Beanie",   motion: "float", eyes: "round",
    accessory: "beanie" },                          // harus ada di allowedAccessories
  // ... 16 mood lainnya
];
```

### 3.5 Contoh: Capybara (versi sederhana, 3 mood)

`capybara.config.js`

```js
export const capybaraConfig = {
  id: "capybara",
  name: "Capybara",
  defaultColor: "#C68A4E",
  defaultMood: "idle",

  parts: {
    body:   { paint: "base" },
    earL:   { paint: "derived", shade: -0.18, moving: true, origin: { x: -0.53, y: -0.55 } },
    earR:   { paint: "derived", shade: -0.18, moving: true, origin: { x:  0.53, y: -0.55 } },
    earInner: { paint: "derived", shade: -0.3 },
    snout:  { paint: "derived", shade: -0.22 },
    orange: { paint: "derived", shade: 0.25 },  // jeruk: turunan warna dasar, TIDAK bergerak sendiri (5.14)
    stem:   { paint: "fixed" },
    leaf:   { paint: "fixed" },
  },

  anchors: {            // kepala lebih tinggi karena ada jeruk
    hat:   { x: 0,     y: -0.55 },
    face:  { x: 0,     y: -0.05 },
    zzz:   { x: 1.058, y: -0.667 }, // tengah Z besar (B18.6)
    stars: { x: 0,     y: -0.45 },
    badge: { x: -0.90, y: -0.95 },
    mouth: { x: 0,     y: 0.151 },  // pangkal mulut, di bawah hidung (B18.3)
    anger: { x: 0.594, y: -0.557 }, // pusat tanda marah di dahi (B18.6)
    twinkle: { x: 0,   y: -0.379 }, // tengah sebaran kilau (B18.6)
  },

  allowedAccessories: ["glasses"],  // topi bentrok dengan jeruk
};
```

`capybara.moods.js`

```js
export const capybaraMoods = [
  { id: "idle",     label: "Idle",     motion: "float", eyes: "iris", mouth: "w", blush: "none" },
  { id: "sleeping", label: "Sleeping", motion: "float", eyes: "closed", mouth: "w-small",
    blush: "none", particles: "zzz-bold", parts: { earL: "droop", earR: "droop" } },
  { id: "love",     label: "Love",     motion: "float", eyes: "iris-heart", mouth: "w-wide",
    blush: "none", tint: "pink", glow: "pink" },              // tanpa badge, hati hanya di mata
  { id: "annoyed",  label: "Annoyed",  motion: "float", eyes: "heavy", brows: "angry",
    mouth: "frown", blush: "none", tint: "red", particles: "anger" }, // dimajukan ke B18.5
];
```

Telinga dan jeruk digambar di `CapybaraBody.jsx` (menyatu dengan tubuh), **bukan** sebagai aksesori.
Jeruk selalu menempel di kepala dan ikut gerak badan di semua mood; hanya telinga
yang boleh bergerak sendiri (5.14).

> Catatan: gerakan telinga (`droop`) dan daftar aksesori Capybara di atas
> masih **contoh**. Nilai finalnya mengikuti gambar referensi (5.13).

---

## 4. Urutan langkah

### 4.1 Tes wajib di setiap langkah Bagian B

1. **Preview jalan:** Mochi tampil dan bergerak seperti sebelumnya.
2. **Export GIF sekali.**
3. **Hasil export sama dengan preview:** mode seek tidak boleh rusak.

### 4.2 Bagian A: hapus Covey & Capybara lama

> Langkah A1–A3 digabung jadi **satu sesi**.

| Langkah | Pekerjaan |
|---|---|
| A1 | Lepas Covey dari `CenterWorkspace.jsx` |
| A2 | Lepas Covey dari `LeftSidebar.jsx` dan `RightSidebar.jsx` |
| A3 | Rapikan `page.jsx` (buang cabang "kalau bukan Mochi") |
| A4 | Rapikan `characterLibrary.json` & `useCharacterTemplates.js` |
| A5 | Hapus folder & file lama (jelaskan dulu, minta izin) |
| A6 | Cek build & editor |

### 4.3 Bagian B: pindahkan Mochi ke cetakan

| Langkah | Pekerjaan | Keputusan / bug |
|---|---|---|
| B7 | Pindahkan `MochiMaster.jsx` ke `src/characters/mochi/` **tanpa ubah isi** | — |
| B8 | Buat `mochi.moods.js` (22 mood) sebagai sumber tunggal: dropdown, label jumlah mood, dan durasi (MochiMaster & `exportUtils`) semua membaca dari sini | 5.1, B-1, B-2 |
| B9 | Buat `mochi.config.js` (`defaultColor`, `defaultMood`, `shapePresets`, `anatomy`). Editor pindah ke mood default kalau mood tidak ada di karakter. Buang `config.text` | 5.3, B-6 |
| B10 | Pisahkan rumus bentuk ke `_core/shapes.js`, hapus badan dobel | B-3 |
| B11 | Pisahkan mesin gerak ke `_core/` (timeline, kedip, mata ikut mouse, preset `motions.js` + versi seek-nya). Ganti `"mochi-timeline-update"` jadi nama umum | 5.7 (dasar seek) |
| B12 | Pisahkan bagian tubuh umum ke `_core/parts/`, satu per satu: Eyes → Blush → Badge → Particles | 5.3 |
| B13 | Buat `MochiBody.jsx` + penanda `paint` base/fixed + `MovingPart` untuk tangan (gerakan `wave`, ikut mode seek). Tangan ikut warna dasar | 5.2, 5.7, B-4 |
| B14 | Lapisan tipis warna mood + glow di `_core/moodTint.js`. Warna dasar tidak lagi menghapus nuansa mood. **Tes tambahan:** mood error & love × warna putih, hitam, satu warna terang | 5.6, B-5 |
| B15 | Titik tempel (`anchors`) + `allowedAccessories`: aksesori, Zzz, bintang, badge membaca titik tempel; aksesori pindah ke `_core/parts/accessories/` dan menyesuaikan lebar kepala | 5.4 |
| B16 | Buat `registry.js` (daftar karakter ditulis manual, satu baris per karakter); editor membaca karakter dari registry; hapus semua `if (mochi)`; buang `characterLibrary.json` | 5.1, 5.3, 5.9 |
| B17 | **Tes akhir:** buat Capybara sederhana 3 mood (contoh 3.5) dengan **menambah satu folder `src/characters/capybara/` + satu baris di `registry.js`**, tanpa mengubah kode editor. **Status: fungsi lulus, desain dilanjutkan di B18 dan Fase 4** | 5.5, 5.9 |

### 4.4 Langkah B18: lengkapi cetakan

Hasil perbandingan cetakan dengan gambar referensi `docs/reference/capybara-moods.jpg`
(15 mood). Gambar hanya acuan bentuk, ekspresi, dan susunan; gayanya mengikuti 5.10.

**Celah yang ditemukan**

| Level | Celah |
|---|---|
| Belum ada wadahnya (perlu sistem baru) | Mulut terpisah (sekarang mulut menempel di mata `yawn`, `angry`, `surprised`); alis + kerutan dahi; warna turunan (5.11); badan berubah bentuk per mood (Capybara juga belum membaca `motion` dari mood); kepala kubah (superellipse simetris atas-bawah, kepala referensi atasnya lebih sempit) |
| Wadah ada, gambarnya belum | Mata cokelat besar + kilau bintang; mata putih besar + titik pupil; mata setengah tertutup; mata hati masih emoji; wink mata kanan; partikel pusaran, tanda marah, hati melayang, kilau diam berkelip (butuh titik tempel baru); air liur (jadi bagian mulut menguap); ~~pipi pink padat~~ (tidak dipakai, lihat 5.15) |
| Sudah bisa | Mata `sleepy`, `dizzy`, `flat`, `wink`; Zzz; glow & lapisan tipis mood; telinga layu; ~~jeruk melompat~~ (dihapus, lihat 5.14) |

Laci baru (mulut, alis, mata, partikel) ditaruh di `_core` supaya bisa dipakai semua
karakter (5.3). B18 hanya mengisi varian yang dibutuhkan 5 mood uji; varian lainnya
dicicil di Fase 4.

**Mood uji (5):** idle, annoyed, proud (baru) + sleeping, love (lama). Mata hati di love
semula boleh tetap emoji dan diganti di Fase 4, tapi **dimajukan** atas permintaan user
(koreksi 2): love memakai mata `iris-heart`, yaitu mata idle persis + hati pink di atas
iris. Mata lingkaran merah + emoji (`hearts`) tidak dipakai Capybara lagi (masih dipakai
Mochi), dan `anatomy.heartIconSize` Capybara dihapus.

**Sumber bentuk & warna:** gambar referensi per mood di `docs/reference/capybara/`
(potongan `capybara-moods.jpg`). Tidak ada SVG Figma; semua bentuk dibuat dari gambar
referensi dan dicek dengan halaman pembanding (B18.0). Lihat 5.13.

| Langkah | Pekerjaan | Untuk mood | Keputusan |
|---|---|---|---|
| B18.0 | **Alat pembanding:** (1) `capybara-moods.jpg` dipotong jadi 15 gambar per mood tanpa tulisan label di `docs/reference/capybara/<mood>.png` (semua 563 × 498 piksel, posisi karakter seragam). (2) Halaman alat kerja `/alat/pembanding` (`src/app/alat/pembanding/`): pilih mood, mode tumpuk dengan slider opacity referensi 0–100%, mode berdampingan, slider geser & ukuran referensi untuk menyejajarkan dengan karakter (tersimpan di browser), dan tombol bekukan gerakan. Mood yang belum ada di kode hanya menampilkan referensi. **Bukan untuk user:** sudah otomatis 404 di build produksi, dan **wajib dihapus sebelum rilis (Fase 5)** | semua | 5.13 |
| B18.1 | **Warna turunan:** jenis cat `paint: "derived"` di config + rumus "lebih gelap/terang dari warna dasar", otomatis balik arah kalau warna dasar sangat terang/gelap. Moncong, dalam telinga, dan jeruk pindah ke sini; daun tetap hijau. `defaultColor` Capybara diganti oranye (diambil dari gambar referensi, 5.13) | semua | 5.11 |
| B18.1b | **Bayangan badan dari warna dasar:** ujung gelap gradient badan memakai versi gelap warna dasar itu sendiri (rumus B18.1, `getBodyShadowColor` di `_core/derivedColor.js`), menggantikan abu `#475569`. Berlaku untuk Mochi dan Capybara. Gradient bawaan Mochi (putih, warna belum diganti) tidak berubah | semua | 5.11, 5.12 |
| B18.2 | **Kepala kubah:** bentuk badan baru di `_core/shapes.js`, telinga & moncong digambar ulang, halus bergradient tanpa bulu. **Tidak menunggu SVG Figma lagi:** bentuk dibuat dari gambar referensi (`docs/reference/capybara/`) dan dicek dengan halaman pembanding (B18.0) sampai semirip mungkin. **Status: selesai, disetujui user.** Angka final ada di daftar "Bentuk yang sudah disetujui" di bawah tabel ini | semua | 5.10, 5.13 |
| B18.3 | **Laci mulut:** `_core/parts/Mouth.jsx` + titik tempel `mouth` + kunci `mouth` di daftar mood. Isi awal: `w` (ω), `frown` (cemberut), `smirk` (senyum puas). **Status: selesai, disetujui user.** Catatan di bawah tabel | idle, annoyed, proud | 5.3 |
| B18.4 | **Mata baru:** `iris` (cokelat besar + kilau), setengah tertutup `heavy` (kesal) dan `smug` (melirik). Tetap ikut mouse & bisa kedip. **Status: selesai, disetujui user** (termasuk mata love `iris-heart` dan mata tidur `closed` yang ditambahkan saat koreksi). Catatan di bawah tabel | idle, annoyed, proud | 5.3 |
| B18.5 | **Laci alis:** `_core/parts/Brows.jsx`. Isi: `angry` (kerutan dahi). `smug` **tidak dibuat**: referensi proud tidak punya alis maupun kerutan. **Status: selesai, disetujui user.** Catatan di bawah tabel | annoyed | 5.3 |
| B18.6 | **Partikel baru:** `anger` (tanda marah) dan `twinkle` (kilau diam berkelip) + titik tempel barunya (`anger`, `twinkle`). Wajib ikut mode seek. Sekalian: Zzz Capybara dirapikan jadi `zzz-bold` (lebih besar, tebal, mauve kecokelatan seperti referensi sleeping). **Status: selesai, disetujui user** (`twinkle` dicek ulang setelah proud dipasang). Catatan di bawah tabel | annoyed, proud, sleeping | 5.4, 5.7 |
| B18.7 | **Pose badan per mood:** kunci `pose` di mood (contoh proud: badan sedikit melebar/gepeng, kepala mendongak). Capybara membaca `motion` dari mood. Wajib ikut mode seek | proud | 5.7 |
| B18.8 | **Pasang mood** idle, annoyed, proud di `capybara.moods.js` (sleeping & love tetap). **Urutan diubah:** idle (mata `iris` + mulut `w`) sudah dipasang lebih awal, tepat setelah B18.4, dan annoyed (mata `heavy`, alis `angry`, mulut `frown`, partikel `anger`) **sudah terpasang** di B18.5, supaya bagian barunya bisa dicek di halaman pembanding. Tinggal proud yang dipasang di langkah ini (menunggu B18.7). **Status: idle & annoyed terpasang, proud belum** | — | 5.1 |
| B18.9 | **Tes akhir:** 5 mood × warna dasar putih, hitam, oranye, satu warna terang. Jeruk selalu terbedakan dari kepala. Export GIF/WebM sama dengan preview. Mochi tidak berubah | — | 5.10, 5.11 |

Setiap langkah tetap memakai tes wajib 4.1.

**Catatan B18.3 & B18.4 (hasil ukur)**

B18.3 & B18.4 sudah disetujui user. Bentuk yang sudah tampil di mood terpasang (idle,
sleeping, love) masuk daftar "Bentuk yang sudah disetujui": mata `iris`, mata `iris-heart`,
mata `closed`, mulut `w`, `w-small`, `w-wide`. Mata `heavy`/`smug` dan mulut `frown`/`smirk`
baru dicek lewat render sementara; angkanya dicek ulang di halaman pembanding saat annoyed
& proud dipasang (B18.8), lalu ditambahkan ke daftar.

Semua angka diukur dari `docs/reference/capybara/` (idle, annoyed, proud, sleeping, love) dengan
membaca piksel gambar, lalu diubah ke satuan kode (1 piksel referensi = 0.52 piksel
kanvas, sesuai posisi bawaan halaman pembanding).

- **Mulut** (`_core/parts/Mouth.jsx`): semua mulut = garis tengah dari hidung turun +
  lengkung. Satuan = setengah lebar mulut ω idle (`anatomy.mouthSize` 0.246 × `rx`),
  titik tempel `mouth` (0, 0.151). Warna `#47100A`, tebal garis 0.19 satuan (koreksi 1:
  semula 0.14; diukur di render kode & referensi dengan cara yang sama, garis referensi
  10 piksel vs kode 7).
  - `w` (idle): dua lengkung potongan lingkaran (pusat ±0.474, 0.352; jari-jari 0.734),
    garis tengah 0.912. Selisih dengan referensi ≤ 2 piksel referensi.
  - `frown` (annoyed): satu lengkung Bezier, ujung (±0.572, 0.94), titik kendali
    (±0.24, 0.516), garis tengah 0.453 (tidak menyentuh lengkung). Lengkung lingkaran
    tidak cocok (ujung referensi lebih menukik).
  - `w-small` (sleeping): ω kecil & sangat datar (pusat ±0.257, 0.525; jari-jari 0.685;
    ujung 0.514), garis tengah panjang 1.16.
  - `w-wide` (love, koreksi 2): ω lebih lebar dengan ujung naik tinggi seperti tersenyum
    (pusat ±0.508, 0.095; jari-jari 0.664; ujung 1.085, idle 0.92), garis tengah 0.523.
    Lengkung referensi pas dengan lingkaran (selisih ≤ 0.6 piksel referensi).
  - `smirk` (proud): ω lebih lebar dengan sudut lebih naik (pusat ±0.499, 0.076;
    jari-jari 0.709), garis tengah lebih pendek 0.58. Kepala di referensi proud
    mendongak (pose B18.7), jadi posisinya dicek lagi setelah B18.7.
- **Mata** (`_core/parts/Eyes.jsx`, jenis `iris`, `heavy`, `smug`): angka bentuk dikali
  jari-jari mata (`anatomy.eyeSize` 0.196 × `rx`). Putih mata tampak di sisi luar, kilau
  bulat di sisi dalam-atas, kilau bintang di sisi luar-bawah (dicerminkan kiri-kanan).
  Isi mata ikut mouse 0.6× supaya iris tidak keluar dari mata. Saat kedip, mata besar
  jadi lengkung kelopak selebar mata.
  - `heavy`: separuh atas tertutup, garis kelopak tebal miring 10° (sisi dalam lebih rendah).
  - `smug`: separuh bawah tertutup, garis potong miring 16°, kelopak atas tebal, iris
    memenuhi mata, kilau bergeser ke kanan (melirik).
  - `closed` (sleeping): mata terpejam, warna `#47100A` sama dengan mulut. **Koreksi 2:**
    bentuk pisang (ujung setengah lingkaran) diganti satu lengkung tebal yang mulus seperti
    sapuan kuas: garis tengah Bezier kuadrat, tebal = 0.34 × sin(posisi)^0.5 (rata di
    tengah, meruncing halus ke ujung), dihitung 64 titik. Angka (dikali jari-jari mata,
    dari tengah mata terbuka): setengah lebar 0.92, tinggi ujung 0.325, titik terendah
    0.755. Ditambah **2 bulu mata** di ujung luar atas permintaan user (di referensi tidak
    ada): di posisi 10% & 20% dari ujung luar, panjang 0.2, tebal 0.09, condong ke luar.
  - `iris-heart` (love, koreksi 2): frame salinan persis `iris` (kelopak & bola mata) + hati
    pink di atas iris. **Koreksi 3:** semua kilau putih (lingkaran besar & bintang kecil)
    dihapus khusus untuk mata love (`shine: null, sparkle: null`); mata idle tetap berkilau.
    Hati diukur dari referensi love: setengah lebar 0.66, puncak −0.48, lekukan −0.33,
    terlebar −0.14, ujung bawah 0.61, geser ke dalam 0.04. Warna gradient atas → bawah
    `#FE7E97` → `#EF6886` → `#DF4851` → `#C83D42`. Iris gelap tetap terlihat sebagai
    cincin di sekeliling hati, seperti di referensi.
- **Koreksi 1 (idle):** `eyeSize` 0.196 → 0.203 (jari-jari referensi 43.4 piksel, kode
  42.0; dicocokkan lingkaran ke 60+ titik tepi mata), `face` y −0.181 → −0.183, kelopak
  atas `iris` `lidTop` 0.08 → 0.11 (tebal total di puncak 0.19, referensi 8 dari 43.4
  piksel). Lebar & tinggi mulut ω tidak diubah: diukur di skala yang sama, ujung kiri-kanan
  dan dasar lengkung kode sudah sama dengan referensi (selisih ≤ 2 piksel).
- **Pipi padat `solid`** (`_core/parts/Blush.jsx`) sempat dimajukan dari Fase 4 dan dicoba
  di semua mood Capybara, lalu **diputuskan tidak dipakai** (keputusan 5.15). Mochi tetap
  memakai pipi `soft`. Varian `solid` dan angkanya masih ada di kode tapi tidak dipakai
  mood mana pun. Diukur dari
  referensi idle, annoyed, sleeping, love (hasilnya konsisten): oval ±72 × 54 piksel
  referensi, pusat ±152 piksel dari tengah kepala. Angka di `capybara.config.js` →
  `anatomy`: `blushSpacing` 0.6 → 0.705 (× `rx`), `blushY` baru 0.216 (× `ry`, semula
  0.12 tertulis langsung di `CapybaraMaster.jsx`), `blush` { `rx` 0.167, `ry` 0.125 }
  (× `rx`). Warna gradient bulat (terang di kiri atas) `#F7918D` → `#E28081` → `#D25E5F`.
  Semua mood Capybara memakai `blush: "none"`.
- **Posisi mata Capybara ikut berubah untuk semua mood** (termasuk sleeping & love):
  `eyeSpacing` 0.4 → 0.55 dan titik tempel `face` y −0.2 → −0.181. Jarak mata di semua
  gambar referensi (idle, annoyed, sleeping) sama lebarnya, jadi angka lama memang
  terlalu rapat.

**Catatan B18.5 & B18.6 (hasil ukur)**

B18.5 & B18.6 sudah disetujui user. Alis/kerutan dahi `angry`, tanda marah `anger`, dan Zzz
`zzz-bold` masuk daftar "Bentuk yang sudah disetujui". Kilau `twinkle` belum masuk daftar karena
baru bisa dilihat di halaman pembanding setelah mood proud dipasang (B18.7–B18.8). Mood annoyed
sudah terpasang (dimajukan dari B18.8); mata `heavy` & mulut `frown`-nya belum masuk daftar.

Posisi kepala di tiap gambar referensi sedikit beda (idle ±30 piksel lebih ke
kanan dari annoyed & sleeping), jadi semua angka diukur **relatif ke titik tengah lubang
hidung** di gambar itu sendiri, lalu diubah ke satuan kode (sama seperti sebelumnya: 1 piksel
referensi = 0.52 piksel kanvas, `rx` = 215.6 piksel referensi, `ry` = 175.9). Hasilnya
dicek dengan render kode yang ditumpuk di atas referensi.

- **Alis `angry`** (`_core/parts/Brows.jsx`, mood annoyed): di referensi **tidak ada garis
  alis terpisah**. Kelopak atas tebal mata `heavy` sudah berperan sebagai alis. Yang tampil
  di dahi hanya **kerutan**: alur gelap miring di atas sudut dalam mata + tepi terang di sisi
  atasnya. Angka (dikali jari-jari mata, x positif = ke arah hidung, dari tengah mata):
  dari (0.87, −0.69) ke (1.49, −0.18), tebal 0.18 di tengah & meruncing ke ujung
  (sin^0.6), warna turunan warna dasar `shade` −0.4 (opacity 0.85), tepi terang `shade`
  +0.12 digeser 0.14 ke atas (tebal 0.1, opacity 0.6), blur 0.7. Kerutan kiri & kanan di
  referensi sama posisinya (kanan lebih samar karena cahaya); kode dibuat simetris.
- **Alis `smug` tidak dibuat:** referensi proud tidak punya alis maupun kerutan. Kalau
  nanti tetap mau ada alis, perlu keputusan desain baru (bukan dari referensi).
- **Tanda marah `anger`** (`_core/parts/Particles.jsx`): 4 lengkung tebal yang cembung ke
  arah tengah, di dahi kanan atas. Titik tempel `anger` (0.594, −0.557). Tiap lengkung 4 titik
  (dikali `rx`, dari pusat tanda) digambar sebagai garis halus. Tebal 0.04 `rx`, warna
  `#6E160B` + kilap tipis `#A04A3A` di sisi atas (referensi agak timbul). Berdenyut 2× per
  putaran (membesar 12%).
- **Kilau `twinkle`** (proud): 4 bintang 4 sudut gemuk berujung bulat, gradient
  `#FFD48C` → `#F6B562`, cahaya hangat `#FFDDA6` di sekelilingnya. Titik tempel `twinkle`
  (0, −0.379). Bintang (dx × `rx`, dy × `ry`, ukuran × `rx`): kiri besar (−0.962, −0.127,
  0.095), kiri bawah (−1.069, 0.098, 0.076, di referensi sedang redup), kanan atas
  (0.939, −0.084, 0.05), kanan bawah (1.046, 0.115, 0.07). Diam di tempat, berkelip 2× per
  putaran (paling redup: 70% ukuran, opacity 0.18), tiap bintang beda waktu. Dicek dengan
  render percobaan karena mood proud belum dipasang (menunggu B18.7); posisinya mungkin
  perlu dicek ulang setelah pose proud selesai.
- **Zzz `zzz-bold`** (sleeping): Z besar + z kecil (referensi hanya 2 huruf), garis tebal
  berujung bulat, gradient mauve kecokelatan `#CBA3A8` → `#B07F86`. Titik tempel `zzz`
  pindah ke tengah Z besar (1.058, −0.667). Tebal Z besar 0.044 `rx`, z kecil 0.032 `rx`.
  Naik-turun pelan bergantian. Zzz lama (`zzz`, ungu, huruf teks) tetap dipakai Mochi.
- **Mode seek:** `zzz-bold`, `anger`, `twinkle` tidak memakai animasi framer-motion sama
  sekali. Posisi, ukuran, dan kecerahannya dihitung langsung dari `progress` di setiap
  frame, jadi export pasti sama dengan preview. Di `progress` 0 (pose awal, halaman
  pembanding beku) bentuknya sama dengan gambar referensi.
- `<Particles>` sekarang menerima semua titik tempel (`points`) dan memilih titiknya sendiri
  per jenis partikel. Pemanggilan di `MochiMaster.jsx` ikut disesuaikan (hasil gambar Mochi
  tidak berubah, sudah dicek).

**Bentuk yang sudah disetujui (B18.2–B18.6)**

Bagian di bawah ini sudah dicek user di halaman pembanding dan disetujui. **Jangan
diubah tanpa diminta.** Setiap kali mengubah bentuk Capybara (termasuk mengubah rumus
bersama di `_core/shapes.js` atau `_core/derivedColor.js`), cek dulu daftar ini dan
pastikan bagian yang disetujui tidak ikut bergeser. Kalau perubahan kepala memindahkan
bagian lain (misalnya pangkal telinga), sesuaikan angkanya supaya posisinya di layar tetap.

Satuan angka: relatif ke badan (x dikali `rx`, y dikali `ry`; 0 = tengah, ±1 = tepi),
kecuali disebut lain. Kanvas 400 × 400, badan di `cx` 200, `cy` 212, `R` 95
(`CapybaraMaster.jsx`).

| Bagian | Yang disetujui | Angka final (file) |
|---|---|---|
| Kepala (kubah atas) | Tinggi ÷ lebar 0.816 seperti referensi, terlebar di sepertiga bawah, atas sedikit menyempit | `capybara.config.js` → `anatomy`: `rx` 1.18, `ry` 0.963; `head`: `widest` 0.34, `nTop` 2.2, `taper` 0.05 |
| Pipi bawah / sudut bawah kepala | Membulat seperti mangkuk/roti bun: sisi menggembung lalu melengkung lebar masuk ke dasar, dasar tengah agak rata, tanpa tekukan | `anatomy.head.bottomCurve`: `start` 0.25, `a` 0.75, `b` 0.45 (lengkung Bezier, `_core/shapes.js`). Jangan kembali ke superellipse dengan `nBottom` < 2 (titik terlebar bertekuk lancip), dan jangan kecilkan `a`/`b` untuk "membulatkan" (justru muncul sudut). Untuk lebih bulat, naikkan `start` |
| Telinga | Bentuk jempol, sedikit miring ke luar (efek menghadap samping), sabit gelap di **sisi luar**, ukuran dari hasil ukur referensi | `CapybaraBody.jsx` → `SHAPE.ear`: `height` 0.433, `tipRadius` 0.172, `sideAngle` 13, `baseLift` 0.13, `baseDepth` 0.15, `tilt` 15; `SHAPE.earInner`: `height` 0.37, `tipRadius` 0.146, `baseLift` 0.11, `baseDepth` 0.11, `shift` 0.01, `up` 0.035; `SHAPE.earCrescent`: `coverShift` 0.16, `coverDown` 0.04. `capybara.config.js` → `earL/earR.origin` (±0.566, −0.539). Ukuran telinga dalam satuan `rx` |
| Moncong | Ukuran & posisi dari hasil ukur referensi, tepi tegas | `SHAPE.snout`: `y` 0.287, `rx` 0.342, `ry` 0.444, `dome` { `widest` 0.18, `nTop` 2.8, `nBottom` 2.3, `taper` 0.12 }; `SHAPE.nostril`: `x` ±0.142, `y` 0.017, `rx` 0.06, `ry` 0.047, `tilt` 25; filter `capybaraSnoutEdge` blur 0.5 |
| Jeruk | Bulat sedikit gepeng seperti mandarin (tinggi ÷ lebar 0.76), bagian bawah tenggelam di kepala dan dipotong rata di garis duduknya, tanpa gerakan sendiri & selalu solid (5.14) | `SHAPE.orange`: `y` −1.104, `rx` 0.297, `ry` 0.276, `dome` { `nTop` 2.2, `nBottom` 2, `flatBase` 0.726 }. Digambar oleh `CapybaraOrange` setelah lapisan tipis badan |
| Tangkai & daun | Daun lebar, pangkal menempel ke batang, sisi bawah rebah di kulit atas jeruk | `SHAPE.stem`: titik `[0, −0.234]` → `[−0.014, −0.408]`, `width` 0.056; `SHAPE.leaf`: `base` [0.012, −0.245], `top` [[0.06, −0.431], [0.264, −0.467], [0.36, −0.299]], `bottom` [[0.252, −0.179], [0.096, −0.185]]. Titik relatif ke tengah jeruk |
| Warna turunan | Telinga, moncong, sabit, jeruk ikut warna dasar; lebih gelap tanpa kusam (5.11) | `capybara.config.js` → `shade`: telinga −0.18, sabit −0.45, moncong −0.22, lubang hidung −0.6, jeruk +0.25. `_core/derivedColor.js` → `SATURATION_BOOST` 0 |
| Mata iris (idle, B18.4) | Mata cokelat besar: putih mata di sisi luar, kelopak atas tebal, iris gelap → cokelat hangat di bawah, kilau bulat di dalam-atas, bintang di luar-bawah. Ikut mouse 0.6× | `capybara.config.js` → `anatomy.eyeSize` 0.203 (× `rx`), `eyeSpacing` 0.55, `anchors.face` y −0.183. `_core/parts/Eyes.jsx` → `IRIS_EYE` (dikali jari-jari mata): `outline` 0.08, `lidTop` 0.11, `iris` { `r` 0.8, `shift` 0.12 }, `shine` { `x` 0.37, `y` −0.27, `r` 0.31 }, `sparkle` { `x` −0.35, `y` 0.43, `s` 0.19 }; warna `BIG_EYE_COLORS` (`line` #5A1E10, `sclera` #E6DEDB, `irisDark` #3E2120, `irisWarm` #91522B, `shine` #F4F3F5); gradient `eyeIrisGrad`; `BIG_EYE_TRACK` 0.6. Mata `iris-heart` (love) mewarisi angka ini, jadi ikut terkunci |
| Mulut ω (idle, B18.3) | Garis tengah dari hidung + dua lengkung potongan lingkaran | `capybara.config.js` → `anatomy.mouthSize` 0.246 (× `rx`), `anchors.mouth` (0, 0.151). `_core/parts/Mouth.jsx` → `MOUTHS.w`: `philtrum` 0.912, `lobes` { `cx` 0.474, `cy` 0.352, `r` 0.734, `endX` 0.92 }; `MOUTH_COLOR` #47100A, `STROKE` 0.19 (dipakai semua mulut, jadi mengubahnya ikut mengubah idle) |
| Mata love (B18.4) | Frame mata iris persis (kelopak & bola mata), tanpa kilau putih, hati pink di atas iris; iris gelap terlihat sebagai cincin di sekeliling hati | `_core/parts/Eyes.jsx` → `BIG_EYES["iris-heart"]` = `IRIS_EYE` dengan `shine: null`, `sparkle: null`, `heart: true`. `EYE_HEART` (dikali jari-jari mata): `x` 0.04, `top` −0.48, `notch` −0.33, `widest` −0.14, `tip` 0.61, `halfWidth` 0.66; `EYE_HEART_STOPS` #FE7E97 → #EF6886 → #DF4851 → #C83D42 (gradient `eyeHeartGrad`) |
| Mulut love (B18.3) | ω lebih lebar, ujung kiri-kanan naik tinggi seperti tersenyum | `_core/parts/Mouth.jsx` → `MOUTHS["w-wide"]`: `philtrum` 0.523, `lobes` { `cx` 0.508, `cy` 0.095, `r` 0.664, `endX` 1.085 } |
| Mulut sleeping (B18.3) | ω kecil & sangat datar, garis tengah panjang | `_core/parts/Mouth.jsx` → `MOUTHS["w-small"]`: `philtrum` 1.16, `lobes` { `cx` 0.257, `cy` 0.525, `r` 0.685, `endX` 0.514 } |
| Mata tidur (sleeping, B18.4) | Satu lengkung tebal mulus melengkung ke bawah, tebal rata di tengah & meruncing halus ke ujung, 2 bulu mata pendek di ujung luar, cokelat tua seperti mulut | `_core/parts/Eyes.jsx` → `CLOSED_EYE` (dikali jari-jari mata, dari tengah mata terbuka): `halfWidth` 0.92, `endY` 0.325, `midY` 0.755, `thick` 0.34, `taper` 0.5 (tebal = `thick` × sin^`taper`), 64 titik; `lashes` { `at` [0.1, 0.2], `length` 0.2, `width` 0.09, `spread` 0.9 }; `CLOSED_EYE_COLOR` #47100A. Ukuran & posisi ikut `anatomy.eyeSize` dan `eyeSpacing`/`face` mata iris |
| Alis & kerutan dahi (annoyed, B18.5) | Tidak ada garis alis terpisah (kelopak tebal mata `heavy` berperan sebagai alis). Kerutan: alur gelap miring di atas sudut dalam mata, meruncing ke kedua ujung, tepi terang di sisi atasnya, lembut (blur). Warna ikut warna dasar. Kiri-kanan simetris | `_core/parts/Brows.jsx` → `BROWS.angry.crease` (dikali jari-jari mata, x positif = ke arah hidung, dari tengah mata): `from` [0.87, −0.69], `to` [1.49, −0.18], `width` 0.18, `shade` −0.4, `opacity` 0.85, `highlight` { `offset` 0.14, `width` 0.1, `shade` 0.12, `opacity` 0.6 }, `blur` 0.7; `CREASE_STEPS` 24, `CREASE_TAPER` 0.6. Posisi ikut `anatomy.eyeSize` dan `eyeSpacing`/`face` mata iris |
| Tanda marah (annoyed, B18.6) | 4 lengkung tebal cembung ke arah tengah di dahi kanan atas, cokelat kemerahan tua + kilap tipis di sisi atas, berdenyut 2× per putaran | `capybara.config.js` → `anchors.anger` (0.594, −0.557). `_core/parts/Particles.jsx` → `ANGER` (dikali `rx`, dari pusat tanda): `strokes` atas [[−0.061, −0.126], [−0.026, −0.08], [0.014, −0.068], [0.066, −0.086]], kiri [[−0.108, −0.097], [−0.073, −0.051], [−0.079, −0.005], [−0.111, 0.03]], kanan [[0.113, −0.028], [0.072, 0.007], [0.083, 0.059], [0.118, 0.088]], bawah [[−0.073, 0.088], [−0.026, 0.065], [0.026, 0.077], [0.066, 0.129]]; `width` 0.04, `color` #6E160B, `shine` { `color` #A04A3A, `width` 0.35, `lift` 0.22, `opacity` 0.55 }, `pulse` { `times` 2, `scale` 0.12 } |
| Zzz (sleeping, B18.6) | Z besar + z kecil di kanan atas kepala, garis tebal berujung bulat, mauve kecokelatan, naik-turun pelan bergantian. Mochi tetap memakai Zzz lama (`zzz`) | `capybara.config.js` → `anchors.zzz` (1.058, −0.667) = tengah Z besar. `_core/parts/Particles.jsx` → `ZZZ_BOLD` (dikali `rx`, dari titik tempel): Z besar `pts` [[−0.039, −0.096], [0.081, −0.055], [−0.1, 0.047], [0.058, 0.103]], `width` 0.044, `phase` 0; z kecil `pts` [[−0.146, 0.126], [−0.063, 0.154], [−0.179, 0.214], [−0.09, 0.251]], `width` 0.032, `phase` 0.35; `colors` #CBA3A8 → #B07F86; `bob` 0.055 (× `ry`) |

Bagian lain (mata, mulut, alis, pipi, partikel, pose) ditambahkan ke tabel ini setelah
disetujui user di langkah berikutnya.

Di luar Fase 1:

- **B-7 "Copy React Component":** tetap disembunyikan (opsinya sudah di-comment di
  `ExportModal.jsx:106`). Dievaluasi di Fase 3. Lihat 5.8.
- **Fase 5, halaman pembanding:** `src/app/alat/pembanding/` (B18.0) adalah alat kerja,
  bukan fitur. Wajib dihapus (atau minimal tetap disembunyikan) sebelum rilis. Gambar di
  `docs/reference/capybara/` boleh tetap ada sebagai dokumentasi.
- **Fase 4, mulut Mochi:** mulut yang menempel di mata Mochi (`yawn`, `angry`,
  `surprised`) dipindah ke laci mulut (`_core/parts/Mouth.jsx`). Langkah tersendiri
  karena mengubah tampilan Mochi.
- **Fase 4, sisa 10 mood Capybara:** varian yang belum dibuat di B18: mulut "o", mulut
  terbuka + lidah, mulut "x", mulut menguap + air liur; mata putih + pupil, wink mata
  kanan (mata hati tanpa emoji sudah dimajukan ke koreksi 2 B18.4); partikel pusaran & hati melayang.
  Zzz Capybara sudah dirapikan di B18.6 (`zzz-bold`).

---

## 5. Keputusan desain

### 5.1 Mood resmi Mochi = 22

Jumlah mood tidak boleh di-hardcode di mana pun. Semua angka dan daftar mood
dibaca dari file moods milik karakter.

### 5.2 Warna dasar vs warna mood

User hanya bisa mengganti **warna dasar** karakter: badan dan anggota badan,
termasuk tangan greeting. Warna mood tidak bisa diganti dan tidak boleh hilang
saat user memilih warna sendiri. Setiap karakter wajib menandai bagian mana
yang ikut warna dasar dan mana yang warnanya tetap.

### 5.3 Karakter berbeda, style sama

Tiap karakter punya bentuk, warna default, dan daftar mood sendiri (jumlah mood
boleh beda antar karakter). Style desain harus sama, dijaga lewat bagian
bersama di `_core`.

Setiap karakter wajib punya **satu mood default**. Kalau user ganti karakter dan
mood yang sedang dipilih tidak ada di karakter baru, editor pindah ke mood default.

### 5.4 Contoh karakter berikutnya: Capybara

Capybara punya telinga dan jeruk di atas kepala yang menyatu dengan tubuh
(digambar di file Body-nya, bukan sebagai aksesori).

Titik tempel aksesori, Zzz, dan bintang harus menyesuaikan bentuk kepala tiap
karakter. Tiap karakter punya daftar aksesori yang diizinkan.

### 5.5 Tes akhir Fase 1

Membuat Capybara versi sederhana (3 mood) dengan **menambah satu folder + satu baris
di `registry.js`**, tanpa mengubah kode editor. (Definisi diperbarui oleh 5.9.)

### 5.6 Nuansa mood: glow + lapisan warna tipis

Nuansa mood tampil sebagai glow plus lapisan warna tipis (opacity rendah) yang
menimpa badan, garis tepi, dan elemen, di atas warna dasar pilihan user.
Kekuatan lapisan tipis diatur **sekali di `_core`** supaya seragam di semua karakter.

Tes wajib: mood **error** dan **love** dengan warna dasar **putih**, **hitam**,
dan **satu warna terang**.

Kekuatan lapisan tipis (`MOOD_TINT_OPACITY`) diturunkan dari 0.3 ke **0.12** (koreksi
B18.3–B18.4): warna dasar harus tetap dominan dan nuansa mood hanya samar. Di gambar
referensi Capybara badan & jeruk tetap oranye di semua mood. Berlaku untuk semua karakter
(Mochi ikut lebih samar; lencana & glow tetap jadi penanda mood utama).

### 5.7 Bagian bergerak

Cetakan punya konsep "bagian bergerak": layer bernama di dalam badan yang bisa
dianimasikan sendiri per mood.

- Mochi: tangan
- Capybara: telinga (jeruk **bukan** bagian bergerak, lihat 5.14)

Daftar mood menyebut gerakan tiap bagian. Semua gerakan bagian wajib ikut
**mode seek**, supaya hasil export sama dengan preview.

### 5.8 Copy React Component: di luar Fase 1

Fitur "Copy React Component" (bug B-7) tetap disembunyikan. Tidak dikerjakan di
Fase 1, dievaluasi di Fase 3.

### 5.9 Pendaftaran karakter baru lewat `registry.js`

Karakter baru didaftarkan dengan **menambah satu baris di `registry.js`**, bukan
deteksi folder otomatis. Definisi tes akhir (5.5) menjadi: tambah satu folder +
satu baris di `registry.js`, tanpa mengubah kode editor.

### 5.10 Gaya karakter: halus bergradient, tanpa tekstur bulu

Semua karakter digambar halus bergradient seperti Mochi, **tanpa tekstur bulu**.
Gambar referensi (misalnya `docs/reference/capybara-moods.jpg`) hanya acuan bentuk,
ekspresi, dan susunan, bukan acuan gaya permukaan.

### 5.11 Tiga jenis warna di cetakan

Setiap bagian badan memakai salah satu dari tiga jenis warna:

| Jenis | `paint` | Arti |
|---|---|---|
| Ikut warna dasar | `"base"` | Sama dengan warna dasar pilihan user |
| Turunan warna dasar | `"derived"` | Lebih gelap/terang dari warna dasar. Menggelapkan = kecerahan turun dengan kepekatan warna tetap (bukan dicampur hitam), jadi tetap hidup, tidak cokelat/abu kusam. Otomatis balik arah kalau warna dasar sangat terang/gelap, supaya tetap terlihat beda |
| Warna tetap | `"fixed"` | Tidak ikut warna user |

Capybara:

- Badan: ikut warna dasar.
- Telinga, moncong, dalam telinga, dan jeruk: turunan warna dasar. Telinga sedikit
  lebih gelap dari kepala, seperti di gambar referensi. Jeruk **harus tetap
  terbedakan dari kepala** di warna dasar apa pun.
- Daun: warna tetap hijau.
- Warna dasar awal (`defaultColor`): oranye seperti referensi, diambil dari gambar
  referensi (tidak ada SVG Figma, lihat 5.13).

### 5.12 Bayangan badan dari warna dasar

Bayangan/gradient badan memakai **versi gelap dari warna dasar itu sendiri** (misalnya
hijau → hijau tua), bukan abu gelap tetap `#475569`. Berlaku untuk semua karakter,
termasuk Mochi. Rumusnya sama dengan warna turunan (5.11, B18.1), diatur sekali di
`_core/derivedColor.js` (`BODY_SHADOW_SHADE`) supaya seragam. Kalau warna dasar sangat
gelap (misalnya hitam), arahnya otomatis dibalik jadi sedikit lebih terang.

### 5.13 Bentuk Capybara semirip mungkin dengan gambar referensi

Bentuk semua bagian Capybara di setiap mood (kepala, telinga, moncong, jeruk, daun,
mata, mulut, alis, pipi, partikel, dan perubahan bentuk badan) harus **semirip mungkin**
dengan `docs/reference/capybara-moods.jpg` (potongan per mood di
`docs/reference/capybara/`). Gaya permukaan tetap halus bergradient seperti sekarang
(5.10), jadi yang ditiru adalah bentuk, bukan tekstur bulu.

Tidak ada SVG Figma. Semua bentuk dibuat dari gambar referensi dan dicek kemiripannya
dengan halaman pembanding `/alat/pembanding` (B18.0). Keputusan ini menggantikan
rujukan ke `docs/reference/capybara.svg` di 3.5, B18.1, dan 5.11.

### 5.14 Jeruk Capybara tidak bergerak sendiri dan selalu solid

Jeruk (beserta tangkai dan daunnya) **tidak punya gerakan sendiri**. Jeruk selalu
menempel di kepala dan ikut gerak badan di semua mood; gerakan memantul (`bounce`)
di mood love dihapus. Bagian bergerak Capybara hanya telinga.

Jeruk, tangkai, dan daun selalu **solid (tidak tembus pandang)** di semua mood.
Lapisan tipis mood (3.3) tetap menimpa jeruk, tapi digambar dengan urutan yang benar:
setiap lapisan tipis digambar tepat setelah bentuknya sendiri, sebelum bentuk lain
yang menimpanya. Karena itu jeruk digambar **setelah** lapisan tipis badan
(komponen `CapybaraOrange` di `CapybaraBody.jsx`), dan daun digambar setelah lapisan
tipis jeruk. Kalau urutannya terbalik, lapisan transparan badan ikut menimpa bagian
bawah jeruk, sehingga garis kepala terlihat "tembus" di jeruk.

### 5.15 Capybara tanpa pipi merah muda

Capybara **tidak memakai pipi merah muda di semua mood** (`blush: "none"` di
`capybara.moods.js`), walaupun gambar referensi menampilkannya. Ini pengecualian dari 5.13
(bentuk semirip mungkin dengan referensi). Mochi tetap memakai pipi (`soft`).

Pipi padat (`solid`) sempat dibuat dan dicoba di B18 (lihat catatan B18.3 & B18.4), lalu
rencana "pipi pink padat" dihapus dari daftar Fase 4.
