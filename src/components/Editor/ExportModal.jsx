"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Alert,
  Button,
  Label,
  Modal,
  ProgressBar,
  ToggleButton,
  ToggleButtonGroup,
  toast,
} from "@heroui/react";
import { GlossyButton } from "@/components/UI/GlossyButton";
import { IconButton } from "@/components/UI/IconButton";
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

  // Selama export berjalan modal tidak boleh tertutup (Esc, klik di luar, tombol tutup),
  // supaya export tidak terlihat "batal" padahal masih jalan di belakang.
  const handleOpenChange = (open) => {
    if (!open && !isExporting) onClose();
  };

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
          toast.success(`Exported ${baseFilename}.gif`);
          break;

        case "svg":
          await exportAsSvg({
            elementId: "character-workspace",
            filename: `${baseFilename}.svg`,
            config,
          });
          onClose();
          toast.success(`Exported ${baseFilename}.svg`);
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
          toast.success(`Exported ${baseFilename}.webm`);
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
          toast.success(`Exported ${baseFilename}-lottie.json`);
          break;

        case "react":
          await copyReactComponent({ character, config });
          toast.success("React code copied");
          onClose();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Gagal melakukan export:", error);
      toast.danger("Export failed", {
        description: "Try again. If it keeps failing, pick a lower resolution or another format.",
      });
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
    // Modal HeroUI: fokus keyboard terkurung di dalam (T-13), Esc & klik di luar menutup.
    // Lebar, radius, animasi buka mengikuti DESIGN.md (animasi diatur di globals.css).
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop
        variant="blur"
        isDismissable={!isExporting}
        isKeyboardDismissDisabled={isExporting}
      >
        <Modal.Container placement="center">
          <Modal.Dialog className="w-[480px] max-w-full text-foreground gap-6 select-none">

            {/* Header dengan Divider */}
            <Modal.Header className="flex-row items-center justify-between pb-4 -mx-6 px-6 border-b border-border shrink-0">
              <Modal.Heading className="text-base font-bold text-foreground tracking-wide">
                Export
              </Modal.Heading>
              <IconButton
                label="Close"
                onPress={onClose}
                isDisabled={isExporting}
                className="text-muted hover:text-foreground"
              >
                <X size={16} />
              </IconButton>
            </Modal.Header>

            {/* Format Export (Side-by-side) */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted">Format</span>
              <ToggleButtonGroup
                aria-label="Format"
                className="segmented"
                selectionMode="single"
                disallowEmptySelection
                isDisabled={isExporting}
                selectedKeys={[format]}
                onSelectionChange={(keys) => {
                  const [next] = keys;
                  if (next) handleSelectFormat(next);
                }}
              >
                {formatList.map((item) => (
                  <ToggleButton key={item.id} id={item.id}>
                    {item.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            {/* Resolution (Tampil Saat Format GIF, WebM, atau Lottie) */}
            {(format === "gif" || format === "webm" || format === "lottie") && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted">Resolution</span>
                <ToggleButtonGroup
                  aria-label="Resolution"
                  className="segmented"
                  selectionMode="single"
                  disallowEmptySelection
                  isDisabled={isExporting}
                  selectedKeys={[resolution]}
                  onSelectionChange={(keys) => {
                    const [next] = keys;
                    if (next) setResolution(next);
                  }}
                >
                  {availableResolutions.map((res) => (
                    <ToggleButton key={res} id={res}>
                      {res}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>
            )}

            {/* Frame Rate (Tampil Saat Format GIF, WebM, atau Lottie) */}
            {(format === "gif" || format === "webm" || format === "lottie") && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted">Frame rate</span>
                <ToggleButtonGroup
                  aria-label="Frame rate"
                  className="segmented"
                  selectionMode="single"
                  disallowEmptySelection
                  isDisabled={isExporting}
                  selectedKeys={[frameRate]}
                  onSelectionChange={(keys) => {
                    const [next] = keys;
                    if (next) setFrameRate(next);
                  }}
                >
                  {["30 fps", "60 fps"].map((fps) => (
                    <ToggleButton key={fps} id={fps}>
                      {fps}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
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
              <ProgressBar value={progress} className="gap-2">
                <Label className="text-xs font-medium text-muted">
                  Rendering {format.toUpperCase()}…
                </Label>
                <ProgressBar.Output className="text-xs font-medium text-muted" />
                <ProgressBar.Track className="h-1.5 bg-border">
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            )}

            {/* Footer Actions */}
            <Modal.Footer className="gap-3 pt-3">
              <Button
                variant="ghost"
                onPress={onClose}
                isDisabled={isExporting}
                className="text-xs font-semibold text-muted hover:text-foreground"
              >
                Close
              </Button>

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
            </Modal.Footer>

          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}