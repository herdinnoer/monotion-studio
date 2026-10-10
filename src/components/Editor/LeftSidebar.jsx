"use client";

import React from "react";
import { ToggleButton } from "@heroui/react";

export const LeftSidebar = ({ selectedCharacterId, onSelectCharacter, characters }) => {
  return (
    <aside className="w-[240px] h-full flex flex-col overflow-hidden bg-surface rounded-2xl border border-border shrink-0 select-none">
      <div className="p-4 border-b border-border shrink-0">
        <span className="font-semibold text-[14px] text-foreground">
          Characters
        </span>
      </div>

      {/* Grid 2 Kolom */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2.5 content-start">
        {characters.map((char) => (
          // Tampilan kartu diatur class "character-card" di globals.css (DESIGN.md bagian 8)
          <ToggleButton
            key={char.id}
            className="character-card"
            isSelected={selectedCharacterId === char.id}
            // Kartu yang sudah terpilih tidak bisa "dimatikan": klik ulang diabaikan
            onChange={(isSelected) => isSelected && onSelectCharacter(char.id)}
          >
            {/* Preview Karakter */}
            <div className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden p-1">
              <char.Component state={char.defaultMood} size={200} />
            </div>

            {/* Label Nama & Mood di Dalam Kartu */}
            <div className="mt-2 w-full">
              <div className="font-semibold text-xs text-foreground truncate">
                {char.name}
              </div>
              <div className="text-[11px] font-medium text-subtle">
                {char.moods.length} moods
              </div>
            </div>
          </ToggleButton>
        ))}
      </div>
    </aside>
  );
};
