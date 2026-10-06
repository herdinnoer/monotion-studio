"use client";

import React from "react";
import { coveyMoods } from "@/components/Characters/Covey/coveyMoods";
import { cn } from "@/lib/utils";
import { ColorInput } from "@/components/UI/ColorInput";
import { MOCHI_STATES } from "./LeftSidebar";
import { ChevronDown } from "lucide-react";
import { Switch } from "@heroui/react";

export const RightSidebar = ({ character, config, onConfigChange }) => {
  const moods = coveyMoods;
  const isMochi = character === "mochi";

  const handleMoodChange = (mood) => {
    onConfigChange({ ...config, mood });
  };

  const handleShapePresetChange = (shapePreset) => {
    onConfigChange({ ...config, shapePreset });
  };

  const handleColorChange = (color) => {
    onConfigChange({ ...config, color });
  };

  // Reset warna body karakter ke putih (#FFFFFF)
  const handleResetColor = () => {
    onConfigChange({ ...config, color: "#FFFFFF" });
  };

  const handleBgChange = (bgColor) => {
    onConfigChange({ ...config, backgroundColor: bgColor, isBgRemoved: false });
  };

  // Reset background ke putih (#FFFFFF)
  const handleResetBg = () => {
    onConfigChange({ ...config, backgroundColor: "#FFFFFF", isBgRemoved: false });
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
        "bg-white dark:bg-[#161618] rounded-2xl border border-divider dark:shadow-xl",
      )}
    >
      <div className="p-4 border-b border-divider shrink-0">
        <h2 className="font-semibold text-[14px]">Customizer</h2>
      </div>

      <div className="p-4 flex-1 space-y-6">
        {/* Shape Preset Section (For Mochi) */}
        {isMochi && (
          <>
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Shape Preset
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mochi", label: "Mochi" },
                  { id: "round", label: "Round" },
                  { id: "boxy", label: "Boxy" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleShapePresetChange(preset.id)}
                    className={cn(
                      "px-2 py-2 text-xs font-medium rounded-lg border transition-all text-center",
                      (config.shapePreset || "mochi") === preset.id
                        ? "bg-[#0E89F8] text-white border-blue-600 shadow-sm"
                        : "bg-[#ECECEF] dark:bg-[#212025] border-divider text-foreground hover:border-gray-400"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Divider antara Shape Preset & Mood */}
            <div className="border-t border-divider" />
          </>
        )}

        {/* Mood / Expression Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {isMochi ? "Mood / State (26)" : "Mood"}
          </h3>
          <div className="relative w-full">
            <select
              value={config.mood}
              onChange={(e) => handleMoodChange(e.target.value)}
              className={cn(
                "w-full pl-3 pr-9 py-2.5 rounded-lg border border-divider capitalize appearance-none",
                "bg-[#ECECEF] dark:bg-[#212025] text-[#111113] dark:text-gray-200",
                "text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E89F8]",
                "transition-all cursor-pointer",
              )}
            >
              {isMochi
                ? MOCHI_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))
                : Object.entries(moods).map(([key, mood]) => (
                    <option key={key} value={key}>
                      {mood.name} • {mood.description}
                    </option>
                  ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Divider antara Mood & Color */}
        <div className="border-t border-divider" />

        {/* Background Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Background
            </h3>
            <button
              type="button"
              onClick={handleResetBg}
              className="text-xs font-semibold text-[#0E89F8] hover:text-blue-600 cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>

          <ColorInput
            value={config.backgroundColor || "#FFFFFF"}
            onChange={handleBgChange}
            isDisabled={Boolean(config.isBgRemoved)}
          />

          <div className="flex items-center justify-between pt-1">
            <span
              onClick={() => handleToggleRemoveBg(!config.isBgRemoved)}
              className="text-xs font-semibold text-[#111113] dark:text-gray-200 cursor-pointer select-none"
            >
              Remove Background
            </span>
            <Switch
              isSelected={Boolean(config.isBgRemoved)}
              onChange={handleToggleRemoveBg}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
          </div>
        </div>

        {/* Divider antara Mood & Color */}
        <div className="border-t border-divider" />

        {/* Color Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Color
            </h3>
            <button
              type="button"
              onClick={handleResetColor}
              className="text-xs font-semibold text-[#0E89F8] hover:text-blue-600 cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>
          <ColorInput value={config.color || "#FFFFFF"} onChange={handleColorChange} />
        </div>
      </div>
    </aside>
  );
};