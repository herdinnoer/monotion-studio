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
import { Input, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { GlossyButton } from "@/components/UI/GlossyButton";
import { IconButton } from "@/components/UI/IconButton";

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
        "w-full h-16 px-4 transition-colors duration-150 ease-out",
        "bg-surface rounded-2xl border border-border",
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
            className="w-full h-10 object-contain rounded transition-[filter] duration-150 ease-out dark:invert-0 invert"
          />
        </div>

        {/* Tombol Projects & avatar disembunyikan sampai ada fitur akun (Fase 6, DESIGN.md bagian 9) */}

        {/* Tombol Undo & Redo */}
        <div className="flex items-center gap-1 border-l border-border pl-3">
          <IconButton
            label="Undo"
            tooltip="Undo (Ctrl+Z)"
            onPress={onUndo}
            isDisabled={!canUndo}
          >
            <Undo2 size={16} />
          </IconButton>
          <IconButton
            label="Redo"
            tooltip="Redo (Ctrl+Y)"
            onPress={onRedo}
            isDisabled={!canRedo}
          >
            <Redo2 size={16} />
          </IconButton>
        </div>
      </div>

      {/* Center: nama proyek (dipakai sebagai nama file export, tidak ikut undo) */}
      <div className="justify-self-center w-full max-w-[220px]">
        <Input
          fullWidth
          value={projectName}
          placeholder="Untitled"
          aria-label="Project name"
          onChange={(e) => onProjectNameChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="inline-field font-medium"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 justify-end">
        {/* Pengalih tema: segmented (gaya "segmented" di globals.css) */}
        <ToggleButtonGroup
          aria-label="Theme"
          className="segmented"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={theme ? [theme] : []}
          onSelectionChange={(keys) => {
            const [next] = keys;
            if (next) setTheme(next);
          }}
        >
          <ToggleButton id="light" isIconOnly size="sm" aria-label="Light mode">
            <Sun size={16} />
          </ToggleButton>
          <ToggleButton id="dark" isIconOnly size="sm" aria-label="Dark mode">
            <Moon size={16} />
          </ToggleButton>
        </ToggleButtonGroup>

        <GlossyButton onPress={onExportClick}>
          Export
        </GlossyButton>
      </div>
    </header>
  );
};