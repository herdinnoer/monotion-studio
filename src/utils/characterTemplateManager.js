// src/utils/characterTemplateManager.js

import characterLibraryData from "@/data/characters/characterLibrary.json";
import characterTemplatesData from "@/data/characters/characterTemplates.json";

export class CharacterTemplateManager {
  constructor() {
    this.library = characterLibraryData.characters;
    this.templates = characterTemplatesData.templates;
    this.loadCustomTemplates();
  }

  // Get all characters
  getAllCharacters() {
    return this.library;
  }

  // Get character by ID
  getCharacter(characterId) {
    return this.library.find((c) => c.id === characterId);
  }

  // Get templates for character
  getCharacterTemplates(characterId) {
    return this.templates.filter((t) => t.characterId === characterId);
  }

  // Get template by ID
  getTemplate(templateId) {
    return this.templates.find((t) => t.id === templateId);
  }

  // Save custom template
  saveTemplate(template) {
    const newTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      saved: true,
    };
    this.templates.push(newTemplate);
    this.persistTemplates();
    return newTemplate;
  }

  // Load from localStorage
  loadCustomTemplates() {
    try {
      const stored = localStorage.getItem("monotion_character_templates");
      if (stored) {
        const customTemplates = JSON.parse(stored);
        this.templates = [...this.templates, ...customTemplates];
      }
    } catch (error) {
      console.error("Failed to load custom templates:", error);
    }
  }

  // Persist to localStorage
  persistTemplates() {
    try {
      const customTemplates = this.templates.filter((t) => t.saved);
      localStorage.setItem(
        "monotion_character_templates",
        JSON.stringify(customTemplates),
      );
    } catch (error) {
      console.error("Failed to persist templates:", error);
    }
  }
}

export const characterTemplateManager = new CharacterTemplateManager();
