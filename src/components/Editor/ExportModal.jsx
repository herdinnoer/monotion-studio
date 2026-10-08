"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlossyButton } from "@/components/UI/GlossyButton";
import {
  exportAsGif,
  exportAsSvg,
  exportAsWebm,
  copyReactComponent,
  exportAsLottieJson,
} from "@/lib/exportUtils";

export function ExportModal({ isOpen, onClose, character, config, durationMs, }) {
  const [format, setFormat] = useState("gif");
  const [resolution, setResolution] = useState("720p");
  const [frameRate, setFrameRate] = useState("60 fps");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleSelectFormat = (selectedFormat) => {
    setFormat(selectedFormat);
    if (selectedFormat === "gif" && resolution === "1080p") {
      setResolution("720p");
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgress(0);

      const baseFilename = `${character}-${config?.mood || "custom"}`;

      switch (format) {
        case "gif":
          await exportAsGif({
            elementId: "character-workspace",
            animationDuration: durationMs,
            resolution,
            frameRate,
            filename: `${baseFilename}.gif`,
            character,
            onProgress: (p) => setProgress(p),
          });
          onClose();
          break;

        case "svg":
          await exportAsSvg({
            elementId: "character-workspace",
            filename: `${baseFilename}.svg`,
          });
          onClose();
          break;

        case "webm":
          await exportAsWebm({
            elementId: "character-workspace",
            resolution,
            frameRate,
            filename: `${baseFilename}.webm`,
            character,
            onProgress: (p) => setProgress(p),
          });
          onClose();
          break;

        case "lottie":
          await exportAsLottieJson({
            elementId: "character-workspace",
            character,
            config,
            resolution,
            frameRate,
            filename: `${baseFilename}-lottie.json`,
            onProgress: (p) => setProgress(p),
          });
          onClose();
          break;

        case "react":
          await copyReactComponent({ character, config });
          alert("Kode komponen React berhasil disalin ke clipboard!");
          onClose();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Gagal melakukan export:", error);
      alert(`Gagal melakukan export: ${error?.message || "Silakan coba lagi."}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 5 Format utama khusus untuk Developer & Designer
  const formatList = [
    { id: "gif", label: "GIF" },
    { id: "svg", label: "SVG" },
    { id: "webm", label: "WebM" },
   // { id: "lottie", label: "Lottie" }, //
   // { id: "react", label: "React" }, //
  ];

  const availableResolutions =
    format === "webm"
      ? ["240p", "360p", "480p", "720p", "1080p"]
      : ["240p", "360p", "480p", "720p"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-white dark:bg-[#18181b] text-foreground border-b border-divider rounded-3xl p-6 shadow-2xl flex flex-col gap-6 select-none relative animate-in zoom-in-95 duration-200">
        
        {/* Header dengan Divider */}
        <div className="flex items-center justify-between pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-white/20 shrink-0">
          <h2 className="text-base font-bold text-foreground tracking-wide">
            Export
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Export (Side-by-side) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Format</span>
          <div className="flex bg-[#ECECEF] dark:bg-[#232328] p-1 rounded-xl border border-gray-200 dark:border-white/10 gap-1">
            {formatList.map((item) => (
              <button
                type="button"
                key={item.id}
                disabled={isExporting}
                onClick={() => handleSelectFormat(item.id)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                  format === item.id
                    ? "bg-white dark:bg-[#323238] text-foreground dark:text-white shadow-sm font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution (Tampil Saat Format GIF, WebM, atau Lottie) */}
        {(format === "gif" || format === "webm" || format === "lottie") && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Resolution</span>
            <div className="flex bg-[#ECECEF] dark:bg-[#232328] p-1 rounded-xl border border-gray-200 dark:border-white/10 gap-1">
              {availableResolutions.map((res) => (
                <button
                  type="button"
                  key={res}
                  disabled={isExporting}
                  onClick={() => setResolution(res)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                    resolution === res
                      ? "bg-white dark:bg-[#323238] text-foreground dark:text-white shadow-sm font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-white"
                  )}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frame Rate (Tampil Saat Format GIF, WebM, atau Lottie) */}
        {(format === "gif" || format === "webm" || format === "lottie") && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Frame rate</span>
            <div className="flex bg-[#ECECEF] dark:bg-[#232328] p-1 rounded-xl border border-gray-200 dark:border-white/10 gap-1">
              {["30 fps", "60 fps"].map((fps) => (
                <button
                  type="button"
                  key={fps}
                  disabled={isExporting}
                  onClick={() => setFrameRate(fps)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                    frameRate === fps
                      ? "bg-white dark:bg-[#323238] text-foreground dark:text-white shadow-sm font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-white"
                  )}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Indikator Progress */}
        {isExporting && (format === "gif" || format === "webm" || format === "lottie") && (
          <div className="w-full bg-[#ECECEF] dark:bg-[#232328] rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-blue-500" /> Rendering {format.toUpperCase()}...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          
          <GlossyButton
            colorScheme="blue"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting
              ? "Exporting..."
              : format === "react"
              ? "Copy Code"
              : "Export"}
          </GlossyButton>
        </div>

      </div>
    </div>
  );
}