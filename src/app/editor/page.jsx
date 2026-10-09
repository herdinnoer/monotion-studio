"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/Editor/TopBar";
import { LeftSidebar } from "@/components/Editor/LeftSidebar";
import { CenterWorkspace } from "@/components/Editor/CenterWorkspace";
import { RightSidebar } from "@/components/Editor/RightSidebar";
import { ExportModal } from "@/components/Editor/ExportModal";
import { AnimationPlayerBar } from "@/components/Editor/AnimationPlayerBar";
import {
  characters,
  defaultCharacter,
  getCharacter,
  getDefaultShape,
  getMoodDuration,
  pickMood,
} from "@/characters/registry";
import { createInitialState } from "@/lib/editorState";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function EditorPage() {
  const mounted = useMounted();
  const [isExportOpen, setIsExportOpen] = useState(false);
  // Nama proyek: dipakai untuk nama file export. Tidak ikut undo/redo (keputusan K-10).
  const [projectName, setProjectName] = useState("");

  // Riwayat Undo / Redo. Tiap isi = satu paket kondisi (lihat src/lib/editorState.js)
  const [history, setHistory] = useState(() => [createInitialState(defaultCharacter)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Paket kondisi yang sedang aktif
  const editorState = history[historyIndex] || history[0];
  const { characterId } = editorState;
  const character = getCharacter(characterId);

  // Durasi 1 putaran mood, dihitung langsung dari registry
  const durationMs = getMoodDuration(character, editorState.mood);

  // Fungsi untuk Menambahkan State Baru ke Riwayat
  const pushState = useCallback(
    (newState) => {
      setHistory((prevHistory) => {
        // Hapus riwayat "future" jika ada perubahan baru setelah undo
        const updatedHistory = prevHistory.slice(0, historyIndex + 1);
        return [...updatedHistory, newState];
      });
      setHistoryIndex((prevIndex) => prevIndex + 1);
    },
    [historyIndex]
  );

  // Handler Ganti Karakter
  const handleSelectCharacter = (id) => {
    // Klik karakter yang sudah aktif: jangan reset warna & bentuk, jangan buat langkah undo
    if (id === characterId) return;

    const nextCharacter = getCharacter(id);
    pushState({
      ...editorState,
      characterId: nextCharacter.id,
      mood: pickMood(nextCharacter, editorState.mood),
      shapePreset: getDefaultShape(nextCharacter),
      color: nextCharacter.defaultColor,
    });
  };

  // Handler Perubahan Config Customizer
  const handleConfigChange = (newConfig) => {
    pushState({ ...newConfig, characterId });
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
        projectName={projectName}
        onProjectNameChange={setProjectName}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportClick={() => setIsExportOpen(true)}
      />

      <div className="flex-1 flex gap-2 overflow-hidden">
        <LeftSidebar
          selectedCharacterId={characterId}
          onSelectCharacter={handleSelectCharacter}
          characters={characters}
        />

        {/* AREA TENGAH: CenterWorkspace + AnimationPlayerBar */}
        <div className="flex-1 flex flex-col gap-2 h-full min-h-0">
          <CenterWorkspace characterId={characterId} config={editorState} />

          <AnimationPlayerBar
            elementId="character-workspace"
            durationMs={durationMs}
          />
        </div>

        <RightSidebar
          characterId={characterId}
          config={editorState}
          onConfigChange={handleConfigChange}
        />
        
      </div>

      {/* Modal Export Video */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        character={characterId}
        characterName={character.name}
        projectName={projectName}
        config={editorState}
        durationMs={durationMs}
      />
      
    </div>
  );
}