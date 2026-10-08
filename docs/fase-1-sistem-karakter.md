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
│       ├── Blush.jsx
│       ├── Badge.jsx
│       ├── Particles.jsx    ← Zzz & bintang, ditempel ke titik tempel
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
| Tiap bagian badan ditandai `paint: "base"` (ikut warna dasar) atau `paint: "fixed"` (warna tetap) | `*.config.js` → `parts` | 5.2 |
| Bagian yang bisa dianimasikan sendiri ditandai `moving: true` + titik putar (`origin`) | `*.config.js` → `parts` | 5.7 |
| Punya titik tempel kepala: `hat`, `face`, `zzz`, `stars`, `badge` | `*.config.js` → `anchors` | 5.4 |
| Punya daftar aksesori yang diizinkan | `*.config.js` → `allowedAccessories` | 5.4 |
| Semua mood ada di satu file; jumlah mood dihitung dari file ini | `*.moods.js` | 5.1 |
| Gerakan bagian bergerak disebut per mood, pakai preset dari `_core/motions.js` | `*.moods.js` | 5.7 |
| Tidak boleh menentukan kekuatan lapisan tipis sendiri | — (diatur `_core`) | 5.6 |

Angka posisi (`origin`, `anchors`) ditulis **relatif ke ukuran badan** (0 = tengah,
±1 = tepi), sama seperti cara Mochi menghitung posisi mata sekarang.

### 3.3 Urutan lapisan warna (sama untuk semua karakter)

```
1. Warna dasar user        → hanya bagian ber-paint "base"
2. Warna tetap             → bagian ber-paint "fixed" (jeruk, mata, pipi, dll)
3. Lapisan tipis mood      → menimpa badan, garis tepi, DAN elemen,
                             opacity = MOOD_TINT_OPACITY dari _core
4. Glow mood               → di luar badan
```

Contoh isi `_core/moodTint.js`:

```js
// Satu angka untuk semua karakter. Mengubahnya = semua karakter ikut berubah.
export const MOOD_TINT_OPACITY = 0.18; // angka contoh, final ditentukan saat tes B14

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
    earL:   { paint: "base",  moving: true, origin: { x: -0.55, y: -0.85 } },
    earR:   { paint: "base",  moving: true, origin: { x:  0.55, y: -0.85 } },
    orange: { paint: "fixed", moving: true, origin: { x: 0, y: -1.0 } },  // jeruk: warna tetap
    leaf:   { paint: "fixed" },
  },

  anchors: {            // kepala lebih tinggi karena ada jeruk
    hat:   { x: 0,     y: -0.55 },
    face:  { x: 0,     y: -0.05 },
    zzz:   { x: 0.70,  y: -0.70 },
    stars: { x: 0,     y: -0.45 },
    badge: { x: -0.90, y: -0.95 },
  },

  allowedAccessories: ["glasses"],  // topi bentrok dengan jeruk
};
```

`capybara.moods.js`

```js
export const capybaraMoods = [
  { id: "idle",     label: "Idle",     motion: "float", eyes: "round" },
  { id: "sleeping", label: "Sleeping", motion: "float", eyes: "sleepy",
    particles: "zzz", parts: { earL: "droop", earR: "droop" } },
  { id: "love",     label: "Love",     motion: "float", eyes: "hearts",
    tint: "pink", glow: "pink", badge: "heart", parts: { orange: "bounce" } },
];
```

Telinga dan jeruk digambar di `CapybaraBody.jsx` (menyatu dengan tubuh), **bukan** sebagai aksesori.

> Catatan: gerakan bagian (`droop`, `bounce`) dan daftar aksesori Capybara di atas
> masih **contoh**. Nilai finalnya mengikuti desain Figma.

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
| B17 | **Tes akhir:** buat Capybara sederhana 3 mood (contoh 3.5) dengan **menambah satu folder `src/characters/capybara/` + satu baris di `registry.js`**, tanpa mengubah kode editor | 5.5, 5.9 |

Di luar Fase 1:

- **B-7 "Copy React Component":** tetap disembunyikan (opsinya sudah di-comment di
  `ExportModal.jsx:106`). Dievaluasi di Fase 3. Lihat 5.8.

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

### 5.7 Bagian bergerak

Cetakan punya konsep "bagian bergerak": layer bernama di dalam badan yang bisa
dianimasikan sendiri per mood.

- Mochi: tangan
- Capybara: telinga, jeruk

Daftar mood menyebut gerakan tiap bagian. Semua gerakan bagian wajib ikut
**mode seek**, supaya hasil export sama dengan preview.

### 5.8 Copy React Component: di luar Fase 1

Fitur "Copy React Component" (bug B-7) tetap disembunyikan. Tidak dikerjakan di
Fase 1, dievaluasi di Fase 3.

### 5.9 Pendaftaran karakter baru lewat `registry.js`

Karakter baru didaftarkan dengan **menambah satu baris di `registry.js`**, bukan
deteksi folder otomatis. Definisi tes akhir (5.5) menjadi: tambah satu folder +
satu baris di `registry.js`, tanpa mengubah kode editor.
