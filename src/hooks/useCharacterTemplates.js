// src/hooks/useCharacterTemplates.js

import { useState, useEffect } from "react";

export const useCharacterTemplates = () => {
  const [characters, setCharacters] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Import JSON files
      const characterLib = require("@/data/characters/characterLibrary.json");
      const characterTemps = require("@/data/characters/characterTemplates.json");

      setCharacters(characterLib.characters || []);
      setTemplates(characterTemps.templates || []);
    } catch (error) {
      console.error("Failed to load character data:", error);
      // Fallback data
      setCharacters([
        {
          id: "covey",
          name: "Covey",
          description: "Cute round mascot",
          thumbnail: "🟤",
          moods: 14,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    characters,
    templates,
    loading,
  };
};
