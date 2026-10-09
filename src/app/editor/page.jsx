"use client";

import React, { useState, useEffect, useCallback, useReducer, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/Editor/TopBar";
import { LeftSidebar } from "@/components/Editor/LeftSidebar";
import { CenterWorkspace } from "@/components/Editor/CenterWorkspace";
import { RightSidebar } from "@/components/Editor/RightSidebar";
import { ExportModal } from "@/components/Editor/ExportModal";
import { AnimationPlayerBar } from "@/components/Editor/AnimationPlayerBar";
import {
  characters,
  getCharacter,
  getDefaultShape,
  getMoodDuration,
  pickMood,
} from "@/characters/registry";
import { loadSaved, save } from "@/lib/editorStorage";
import {
  canRedo,
  canUndo,
  createHistory,
  currentState,
  historyReducer,
} from "@/lib/editorHistory";
import { isTypingTarget } from "@/lib/keyboard";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function EditorPage() {
  const mounted = useMounted();
  const [isExportOpen, setIsExportOpen] = useState(false);
  // Pengaturan terakhir dari browser, dibaca SEKALI saat editor dibuka (sudah dirapikan
  // sanitizeState). Aman dibaca di sini karena editor baru tampil setelah "mounted".
  const [saved] = useState(() => loadSaved(characters));
  // Nama proyek: dipakai untuk nama file export. Tidak ikut undo/redo (keputusan K-10).
  const [projectName, setProjectName] = useState(saved.projectName);

  // Riwayat Undo / Redo: daftar langkah + posisi + draf pratinjau dalam SATU state
  // (lihat src/lib/editorHistory.js). Tiap langkah = satu paket kondisi (src/lib/editorState.js)
  const [history, dispatch] = useReducer(historyReducer, saved.state, createHistory);

  // Paket kondisi yang sedang tampil (draf kalau sedang digeser, kalau tidak langkah aktif)
  const editorState = currentState(history);
  const { characterId } = editorState;
  const character = getCharacter(characterId);

  // Langkah yang sudah disimpan (tanpa draf), supaya geser warna tidak ikut ditulis ke browser
  const committedState = history.entries[history.index];

  // Simpan ke browser 300ms setelah perubahan terakhir (bukan tiap gerakan / ketikan).
  // Penyimpanan darurat: langsung simpan saat tab disembunyikan atau halaman ditutup,
  // supaya perubahan dalam jeda 300ms itu tidak hilang.
  useEffect(() => {
    const flush = () => save({ state: committedState, projectName });
    const flushIfHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };

    const timer = setTimeout(flush, 300);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flushIfHidden);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flushIfHidden);
    };
  }, [committedState, projectName]);

  // Durasi 1 putaran mood, dihitung langsung dari registry
  const durationMs = getMoodDuration(character, editorState.mood);

  // Simpan satu langkah undo (langkah yang tidak mengubah apa-apa otomatis ditolak)
  const commitState = useCallback((next) => dispatch({ type: "commit", state: next }), []);
  // Ubah tampilan saja tanpa menambah langkah (misalnya selama color picker digeser)
  const previewState = useCallback((next) => dispatch({ type: "preview", state: next }), []);

  // Handler Ganti Karakter
  const handleSelectCharacter = (id) => {
    // Klik karakter yang sudah aktif: jangan reset warna & bentuk, jangan buat langkah undo
    if (id === characterId) return;

    const nextCharacter = getCharacter(id);
    commitState({
      ...editorState,
      characterId: nextCharacter.id,
      mood: pickMood(nextCharacter, editorState.mood),
      shapePreset: getDefaultShape(nextCharacter),
      color: nextCharacter.defaultColor,
    });
  };

  // Handler Perubahan Config Customizer
  const handleConfigChange = (newConfig) => {
    commitState({ ...newConfig, characterId });
  };
  const handleConfigPreview = (newConfig) => {
    previewState({ ...newConfig, characterId });
  };

  const handleUndo = useCallback(() => dispatch({ type: "undo" }), []);
  const handleRedo = useCallback(() => dispatch({ type: "redo" }), []);

  // Listener Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Di kolom ketik teks, Ctrl+Z milik browser (undo ketikan). Di slider, switch,
      // dan tombol, shortcut editor tetap jalan.
      if (isTypingTarget(e.target)) return;

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
        canUndo={canUndo(history)}
        canRedo={canRedo(history)}
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
          onConfigPreview={handleConfigPreview}
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