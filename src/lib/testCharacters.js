// Karakter tiruan untuk tes otomatis (Fase 2 A6).
// Registry asli tidak bisa dimuat Node (berisi komponen React dan alias `@/`),
// jadi tes memakai dua karakter kecil yang bentuknya sama dengan karakter asli.

export const covey = {
  id: "covey",
  name: "Covey",
  defaultColor: "#7C5CFF",
  defaultMood: "idle",
  moods: [{ id: "idle" }, { id: "happy" }],
};

export const capybara = {
  id: "capybara",
  name: "Capybara",
  defaultColor: "#C68B59",
  defaultMood: "happy",
  moods: [{ id: "happy" }, { id: "sleep" }],
  shapePresets: [{ id: "round" }, { id: "tall" }],
};

// Karakter pertama = karakter default (sama seperti registry).
export const testCharacters = [covey, capybara];
