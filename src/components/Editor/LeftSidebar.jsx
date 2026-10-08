"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const LeftSidebar = ({ selectedCharacterId, onSelectCharacter, characters }) => {
  return (
    <aside className="w-[240px] h-full flex flex-col overflow-hidden bg-white dark:bg-[#161618] rounded-2xl border border-divider dark:shadow-xl shrink-0 select-none">
      <div className="p-4 border-b border-divider shrink-0">
        <span className="font-semibold text-[14px] text-foreground">
          Characters
        </span>
      </div>

      {/* Grid 2 Kolom */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2.5 content-start">
        {characters.map((char) => {
          const isSelected = selectedCharacterId === char.id;

          return (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className={cn(
                "flex flex-col p-2.5 rounded-xl transition-all text-left cursor-pointer focus:outline-none",
                isSelected
                  ? "bg-gray-200 dark:bg-[#252528] border-2 border-white/10 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-[#28282d] border-2 border-transparent"
              )}
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
                <div className="text-[11px] text-gray-500">
                  {char.moods.length} moods
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};