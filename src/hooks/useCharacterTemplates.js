// src/hooks/useCharacterTemplates.js

import { useState } from "react";
import characterLib from "@/data/characters/characterLibrary.json";

const defaultCharacters = characterLib.characters;

export const useCharacterTemplates = () => {
  const [characters, setCharacters] = useState(defaultCharacters);
  const [loading] = useState(false);

  return {
    characters,
    setCharacters,
    loading,
  };
};
