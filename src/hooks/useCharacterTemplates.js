// src/hooks/useCharacterTemplates.js

import { useState } from "react";
import characterLib from "@/data/characters/characterLibrary.json";
import characterTemps from "@/data/characters/characterTemplates.json";

const defaultCharacters = characterLib?.characters || [
  {
    id: "covey",
    name: "Covey",
    description: "Cute round mascot",
    thumbnail: "🟤",
    moods: 14,
  },
];

const defaultTemplates = characterTemps?.templates || [];

export const useCharacterTemplates = () => {
  const [characters, setCharacters] = useState(defaultCharacters);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [loading] = useState(false);

  return {
    characters,
    setCharacters,
    templates,
    setTemplates,
    loading,
  };
};
