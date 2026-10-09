"use client";

import React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
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
        "bg-surface rounded-2xl border border-border dark:shadow-xl",
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

        {/* Tombol Projects & avatar disembunyikan sampai ada fitur akun (Fase 6, DESIGN.md bagian 9) */}

        {/* Tombol Undo & Redo */}
        <div className="flex items-center gap-1 border-l border-border pl-3">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z / Cmd+Z)"
            className={cn(
              "p-2 rounded-lg transition-all text-foreground",
              canUndo
                ? "hover:bg-surface-secondary cursor-pointer"
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
                ? "hover:bg-surface-secondary cursor-pointer"
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
            "hover:bg-surface-secondary focus:bg-surface-secondary",
            "focus:outline-none focus:ring-1 focus:ring-focus transition-all cursor-text",
          )}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center bg-surface-secondary dark:bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              theme === "light"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              theme === "dark"
                ? "bg-surface-hover text-foreground shadow"
                : "text-muted hover:text-foreground",
            )}
          >
            <Moon size={16} />
          </button>
        </div>

        <GlossyButton onPress={onExportClick}>
          Export
        </GlossyButton>
      </div>
    </header>
  );
};