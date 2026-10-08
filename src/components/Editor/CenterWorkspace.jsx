"use client";

import React from "react";
import { MochiMaster } from "@/characters/mochi/MochiMaster";
import { mochiConfig, mochiDefaultShape, isMochiDefaultColor } from "@/characters/mochi/mochi.config";
import { cn } from "@/lib/utils";

export const CenterWorkspace = ({ config }) => {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col items-center justify-center overflow-hidden relative rounded-2xl p-8 transition-colors duration-200",
        "bg-[none] dark:bg-[none]",
        "bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)]",
        "[background-size:20px_20px]"
      )}
    >
      <div
        id="character-workspace"
        className="w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: config.isBgRemoved ? "transparent" : config.backgroundColor,
        }}
      >
        <MochiMaster
          state={config.mood || mochiConfig.defaultMood}
          shapePreset={config.shapePreset || mochiDefaultShape}
          color={isMochiDefaultColor(config.color) ? null : config.color}
          size={500}
        />
      </div>
    </main>
  );
};