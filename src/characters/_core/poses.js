// Pose badan per mood, bersama untuk semua karakter.
//
// Pose = perubahan bentuk badan & letak wajah untuk satu mood (misalnya proud: pipi
// menggembung, kepala mendongak). Karakter menulis angka pose-nya di config (`poses`),
// mood memilihnya lewat kunci `pose`. Mood tanpa `pose` memakai bentuk asli, tidak berubah.
//
// Isi satu pose (semua angka relatif ke badan: x dikali rx, y dikali ry):
//   cheeks — dua bola pipi yang digabung ke kubah kepala (kiri-kanan dicerminkan):
//            x, y = pusat bola pipi kanan, rx, ry = jari-jari. Di setiap ketinggian, garis
//            luar badan = yang terlebar antara kubah dan bola pipi, jadi di sambungannya
//            ada lekukan (seperti pelipis). blend = seberapa halus lekukan itu (0 = tajam).
//            Kepala di atas bola pipi tidak berubah.
//   lift   — dasar badan naik sedikit (badan gepeng): naik `amount` di dasar, mulai
//            dari ketinggian `from` (di atasnya tidak berubah), halus tanpa tekukan
//   face   — letak wajah: eyesY = mata naik/turun, eyeSpacing = tambahan jarak mata
//            dari tengah, eyeScale = ukuran mata (1 = asli), snoutY = moncong + hidung +
//            mulut naik/turun (negatif = naik)
//   pulse  — pipi ikut napas: bola pipi `pulse` × lebih lebar di tengah putaran
//            (0 = diam). Dihitung dari progress, jadi ikut mode seek & sama saat export.
//            Di progress 0 bentuknya persis angka di atas (= gambar referensi).

import { loopBounce } from "./motions";

// Naik halus dari 0 ke 1 (tanpa tekukan di kedua ujung)
function smoothStep(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

// Gabungan halus dua lebar: yang terbesar, sambungannya dibulatkan selebar k
function softMax(a, b, k) {
  if (k <= 0) return Math.max(a, b);
  return (a + b + Math.sqrt((a - b) ** 2 + k * k)) / 2;
}

// Seberapa kuat pose di progress p (0–1): 1 di awal putaran, 1 + pulse di tengah
export function poseStrength(pose, p = 0) {
  return 1 + (pose?.pulse ?? 0) * loopBounce(p);
}

// Fungsi geser titik tepi badan untuk generateDomePath (opsi `warp`, _core/shapes.js).
// Kosong (null) kalau mood tidak punya pose, jadi bentuk asli tidak tersentuh.
export function getPoseWarp(pose, { cx, cy, rx, ry }, p = 0) {
  if (!pose || (!pose.cheeks && !pose.lift)) return null;
  const strength = poseStrength(pose, p);
  const { cheeks, lift } = pose;

  return ([x, y]) => {
    const v = (y - cy) / ry; // ketinggian titik: 0 = tengah badan, 1 = dasar
    let nx = x;
    let ny = y;
    // Dasar naik dulu, baru bola pipi digabung di ketinggian barunya
    if (lift) {
      ny = y - lift.amount * ry * smoothStep((v - lift.from) / (1 - lift.from));
    }
    if (cheeks) {
      const t = ((ny - cy) / ry - cheeks.y) / cheeks.ry;
      if (Math.abs(t) < 1) {
        const ball = (cheeks.x + cheeks.rx * strength * Math.sqrt(1 - t * t)) * rx;
        const half = softMax(Math.abs(x - cx), ball, (cheeks.blend ?? 0) * rx);
        nx = cx + Math.sign(x - cx) * half;
      }
    }
    return [nx, ny];
  };
}

// Geser letak wajah dalam piksel kanvas. Mood tanpa pose: semua 0.
export function getPoseFace(pose, { rx, ry }) {
  const face = pose?.face ?? {};
  return {
    eyesY: (face.eyesY ?? 0) * ry,
    eyeSpacing: (face.eyeSpacing ?? 0) * rx,
    eyeScale: face.eyeScale ?? 1,
    snoutY: (face.snoutY ?? 0) * ry,
  };
}
