"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useCharacterTemplates } from "@/hooks/useCharacterTemplates";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/Editor/TopBar";
import { LeftSidebar } from "@/components/Editor/LeftSidebar";
import { CenterWorkspace } from "@/components/Editor/CenterWorkspace";
import { RightSidebar } from "@/components/Editor/RightSidebar";
import { ExportModal } from "@/components/Editor/ExportModal";
import { AnimationPlayerBar } from "@/components/Editor/AnimationPlayerBar";
import { getMochiMoodDuration, mochiMoods } from "@/characters/mochi/mochi.moods";
import { mochiConfig, mochiDefaultShape } from "@/characters/mochi/mochi.config";

// Mood dipertahankan kalau karakter punya mood itu; kalau tidak, pakai mood default karakter.
function pickMood(currentMood) {
  return mochiMoods.some((m) => m.id === currentMood) ? currentMood : mochiConfig.defaultMood;
}

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function EditorPage() {
  const mounted = useMounted();
  const { characters } = useCharacterTemplates();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentDurationMs, setCurrentDurationMs] = useState(() => getMochiMoodDuration(mochiConfig.defaultMood)); // State untuk menyimpan duration aktual dari AnimationPlayerBar

  // State Riwayat Undo / Redo
  const [history, setHistory] = useState([
    {
      selectedCharacterId: mochiConfig.id,
      config: {
        mood: mochiConfig.defaultMood,
        shapePreset: mochiDefaultShape,
        color: mochiConfig.defaultColor,
        backgroundColor: "#f5f5f7",
        isBgRemoved: false,
      },
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Ambil state aktif saat ini berdasarkan index riwayat
  const currentState = history[historyIndex] || history[0];
  const selectedCharacterId = currentState.selectedCharacterId;
  const config = currentState.config;

  // Fungsi untuk Menambahkan State Baru ke Riwayat
  const pushState = useCallback(
    (newCharacterId, newConfig) => {
      setHistory((prevHistory) => {
        // Hapus riwayat "future" jika ada perubahan baru setelah undo
        const updatedHistory = prevHistory.slice(0, historyIndex + 1);
        return [
          ...updatedHistory,
          {
            selectedCharacterId: newCharacterId,
            config: newConfig,
          },
        ];
      });
      setHistoryIndex((prevIndex) => prevIndex + 1);
    },
    [historyIndex]
  );

  // Handler Ganti Karakter
  const handleSelectCharacter = (id) => {
    const newConfig = {
      ...config,
      mood: pickMood(config.mood),
      shapePreset: mochiDefaultShape,
      color: mochiConfig.defaultColor,
    };
    pushState(id, newConfig);
  };

  // Handler Perubahan Config Customizer
  const handleConfigChange = (newConfig) => {
    pushState(selectedCharacterId, newConfig);
  };

  // Status ketersediaan Undo & Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Action Undo (Aman dari stale state)
  const handleUndo = useCallback(() => {
    setHistoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Action Redo (Selalu mengecek panjang riwayat terbaru)
  const handleRedo = useCallback(() => {
    setHistoryIndex((prev) => (prev < history.length - 1 ? prev + 1 : prev));
  }, [history.length]);

  // Listener Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Abaikan shortcut jika pengguna sedang mengetik di input teks, textarea, atau select
      const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        targetTag === "select" ||
        e.target.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl) {
        const key = e.key.toLowerCase();

        // Cmd/Ctrl + Shift + Z  => Redo
        // Cmd/Ctrl + Z          => Undo
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } 
        // Ctrl + Y              => Redo
        else if (key === "y") {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

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
      <TopBar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportClick={() => setIsExportOpen(true)}
      />

      <div className="flex-1 flex gap-2 overflow-hidden">
        <LeftSidebar
          selectedCharacterId={selectedCharacterId}
          onSelectCharacter={handleSelectCharacter}
          characters={characters}
        />

        {/* AREA TENGAH: CenterWorkspace + AnimationPlayerBar */}
        <div className="flex-1 flex flex-col gap-2 h-full min-h-0">
          <CenterWorkspace config={config} />
          
          <AnimationPlayerBar
            elementId="character-workspace"
            currentState={config.mood}
            onDurationChange={(duration) => setCurrentDurationMs(duration)} 
          />
        </div>

        <RightSidebar
          config={config}
          onConfigChange={handleConfigChange}
        />
        
      </div>

      {/* Modal Export Video */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={(options) => {
          console.log("Exporting video with options:", options);
        }}
        character={selectedCharacterId}
        config={config}
        durationMs={currentDurationMs}
      />
      
    </div>
  );
}