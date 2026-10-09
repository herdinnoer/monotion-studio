"use client";

import React from "react";
import { getCharacter, getDefaultShape, isDefaultColor } from "@/characters/registry";
import { cn } from "@/lib/utils";

export const CenterWorkspace = ({ characterId, config }) => {
  const character = getCharacter(characterId);
  const CharacterComponent = character.Component;

  return (
    <main
      className={cn(
        "flex-1 flex flex-col items-center justify-center overflow-hidden relative rounded-2xl p-8 transition-colors duration-200",
        "bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)]",
        "[background-size:20px_20px]"
      )}
    >
      {/* Remove Background aktif: area karakter transparan, pola titik kanvas terlihat (K-4) */}
      <div
        id="character-workspace"
        className="w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: config.isBgRemoved ? "transparent" : config.backgroundColor,
        }}
      >
        <CharacterComponent
          state={config.mood || character.defaultMood}
          shapePreset={config.shapePreset || getDefaultShape(character)}
          color={isDefaultColor(character, config.color) ? null : config.color}
          size={500}
        />
      </div>
    </main>
  );
};