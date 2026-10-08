// Rumus bentuk bersama untuk semua karakter.
// Isinya murni hitungan: terima angka, kembalikan garis SVG (atribut "d" di <path>).

// Tingkat "kotak" tiap preset bentuk badan.
// 2 = elips bulat, makin besar makin mendekati kotak.
const SUPERELLIPSE_EXPONENTS = {
  mochi: 2.7,
  round: 2.0,
  boxy: 4.5,
};

/**
 * Superellipse generator: |x/rx|^n + |y/ry|^n = 1
 */
export function generateSuperellipsePath(cx, cy, rx, ry, preset = "mochi", segments = 160) {
  const n = SUPERELLIPSE_EXPONENTS[preset] ?? SUPERELLIPSE_EXPONENTS.mochi;

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const exponent = 2 / n;
    const x = cx + rx * Math.sign(cosT) * Math.pow(Math.abs(cosT), exponent);
    const y = cy + ry * Math.sign(sinT) * Math.pow(Math.abs(sinT), exponent);

    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ") + " Z";
}

export function generateSpiralPath(cx, cy, maxR = 15.5, turns = 2.5) {
  const points = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * 2 * Math.PI;
    const r = t * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join(" ");
}
