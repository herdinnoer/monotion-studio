"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Alert } from "@heroui/react";
import { cn } from "@/lib/utils";
import { GlossyButton } from "@/components/UI/GlossyButton";
import {
  exportAsGif,
  exportAsSvg,
  exportAsWebm,
  copyReactComponent,
  exportAsLottieJson,
  supportsTransparentWebm,
} from "@/lib/exportUtils";
import { DEFAULT_BACKGROUND, exportFilename } from "@/lib/editorState";

export function ExportModal({ isOpen, onClose, character, characterName, projectName, config, durationMs }) {
  const [format, setFormat] = useState("gif");
  const [resolution, setResolution] = useState("720p");
  const [frameRate, setFrameRate] = useState("60 fps");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  // null = belum dicek, true/false = browser bisa/tidak menyimpan WebM transparan
  const [canWebmAlpha, setCanWebmAlpha] = useState(null);

  const isBgRemoved = Boolean(config?.isBgRemoved);
  const needsAlphaCheck = isOpen && format === "webm" && isBgRemoved;

  useEffect(() => {
    if (!needsAlphaCheck) return;
    let isCancelled = false;
    supportsTransparentWebm().then((supported) => {
      if (!isCancelled) setCanWebmAlpha(supported);
    });
    return () => {
      isCancelled = true;
    };
  }, [needsAlphaCheck]);

  if (!isOpen) return null;

  const fallbackBackground = (config?.backgroundColor || DEFAULT_BACKGROUND).toUpperCase();

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

      // Nama file dari nama proyek; kalau kosong pakai "<karakter>-<mood>" (keputusan K-2 & K-9)
      const baseFilename = exportFilename({ projectName, characterName, mood: config?.mood });

      switch (format) {
        case "gif":
          await exportAsGif({
            elementId: "character-workspace",
            animationDuration: durationMs,
            resolution,
            frameRate,
            filename: `${baseFilename}.gif`,
            character,
            config,
            onProgress: (p) => setProgress(p),
          });
          onClose();
          break;

        case "svg":
          await exportAsSvg({
            elementId: "character-workspace",
            filename: `${baseFilename}.svg`,
            config,
          });
          onClose();
          break;

        case "webm":
          await exportAsWebm({
            elementId: "character-workspace",
            animationDuration: durationMs,
            resolution,
            frameRate,
            filename: `${baseFilename}.webm`,
            character,
            config,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-surface text-foreground border-b border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-6 select-none relative animate-in zoom-in-95 duration-200">
        
        {/* Header dengan Divider */}
        <div className="flex items-center justify-between pb-4 -mx-6 px-6 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground tracking-wide">
            Export
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Export (Side-by-side) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted">Format</span>
          <div className="flex bg-surface-secondary p-1 rounded-xl border border-border gap-1">
            {formatList.map((item) => (
              <button
                type="button"
                key={item.id}
                disabled={isExporting}
                onClick={() => handleSelectFormat(item.id)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                  format === item.id
                    ? "bg-surface dark:bg-surface-hover text-foreground shadow-sm font-bold"
                    : "text-muted hover:text-foreground"
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
            <span className="text-xs font-semibold text-muted">Resolution</span>
            <div className="flex bg-surface-secondary p-1 rounded-xl border border-border gap-1">
              {availableResolutions.map((res) => (
                <button
                  type="button"
                  key={res}
                  disabled={isExporting}
                  onClick={() => setResolution(res)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                    resolution === res
                      ? "bg-surface dark:bg-surface-hover text-foreground shadow-sm font-bold"
                      : "text-muted hover:text-foreground"
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
            <span className="text-xs font-semibold text-muted">Frame rate</span>
            <div className="flex bg-surface-secondary p-1 rounded-xl border border-border gap-1">
              {["30 fps", "60 fps"].map((fps) => (
                <button
                  type="button"
                  key={fps}
                  disabled={isExporting}
                  onClick={() => setFrameRate(fps)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50",
                    frameRate === fps
                      ? "bg-surface dark:bg-surface-hover text-foreground shadow-sm font-bold"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Catatan batas format GIF saat background dihapus */}
        {format === "gif" && isBgRemoved && (
          <p className="text-[11px] font-medium leading-relaxed text-muted">
            GIF transparency is on or off per pixel, so the character&apos;s edges may look
            slightly jagged.
          </p>
        )}

        {/* Peringatan: browser tidak bisa menyimpan WebM transparan */}
        {format === "webm" && isBgRemoved && canWebmAlpha === false && (
          <Alert
            status="warning"
            className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 shadow-none"
          >
            <Alert.Indicator className="text-warning" />
            <Alert.Content>
              <Alert.Title className="text-xs font-semibold text-foreground">
                This browser can&apos;t export transparent WebM
              </Alert.Title>
              <Alert.Description className="text-[11px] font-medium text-muted">
                The video will use your background color ({fallbackBackground}) instead. Use
                Chrome or Edge to keep it transparent.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {/* Indikator Progress */}
        {isExporting && (format === "gif" || format === "webm" || format === "lottie") && (
          <div className="w-full bg-surface-secondary rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-subtle font-medium">
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-accent" /> Rendering {format.toUpperCase()}...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-150"
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
            className="px-4 py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          
          <GlossyButton
            onPress={handleExport}
            isDisabled={isExporting}
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