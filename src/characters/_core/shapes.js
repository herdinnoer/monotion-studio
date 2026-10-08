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

// Penyempitan ke atas dimulai pelan-pelan dari bagian terlebar. Kalau langsung
// lurus, sisi atas & sisi bawah bertemu dengan sudut kecil di bagian terlebar
// (kepala terlihat bersudut di samping pipi). Di atas TAPER_EASE hasilnya praktis sama.
const TAPER_EASE = 0.15;
function smoothTaper(v) {
  return v < TAPER_EASE ? (v * v) / (2 * TAPER_EASE) : v - TAPER_EASE / 2;
}

/**
 * Bentuk kubah: superellipse yang atas & bawahnya boleh beda.
 * Dipakai kepala Capybara (atas lebih sempit), moncong, dan jeruk.
 *
 * cx, cy, rx, ry = kotak pembatas (sama seperti superellipse biasa).
 * - widest:  letak bagian terlebar, relatif ke ry (0 = tengah, 0.25 = agak ke bawah)
 * - nTop / nBottom: tingkat "kotak" setengah atas / bawah (2 = bulat elips)
 * - bottomCurve: kalau diisi { start, a, b }, bagian bawah memakai lengkung Bezier
 *     (bentuk "roti bun" / mangkuk) menggantikan nBottom.
 *     start = lengkung bawah mulai setinggi ini DI ATAS titik terlebar (relatif ke ry).
 *             Makin besar, makin banyak ruang untuk melengkung, jadi pipi bawah makin
 *             bulat. Kubah atas di atas titik ini tidak berubah sama sekali.
 *     a     = seberapa lama lengkung meneruskan arah sisi kubah sebelum berbelok masuk
 *             (makin besar, belokannya makin landai & sambungannya makin mulus)
 *     b     = seberapa lebar dasar yang rata (makin kecil, dasar makin sempit & bulat)
 *     Lengkung disambung searah dengan sisi kubah atas, jadi tidak ada tekukan.
 * - taper:   seberapa menyempit ke atas (0 = tidak, 0.2 = puncak 20% lebih sempit)
 * - flatBase: kalau diisi, bentuk dipotong rata di garis ini (relatif ke ry dari cy).
 *     Untuk benda yang bagian bawahnya tenggelam/duduk di benda lain (jeruk di kepala).
 * - warp:    kalau diisi, fungsi ([x, y]) => [x, y] yang menggeser tiap titik tepi
 *     (pose badan per mood, lihat _core/poses.js). Kosong = bentuk asli, tidak berubah.
 */
export function generateDomePath(
  cx,
  cy,
  rx,
  ry,
  { widest = 0, nTop = 2, nBottom = 2, bottomCurve = null, taper = 0, flatBase = null, warp = null } = {},
  segments = 160,
) {
  const widestY = cy + widest * ry;
  const topHeight = ry * (1 + widest);
  const bottomHeight = ry * (1 - widest);
  const baseY = flatBase == null ? Infinity : cy + flatBase * ry;

  // Titik superellipse untuk satu sudut theta (0 = kanan, π/2 = bawah, 3π/2 = atas)
  const superPoint = (theta) => {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const isTop = sinT < 0;
    const exponent = 2 / (isTop ? nTop : nBottom);
    const v = Math.pow(Math.abs(sinT), exponent); // 0 di bagian terlebar, 1 di puncak/dasar
    const narrow = isTop ? 1 - taper * smoothTaper(v) : 1;
    return [
      cx + rx * narrow * Math.sign(cosT) * Math.pow(Math.abs(cosT), exponent),
      widestY + (isTop ? -topHeight : bottomHeight) * v,
    ];
  };

  const points = [];
  if (!bottomCurve) {
    for (let i = 0; i <= segments; i++) points.push(superPoint((i / segments) * Math.PI * 2));
  } else {
    const { start = 0, a, b } = bottomCurve;
    // Titik sambung di sisi kanan kubah atas: sudut theta yang tingginya start*ry di atas titik terlebar
    const sinJoin = Math.pow((start * ry) / topHeight, nTop / 2);
    const thetaJoin = 2 * Math.PI - Math.asin(Math.min(sinJoin, 1));
    const [joinX, joinY] = superPoint(thetaJoin);
    // Arah sisi kubah di titik sambung (dx/dy), supaya lengkung bawah meneruskannya tanpa tekukan
    const [prevX, prevY] = superPoint(thetaJoin - 0.001);
    const slope = joinY === prevY ? 0 : (joinX - prevX) / (joinY - prevY);
    const curveHeight = cy + ry - joinY;
    const x0 = (joinX - cx) / rx;
    const x1 = x0 + (slope * a * curveHeight) / rx;

    // Lengkung Bezier sisi kanan, t: 0 = titik sambung, 1 = tengah dasar
    const bezier = (t) => {
      const u = 1 - t;
      return [
        u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * b,
        3 * u * u * t * a + 3 * u * t * t + t * t * t,
      ];
    };
    const half = Math.round(segments / 4);
    // Kanan: sambung → dasar, lalu kiri: dasar → sambung (dicerminkan)
    for (let i = 0; i <= half; i++) {
      const [bx, by] = bezier(i / half);
      points.push([cx + bx * rx, joinY + by * curveHeight]);
    }
    for (let i = half - 1; i >= 0; i--) {
      const [bx, by] = bezier(i / half);
      points.push([cx - bx * rx, joinY + by * curveHeight]);
    }
    // Kubah atas: dari titik sambung kiri, lewat puncak, ke titik sambung kanan
    const leftJoin = 3 * Math.PI - thetaJoin;
    const steps = Math.round(segments * 0.6);
    for (let i = 1; i < steps; i++) points.push(superPoint(leftJoin + ((thetaJoin - leftJoin) * i) / steps));
  }

  return (
    (warp ? points.map(warp) : points)
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${Math.min(y, baseY).toFixed(2)}`)
      .join(" ") + " Z"
  );
}

/**
 * Bentuk kelopak / jempol: sisi hampir sejajar, ujung atas membulat lebar
 * (misalnya telinga Capybara). Digambar tegak di titik (0, 0) = tengah pangkal,
 * ujung menghadap ke atas. Putar & geser lewat transform di tempat pemakaian.
 *
 * - height:    tinggi dari titik (0, 0) ke puncak ujung
 * - tipRadius: jari-jari ujung (makin besar makin tumpul & gemuk)
 * - sideAngle: kemiringan sisi kiri/kanan terhadap garis tengah, dalam derajat
 *              (0 = sisi sejajar, makin besar pangkal makin lebar dibanding ujung)
 * - baseLift:  sisi lurus berhenti setinggi ini di atas (0, 0)
 * - baseDepth: pangkal ditutup lengkung setengah elips sedalam ini ke bawah,
 *              jadi sudut pangkal membulat ke dalam (tidak menyembul di samping kepala)
 */
export function generatePetalPath(height, tipRadius, sideAngle, { baseLift = 0, baseDepth = 0 } = {}) {
  const a = (sideAngle * Math.PI) / 180;
  const centerY = -(height - tipRadius); // titik tengah lengkung ujung
  // Titik tempat sisi lurus menyambung ke lengkung ujung
  const joinX = tipRadius * Math.cos(a);
  const joinY = centerY - tipRadius * Math.sin(a);
  // Lebar setengah pangkal: sisi lurus diteruskan sampai y = -baseLift
  const baseX = joinX + (-joinY - baseLift) * Math.tan(a);
  const baseY = -baseLift;
  const f = (n) => n.toFixed(2);

  return [
    `M ${f(baseX)} ${f(baseY)}`,
    `L ${f(joinX)} ${f(joinY)}`,
    `A ${f(tipRadius)} ${f(tipRadius)} 0 0 0 ${f(-joinX)} ${f(joinY)}`,
    `L ${f(-baseX)} ${f(baseY)}`,
    baseDepth > 0
      ? `A ${f(baseX)} ${f(baseDepth)} 0 0 0 ${f(baseX)} ${f(baseY)} Z`
      : `Q 0 ${f(baseY + 0.35 * baseX)} ${f(baseX)} ${f(baseY)} Z`,
  ].join(" ");
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
