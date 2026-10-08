// Preset gerakan bersama untuk semua karakter.
// Tiap preset punya dua versi yang harus menghasilkan gerakan yang sama:
// - loop: dipakai saat preview diputar (framer-motion mengulang sendiri)
// - seek(p): pose dihitung dari progress 0–1, dipakai saat pause/scrub/export
//   supaya hasil export sama persis dengan preview.

// Naik-turun halus dalam satu putaran: 0 di awal, 1 di tengah, 0 di akhir.
export function loopBounce(p) {
  return (1 - Math.cos(p * Math.PI * 2)) / 2;
}

export const MOTIONS = {
  // Napas naik-turun pelan
  float: {
    durationMs: 3600,
    loop: {
      y: [0, -6, 0],
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      scale: [1, 1.012, 1],
    },
    seek: (p) => {
      const b = loopBounce(p);
      return { y: -6 * b, rotate: 0, scaleX: 1, scaleY: 1, scale: 1 + 0.012 * b };
    },
  },

  // Goyang kiri-kanan sambil melompat kecil
  dance: {
    durationMs: 800,
    loop: {
      y: [0, -12, 0],
      rotate: [-6, 6, -6],
      scaleX: [1, 0.96, 1],
      scaleY: [1, 1.05, 1],
    },
    seek: (p) => {
      const b = loopBounce(p);
      return {
        y: -12 * b,
        rotate: Math.sin(p * Math.PI * 2) * 6,
        scaleX: 1 - 0.04 * b,
        scaleY: 1 + 0.05 * b,
      };
    },
  },

  // Melambai (untuk bagian bergerak, misalnya tangan)
  wave: {
    durationMs: 750,
    loop: { rotate: [-10, 24, -10] },
    seek: (p) => ({ rotate: -10 + 34 * loopBounce(p) }),
  },
};

// Animasi loop siap pakai untuk framer-motion (gerakan + aturan ulang tanpa henti).
export function getLoopAnimation(motionId) {
  const motion = MOTIONS[motionId];
  return {
    ...motion.loop,
    transition: { repeat: Infinity, duration: motion.durationMs / 1000, ease: "easeInOut" },
  };
}
