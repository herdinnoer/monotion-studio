// src/app/editor/page.jsx (REPLACE COMPLETELY)

"use client";

import React, { useState, useEffect } from "react";
import { CoveyCharacter } from "@/components/Characters/Covey/CoveyCharacter";
import { coveyMoods } from "@/components/Characters/Covey/coveyMoods";
import { useCharacterTemplates } from "@/hooks/useCharacterTemplates";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Folder,
  Undo2,
  Redo2,
  Sun,
  Moon,
  ChevronDown,
  Shuffle,
} from "lucide-react";
import { GlossyButton } from "@/components/UI/GlossyButton";
import { ColorInput } from "@/components/UI/ColorInput";

// ===== TOP BAR =====
const TopBar = () => {
  const { theme, setTheme } = useTheme();
  const [projectName, setProjectName] = useState("My Character");

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
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525] hover:text-foreground transition-all text-foreground">
            <Folder size={16} />
            <span>Projects</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-divider pl-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525] hover:text-foreground transition-all text-foreground">
            <Undo2 size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525] hover:text-foreground transition-all text-foreground">
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Center */}
      <div className="justify-self-center w-full max-w-[220px]">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={() => {
            if (!projectName.trim()) setProjectName("My Character");
          }}
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
              "p-1.5 rounded-md transition-all",
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
              "p-1.5 rounded-md transition-all",
              theme === "dark"
                ? "bg-[#353535] text-white shadow"
                : "text-gray-400 hover:text-foreground",
            )}
          >
            <Moon size={16} />
          </button>
        </div>

        <GlossyButton colorScheme="blue">Export</GlossyButton>

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

// ===== LEFT SIDEBAR - CHARACTER LIBRARY =====
const LeftSidebar = ({ selectedCharacterId, onSelectCharacter, characters }) => {
  return (
    <aside className="w-[200px] h-full flex flex-col overflow-hidden bg-white dark:bg-[#161618] rounded-2xl border border-divider dark:shadow-xl">
      <div className="p-4 border-b border-divider shrink-0">
        <span className="font-semibold text-[14px] text-foreground">
          Characters
        </span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelectCharacter(char.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left",
              selectedCharacterId === char.id
                ? "bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800"
                : "hover:bg-gray-100 dark:hover:bg-[#252525]",
            )}
          >
            <span className="text-2xl">{char.thumbnail}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{char.name}</div>
              <div className="text-xs text-gray-500">{char.moods} moods</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

// ===== CENTER WORKSPACE - PREVIEW =====
const CenterWorkspace = ({ character, config }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center overflow-hidden relative bg-white dark:bg-[#111113] rounded-2xl border border-divider dark:shadow-xl p-8">
      <div
        className="w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <CoveyCharacter
          mood={config.mood}
          color={config.color}
          text={config.text}
          size={350}
          showText={true}
        />
      </div>
    </main>
  );
};

// ===== RIGHT SIDEBAR - CUSTOMIZER =====
const RightSidebar = ({ character, config, onConfigChange }) => {
  const moods = coveyMoods;

  const handleMoodChange = (mood) => {
    onConfigChange({ ...config, mood });
  };

  const handleColorChange = (color) => {
    onConfigChange({ ...config, color });
  };

  const handleTextChange = (text) => {
    onConfigChange({ ...config, text });
  };

  const handleBgChange = (bgColor) => {
    onConfigChange({ ...config, backgroundColor: bgColor });
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
        {/* Mood Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Mood
          </h3>
          <select
            value={config.mood}
            onChange={(e) => handleMoodChange(e.target.value)}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border border-divider",
              "bg-[#ECECEF] dark:bg-[#212025] text-[#111113] dark:text-gray-200",
              "text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E89F8]",
              "transition-all cursor-pointer",
            )}
          >
            {Object.entries(moods).map(([key, mood]) => (
              <option key={key} value={key}>
                {mood.name} • {mood.description}
              </option>
            ))}
          </select>
        </div>

        {/* Color Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Color
          </h3>
          <ColorInput value={config.color} onChange={handleColorChange} />
        </div>

        {/* Text Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Text
          </h3>
          <input
            type="text"
            value={config.text}
            onChange={(e) => handleTextChange(e.target.value)}
            maxLength={40}
            placeholder="Enter text..."
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border border-divider",
              "bg-[#ECECEF] dark:bg-[#212025] text-[#111113] dark:text-gray-200",
              "text-xs focus:outline-none focus:ring-2 focus:ring-[#0E89F8]",
              "transition-all",
            )}
          />
          <small className="text-gray-500 dark:text-gray-400 text-[11px]">
            {config.text.length}/40 characters
          </small>
        </div>

        {/* Background Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Background
          </h3>
          <ColorInput
            value={config.backgroundColor}
            onChange={handleBgChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-divider space-y-2">
          <button className="w-full px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">
            Save as Template
          </button>
          <button className="w-full px-3 py-2.5 bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#353535] text-gray-900 dark:text-gray-100 text-xs font-semibold rounded-lg transition-colors">
            Export as GIF
          </button>
          <button className="w-full px-3 py-2.5 bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#353535] text-gray-900 dark:text-gray-100 text-xs font-semibold rounded-lg transition-colors">
            Copy Component
          </button>
        </div>
      </div>
    </aside>
  );
};

// ===== MAIN PAGE =====
export default function EditorPage() {
  const [mounted, setMounted] = useState(false);
  const { characters } = useCharacterTemplates();
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    characters[0]?.id || "covey",
  );

  const [config, setConfig] = useState({
    mood: "idle",
    color: "#ffffff",
    text: "Hello!",
    backgroundColor: "#f5f5f7",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen w-screen bg-[#F5F5F7] dark:bg-[#1C1C1E]" />;
  }

  return (
    <div
      className={cn(
        "h-screen w-screen p-2 flex flex-col gap-2 overflow-hidden transition-colors duration-200",
        "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-foreground font-sans select-none",
      )}
    >
      <TopBar />

      <div className="flex-1 flex gap-2 overflow-hidden">
        <LeftSidebar
          selectedCharacterId={selectedCharacterId}
          onSelectCharacter={setSelectedCharacterId}
          characters={characters}
        />

        <CenterWorkspace
          character={selectedCharacterId}
          config={config}
        />

        <RightSidebar
          character={selectedCharacterId}
          config={config}
          onConfigChange={setConfig}
        />
      </div>
    </div>
  );
}