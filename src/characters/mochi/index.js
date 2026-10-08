// "Kartu identitas" Mochi: semua yang editor perlu tahu tentang Mochi.
// Didaftarkan di src/characters/registry.js.

import { mochiConfig } from "./mochi.config";
import { mochiMoods } from "./mochi.moods";
import { MochiMaster } from "./MochiMaster";

const mochi = {
  ...mochiConfig,
  moods: mochiMoods,
  Component: MochiMaster,
};

export default mochi;
