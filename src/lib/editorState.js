// "Paket kondisi" editor: semua yang mendefinisikan hasil karya user.
//   { characterId, mood, shapePreset, color, backgroundColor, isBgRemoved }
//
// File ini hanya berisi fungsi murni (tanpa React, tanpa registry, tanpa alias `@/`),
// supaya bisa dites langsung dengan `node --test` (Fase 2 A6).
// Daftar karakter selalu dikirim dari luar sebagai parameter.

// Background default KARAKTER (bagian hasil karya, ikut export).
// Jangan tertukar dengan token `bg-app` (#F5F5F7) di DESIGN.md, itu latar UI editor.
export const DEFAULT_BACKGROUND = "#FFFFFF";

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value) {
  return typeof value === "string" && HEX_COLOR.test(value);
}

// Bentuk badan awal karakter (null kalau karakter tidak punya pilihan bentuk).
export function getDefaultShape(character) {
  return character.shapePresets?.[0]?.id ?? null;
}

// Mood dipertahankan kalau karakter punya mood itu; kalau tidak, pakai mood default karakter.
export function pickMood(character, moodId) {
  return character.moods.some((m) => m.id === moodId) ? moodId : character.defaultMood;
}

// Paket awal untuk satu karakter.
export function createInitialState(character) {
  return {
    characterId: character.id,
    mood: character.defaultMood,
    shapePreset: getDefaultShape(character),
    color: character.defaultColor,
    backgroundColor: DEFAULT_BACKGROUND,
    isBgRemoved: false,
  };
}

// Rapikan paket dari luar (misalnya localStorage). Nilai yang tidak valid diganti default,
// jadi hasilnya selalu paket yang aman dipakai editor.
export function sanitizeState(raw, characters) {
  const fallback = characters[0];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createInitialState(fallback);
  }

  const character = characters.find((c) => c.id === raw.characterId) ?? fallback;
  const shapeIds = (character.shapePresets ?? []).map((s) => s.id);

  return {
    characterId: character.id,
    mood: pickMood(character, raw.mood),
    shapePreset: shapeIds.includes(raw.shapePreset) ? raw.shapePreset : getDefaultShape(character),
    color: isHexColor(raw.color) ? raw.color : character.defaultColor,
    backgroundColor: isHexColor(raw.backgroundColor) ? raw.backgroundColor : DEFAULT_BACKGROUND,
    isBgRemoved: raw.isBgRemoved === true,
  };
}

// Dua paket dianggap sama kalau semua isinya sama (huruf besar/kecil warna diabaikan).
export function isSameState(a, b) {
  return (
    a.characterId === b.characterId &&
    a.mood === b.mood &&
    a.shapePreset === b.shapePreset &&
    String(a.color).toLowerCase() === String(b.color).toLowerCase() &&
    String(a.backgroundColor).toLowerCase() === String(b.backgroundColor).toLowerCase() &&
    a.isBgRemoved === b.isBgRemoved
  );
}

// Simbol yang dilarang di nama file Windows/macOS, spasi, dan emoji → diganti strip.
const UNSAFE_CHARS = /[/\\:*?"<>|\s\p{Extended_Pictographic}\p{Cc}‍️]+/gu;

function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(UNSAFE_CHARS, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Nama file export TANPA ekstensi (keputusan K-2 & K-9).
//   "Kopi Pagi"  → "kopi-pagi"
//   "Kopi/Pagi?" → "kopi-pagi"
//   kosong       → "<karakter>-<mood>", misalnya "capybara-happy"
export function exportFilename({ projectName, characterName, mood }) {
  return slugify(projectName) || slugify(`${characterName} ${mood}`) || "monotion";
}
