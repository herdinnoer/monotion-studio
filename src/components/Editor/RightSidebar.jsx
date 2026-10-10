"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ColorInput } from "@/components/UI/ColorInput";
import { getCharacter, getDefaultShape } from "@/characters/registry";
import { DEFAULT_BACKGROUND } from "@/lib/editorState";
import { ChevronDown } from "lucide-react";
import { Label, ListBox, Select, Switch, ToggleButton, ToggleButtonGroup } from "@heroui/react";

// onConfigChange  = simpan satu langkah undo
// onConfigPreview = ubah tampilan saja (dipakai selama color picker digeser)
export const RightSidebar = ({ characterId, config, onConfigChange, onConfigPreview }) => {
  const character = getCharacter(characterId);
  const shapePresets = character.shapePresets ?? [];

  const handleMoodChange = (mood) => {
    onConfigChange({ ...config, mood });
  };

  const handleShapePresetChange = (shapePreset) => {
    onConfigChange({ ...config, shapePreset });
  };

  const handleColorPreview = (color) => {
    onConfigPreview({ ...config, color });
  };

  const handleColorChange = (color) => {
    onConfigChange({ ...config, color });
  };

  // Reset warna body karakter ke warna dasar awal karakter
  const handleResetColor = () => {
    onConfigChange({ ...config, color: character.defaultColor });
  };

  const handleBgPreview = (bgColor) => {
    onConfigPreview({ ...config, backgroundColor: bgColor, isBgRemoved: false });
  };

  const handleBgChange = (bgColor) => {
    onConfigChange({ ...config, backgroundColor: bgColor, isBgRemoved: false });
  };

  // Reset background ke background default karakter (sama dengan saat editor dibuka)
  const handleResetBg = () => {
    onConfigChange({ ...config, backgroundColor: DEFAULT_BACKGROUND, isBgRemoved: false });
  };

  // Toggle Remove Background
  const handleToggleRemoveBg = (val) => {
    const isChecked = typeof val === "boolean" ? val : !config.isBgRemoved;
    onConfigChange({ ...config, isBgRemoved: isChecked });
  };

  return (
    <aside
      className={cn(
        "w-[290px] h-full flex flex-col overflow-y-auto custom-scrollbar text-sm",
        "bg-surface rounded-2xl border border-border",
      )}
    >
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-[14px]">Customizer</h2>
      </div>

      <div className="p-4 flex-1 space-y-6">
        {/* Shape Preset Section (hanya kalau karakter punya pilihan bentuk) */}
        {shapePresets.length > 0 && (
        <>
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted">
            Shape Preset
          </h3>
          {/* Segmented (gaya "segmented" di globals.css). Pilihan baru = satu langkah undo */}
          <ToggleButtonGroup
            aria-label="Shape preset"
            className="segmented"
            fullWidth
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[config.shapePreset || getDefaultShape(character)]}
            onSelectionChange={(keys) => {
              const [next] = keys;
              if (next) handleShapePresetChange(next);
            }}
          >
            {shapePresets.map((preset) => (
              <ToggleButton key={preset.id} id={preset.id}>
                {preset.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        {/* Divider antara Shape Preset & Mood */}
        <div className="border-t border-border" />
        </>
        )}

        {/* Mood / Expression Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted">
            Mood / State ({character.moods.length})
          </h3>
          {/* Select HeroUI. Pilih mood lain = satu langkah undo; mood yang sama
              tidak menambah langkah (ditolak di editorHistory). */}
          <Select
            aria-label="Mood"
            variant="secondary"
            fullWidth
            value={config.mood}
            onChange={(next) => {
              if (next) handleMoodChange(next);
            }}
          >
            <Select.Trigger>
              <Select.Value className="capitalize" />
              <Select.Indicator>
                <ChevronDown size={14} />
              </Select.Indicator>
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {character.moods.map((mood) => (
                  <ListBox.Item
                    key={mood.id}
                    id={mood.id}
                    textValue={mood.label}
                    className="capitalize"
                  >
                    {mood.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Divider antara Mood & Color */}
        <div className="border-t border-border" />

        {/* Background Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              Background
            </h3>
            <button
              type="button"
              onClick={handleResetBg}
              className="text-xs font-semibold text-accent hover:text-accent-hover cursor-pointer transition-colors duration-150 ease-out"
            >
              Reset
            </button>
          </div>

          <ColorInput
            value={config.backgroundColor || DEFAULT_BACKGROUND}
            onChange={handleBgPreview}
            onChangeEnd={handleBgChange}
            isDisabled={Boolean(config.isBgRemoved)}
          />

          {/* Label di dalam Switch.Content: klik teks ikut menyalakan switch & terbaca screen reader */}
          <Switch
            className="w-full pt-1"
            isSelected={Boolean(config.isBgRemoved)}
            onChange={handleToggleRemoveBg}
          >
            <Switch.Content className="w-full justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Remove Background
              </Label>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        {/* Divider antara Mood & Color */}
        <div className="border-t border-border" />

        {/* Color Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              Color
            </h3>
            <button
              type="button"
              onClick={handleResetColor}
              className="text-xs font-semibold text-accent hover:text-accent-hover cursor-pointer transition-colors duration-150 ease-out"
            >
              Reset
            </button>
          </div>
          <ColorInput
            value={config.color || character.defaultColor}
            onChange={handleColorPreview}
            onChangeEnd={handleColorChange}
          />
        </div>
      </div>
    </aside>
  );
};