"use client";

import React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Folder,
  Undo2,
  Redo2,
  Sun,
  Moon,
} from "lucide-react";
import { GlossyButton } from "@/components/UI/GlossyButton";

export const TopBar = ({
  projectName = "",
  onProjectNameChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onExportClick,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "w-full h-16 px-4 transition-colors duration-200",
        "bg-white dark:bg-[#111113] rounded-2xl border border-divider dark:shadow-xl",
        "grid grid-cols-3 items-center",
        "text-sm text-foreground",
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3 justify-start">
        <div className="flex items-center">
          <img
            src="/logo-monotion.png"
            alt="Monotion Logo"
            className="w-full h-10 object-contain rounded transition-all duration-200 dark:invert-0 invert"
          />
        </div>

        <div className="flex items-center border-l border-divider pl-3 px-1">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525] hover:text-foreground transition-all text-foreground cursor-pointer">
            <Folder size={16} />
            <span>Projects</span>
          </button>
        </div>

        {/* Tombol Undo & Redo */}
        <div className="flex items-center gap-1 border-l border-divider pl-3">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z / Cmd+Z)"
            className={cn(
              "p-2 rounded-lg transition-all text-foreground",
              canUndo
                ? "hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y / Cmd+Shift+Z)"
            className={cn(
              "p-2 rounded-lg transition-all text-foreground",
              canRedo
                ? "hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Center */}
      <div className="justify-self-center w-full max-w-[220px]">
        <input
          type="text"
          value={projectName}
          placeholder="Untitled"
          aria-label="Nama proyek"
          onChange={(e) => onProjectNameChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className={cn(
            "w-full px-3 py-1.5 rounded-lg text-center font-medium text-foreground bg-transparent",
            "hover:bg-gray-100 dark:hover:bg-[#252525] focus:bg-gray-100 dark:focus:bg-[#252525]",
            "focus:outline-none focus:ring-1 focus:ring-[#0E89F8] transition-all cursor-text",
          )}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center bg-gray-100 dark:bg-[#19191c] border border-divider rounded-lg p-1">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              theme === "light"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-400 hover:text-foreground",
            )}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              theme === "dark"
                ? "bg-[#353535] text-white shadow"
                : "text-gray-400 hover:text-foreground",
            )}
          >
            <Moon size={16} />
          </button>
        </div>

        <GlossyButton colorScheme="blue" onClick={onExportClick}>
          Export
        </GlossyButton>

        <div className="w-9 h-9 bg-orange-500 rounded-full overflow-hidden border border-divider">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Herdin"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};