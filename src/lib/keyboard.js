// Cek elemen yang sedang fokus, dipakai shortcut keyboard editor (Fase 2 A3).

// Input yang BUKAN kolom ketik (slider, switch, checkbox, tombol, dll).
const NON_TEXT_INPUTS = new Set([
  "range",
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "color",
  "file",
  "image",
]);

// Kolom ketik teks: di sini Ctrl+Z milik browser (undo ketikan), bukan milik editor.
export function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === "textarea") return true;
  if (tag === "input") return !NON_TEXT_INPUTS.has((el.type || "text").toLowerCase());
  return false;
}

const PRESSABLE_ROLES = new Set([
  "button",
  "switch",
  "checkbox",
  "radio",
  "option",
  "menuitem",
  "tab",
  "combobox",
  "link",
]);

// Elemen yang sudah punya aksi sendiri untuk tombol spasi (tombol, select, switch, dll).
export function isPressableTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "button" || tag === "select" || tag === "summary") return true;
  if (tag === "a" && el.hasAttribute("href")) return true;
  if (tag === "input" && ["checkbox", "radio", "button", "submit", "reset"].includes(el.type)) {
    return true;
  }
  return PRESSABLE_ROLES.has(el.getAttribute("role"));
}
