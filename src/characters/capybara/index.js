// "Kartu identitas" Capybara: semua yang editor perlu tahu tentang Capybara.
// Didaftarkan di src/characters/registry.js.

import { capybaraConfig } from "./capybara.config";
import { capybaraMoods } from "./capybara.moods";
import { CapybaraMaster } from "./CapybaraMaster";

const capybara = {
  ...capybaraConfig,
  moods: capybaraMoods,
  Component: CapybaraMaster,
};

export default capybara;
