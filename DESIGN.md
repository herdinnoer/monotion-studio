# DESIGN.md — Monotion Studio

> Aturan visual untuk UI Monotion. Baca file ini sebelum mengerjakan tampilan apa pun.
> Sumber: tampilan editor yang sudah ada (Okt 2026), dirapikan jadi satu sistem.
> Pelengkap: `.github/antislop.md` (daftar pola "AI slop" yang wajib dihindari).

---

## 1. Identitas

**Monotion adalah studio, karakter adalah bintangnya.**
UI berperan seperti bingkai polos di galeri: rapi, tenang, dan tidak berebut perhatian dengan karakter yang warna-warni.

**Kesan yang dituju:** premium, rapi, berkelas, tetap simple, mudah dipakai.
**Yang dihindari:** ramai, kaku, AI slop.

**Referensi rasa:** editor animos.app. Panel gelap yang tenang, kanvas bertitik, kontrol kecil dan padat.

### Prinsip
1. **Netral dulu, warna belakangan.** UI memakai abu-abu netral. Warna aksen hanya untuk: satu tombol utama (Export), item yang sedang dipilih, dan fokus keyboard.
2. **Hierarki lewat permukaan, bukan dekorasi.** Lapisan dibedakan dengan warna permukaan dan garis tepi tipis, bukan bayangan tebal, gradient, atau ikon hiasan.
3. **Padat tapi bernapas.** Kontrol kecil (teks 12px), jarak konsisten di kelipatan 4px.
4. **Dua mode setara.** Setiap warna punya versi terang dan gelap. Tidak ada komponen yang "lupa" diberi versi gelap.
5. **Satu sumber kebenaran.** Komponen tidak boleh menulis kode warna langsung (`#232328`, `bg-gray-100`). Semua lewat token di bagian 3.

---

## 2. Mode tampilan
- Dua mode: **terang** dan **gelap**. Default **gelap**.
- Pengalih ada di top bar (ikon matahari/bulan). Tidak mengikuti setting sistem (`enableSystem: false`).
- Kanvas di tengah ikut mode, tapi **background karakter** (warna yang dipilih user) tidak terpengaruh mode.

---

## 3. Warna (token)

Nama token dipakai di CSS variable dan Tailwind. Nilai diambil dari editor sekarang, disederhanakan dari ±13 abu-abu gelap jadi 4 lapisan.

### Permukaan
| Token | Dipakai untuk | Terang | Gelap |
|---|---|---|---|
| `bg-app` | Latar paling belakang (di sela panel) | `#F5F5F7` | `#1C1C1E` |
| `surface` | Panel: top bar, sidebar, player bar, modal | `#FFFFFF` | `#161618` |
| `surface-raised` | Di atas panel: input, select, segmented, popover, kartu terpilih | `#ECECEF` | `#232328` |
| `surface-hover` | Hover di atas `surface-raised` | `#E4E4E8` | `#2C2C32` |
| `border` | Garis tepi & pemisah | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.08)` |

### Teks
| Token | Dipakai untuk | Terang | Gelap |
|---|---|---|---|
| `text` | Teks utama | `#111113` | `#F4F4F5` |
| `text-muted` | Label section, teks pendukung | `#52525B` | `#A1A1AA` |
| `text-subtle` | Info kecil (jumlah mood, frame) | `#71717A` | `#71717A` |

### Aksen (satu warna saja)
| Token | Terang | Gelap | Catatan |
|---|---|---|---|
| `accent` | `#0B6FD0` | `#0E89F8` | Tombol utama, item terpilih, link "Reset" |
| `accent-hover` | `#0E89F8` | `#48A6FB` | |
| `accent-pressed` | `#1D4ED8` | `#1D4ED8` | |
| `focus-ring` | `accent` 2px | `accent` 2px | Wajib tampil saat navigasi keyboard |

> Kenapa aksen mode terang lebih gelap: teks putih di atas `#0E89F8` kontrasnya ±3.5:1, di bawah standar keterbacaan (4.5:1). `#0B6FD0` ±5:1, lolos.

### Status
| Token | Nilai | Dipakai untuk |
|---|---|---|
| `success` | `#22C55E` | Export berhasil |
| `danger` | `#EF4444` | Export gagal, error |
| `warning` | `#EAB308` | Peringatan (mis. WebM di Safari) |

### Kanvas
- Pola titik: titik 1px, jarak 20px.
- Terang: titik `rgba(0,0,0,0.15)`. Gelap: titik `rgba(255,255,255,0.12)`.

---

## 4. Tipografi
- **Font:** Plus Jakarta Sans (sudah terpasang lewat `next/font`).
- **Angka waktu/frame:** font mono + `tabular-nums`, supaya angka tidak "goyang" saat berubah.

| Peran | Ukuran | Tebal | Catatan |
|---|---|---|---|
| Judul modal | 16px | 700 | |
| Judul panel ("Characters", "Customizer"), tombol utama | 14px | 600 | |
| Label section ("MOOD", "COLOR") | 12px | 600 | Huruf kapital, `tracking-wide`, warna `text-muted` |
| Isi kontrol (select, input, segmented) | 12px | 500 | |
| Info kecil (nama mood di kartu, jumlah mood) | 11px | 500 | Warna `text-subtle` |
| Penghitung frame | 10px | 500 | Mono |

Aturan: maksimal 3 ketebalan (500, 600, 700). Jangan pakai ukuran di luar tabel ini.

---

## 5. Bentuk

### Radius (sudut)
| Token | Nilai | Dipakai untuk |
|---|---|---|
| `radius-xs` | 6px | Item di dalam grup (tombol segmented, thumb) |
| `radius-sm` | 8px | Tombol ikon, input, select |
| `radius-md` | 10px | Tombol berteks (Export, Cancel) |
| `radius-lg` | 12px | Kartu karakter, popover, grup segmented |
| `radius-xl` | 16px | Panel |
| `radius-2xl` | 24px | Modal |
| `radius-full` | 9999px | Avatar, switch, progress bar |

Aturan sudut bersarang: sudut kotak di dalam selalu lebih kecil dari kotak luarnya (contoh: grup segmented 12px → tombol di dalamnya 6px), supaya lengkungannya terlihat sejajar.

### Bayangan
- **Panel tidak memakai bayangan.** Dibedakan dengan warna `surface` + `border`.
- Bayangan hanya untuk lapisan yang **melayang**: popover, dropdown, tooltip (bayangan sedang), modal (bayangan besar).
- Item terpilih di grup segmented boleh memakai bayangan sangat tipis (`shadow-sm`).

### Jarak
- Kelipatan 4px.
- Jarak antar panel: 8px. Padding luar halaman: 8px.
- Padding dalam panel: 16px. Header panel: 16px dengan garis bawah `border`.
- Jarak antar section di sidebar: 24px, dipisah garis `border`.
- Jarak label section ke kontrolnya: 12px.

---

## 6. Ikon
- Set: **Lucide** (`lucide-react`).
- Ukuran: 16px di tombol dan top bar, 14px di dalam input/select.
- Tebal garis: **1.75** (lebih tipis dari bawaan Lucide yang 2), supaya lebih halus. Berlaku untuk semua ikon, dipasang di satu tempat, bukan ditulis ulang di tiap ikon.
- Ikon hanya untuk aksi yang jelas (undo, play, close, tema). Tidak ada ikon dekorasi di samping judul.
- Tombol yang isinya cuma ikon wajib punya `aria-label` dan tooltip.

---

## 7. Gerakan UI
Gerakan UI harus nyaris tak terasa. Yang boleh "hidup" dan memantul hanya karakternya.

| Elemen | Durasi | Easing |
|---|---|---|
| Hover, warna, ganti tema | 150ms | ease-out |
| Popover, dropdown muncul | 150ms | ease-out, fade + skala 0.97→1 |
| Modal muncul | 200ms | ease-out, fade + skala 0.95→1 |

- Tidak ada efek memantul (bounce/spring) di UI.
- Hormati `prefers-reduced-motion`: matikan animasi skala, sisakan fade.

---

## 8. Komponen
- **HeroUI dulu.** Pakai komponen HeroUI kalau ada (Button, Switch, ColorPicker, Select, Tabs/segmented, Modal, Tooltip, Slider). Komponen sendiri hanya kalau HeroUI tidak punya, dengan alasan tertulis.
- **Dikustom lewat tema, bukan per komponen.** Token di bagian 3 dan 5 dipasang ke variabel tema HeroUI di `globals.css`, supaya semua komponen otomatis ikut.

| Komponen | Aturan |
|---|---|
| Tombol utama (glossy) | Hanya **satu** per layar (Export). Lihat "Tombol glossy" di bawah. |
| Tombol kedua | Teks saja atau latar `surface-raised`. Tidak memakai aksen. |
| Tombol ikon | 32×32px, radius 8px, transparan, hover `surface-raised`. Nonaktif: opacity 40%. |
| Select (mood) | Latar `surface-raised`, garis `border`, teks 12px/500, ikon chevron 14px. |
| Segmented (format, resolusi, fps) | Grup `surface-raised` radius 12px padding 4px. Item terpilih: `surface` + `shadow-sm`. |
| Kartu karakter | Radius 12px. Terpilih: latar `surface-raised` + garis tepi 2px `accent`. |
| Input warna | Kotak warna 24px radius 6px + kode hex 12px kapital. |
| Modal | Lebar maks 480px, `surface`, radius 24px, padding 24px, latar belakang `black/40` (terang) atau `black/60` (gelap) + blur. |
| Progress export | Bar tinggi 6px radius penuh, isi `accent`, ada teks persen. |

### Tombol glossy (ciri khas Monotion)
Satu-satunya elemen UI yang boleh memakai gradient. Sengaja dipertahankan sebagai ciri khas, jadi justru harus jarang muncul supaya tetap terasa istimewa.

- Hanya satu warna: **biru**. Varian pink dan hijau di `GlossyButton` dihapus.
- Sama di mode terang dan gelap.
- Teks putih 14px/600, radius 10px, tinggi 36px, padding samping 16px.

| Keadaan | Gradient (atas → bawah) | Garis tepi |
|---|---|---|
| Normal | `#0E89F8` → `#1D4ED8` | `#003768` |
| Hover | `#48A6FB` → `#1D4ED8` | `#003768` |
| Ditekan | `#1E40AF` → `#1D4ED8` | `#003768` |

- Kilap: garis terang tipis di tepi atas dalam (`inset 0 1px 0 rgba(255,255,255,0.4)`) + bayangan kecil di bawah (`0 2px 4px rgba(0,0,0,0.1)`).
- Saat ditekan: kilap atas hilang, diganti bayangan ke dalam (`inset 0 2px 4px rgba(0,0,0,0.2)`), supaya terasa "masuk".
- Kontras teks putih di warna tengah gradient ±4.8:1, lolos standar keterbacaan.

---

## 9. Larangan
Selain semua aturan di `.github/antislop.md`:
- Tidak ada gradient dekoratif, glow, atau efek kaca di UI. Pengecualian: tombol glossy (bagian 8) dan karakter itu sendiri.
- Tidak ada warna jenuh selain `accent` dan warna status.
- Tidak ada emoji di UI.
- Tidak ada tombol atau menu yang belum berfungsi. Kalau fiturnya belum ada, sembunyikan.
  - Tombol "Projects" dan avatar user di top bar **disembunyikan** sampai ada fitur akun (Fase 6).
- Tidak ada data palsu yang terlihat asli (avatar contoh, nama user contoh).
- Tidak ada kode warna langsung di komponen. Semua lewat token.
