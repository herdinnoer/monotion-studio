"use client";

import React from "react";
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  parseColor,
} from "@heroui/react";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/UI/IconButton";
import { DEFAULT_BACKGROUND } from "@/lib/editorState";

// Dua jenis perubahan (Fase 2 A3):
//   onChange    = pratinjau, dipanggil terus selama color area / hue slider digeser
//   onChangeEnd = simpan satu langkah undo: saat geseran dilepas, klik swatch,
//                 tombol acak, atau ketik hex lalu Enter/blur
export function ColorInput({ value = DEFAULT_BACKGROUND, onChange, onChangeEnd, className, isDisabled = false }) {
  const colorValue = React.useMemo(() => {
    try {
      const hex = value ? (value.startsWith("#") ? value : `#${value}`) : DEFAULT_BACKGROUND;
      return parseColor(hex);
    } catch {
      return parseColor(DEFAULT_BACKGROUND);
    }
  }, [value]);

  const colorPresets = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ];

  // Fungsi Acak Warna (Aman untuk DOM Event maupun HeroUI PressEvent)
  const shuffleColor = (e) => {
    if (typeof e?.stopPropagation === "function") {
      e.stopPropagation();
    }
    if (isDisabled) return;
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = 50 + Math.floor(Math.random() * 50);
    const randomLightness = 40 + Math.floor(Math.random() * 30);

    const newColor = parseColor(
      `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`
    );
    if (onChangeEnd) {
      onChangeEnd(newColor.toString("hex"));
    }
  };

  const handleChange = (newColorObj) => {
    if (newColorObj && onChange && !isDisabled) {
      onChange(newColorObj.toString("hex"));
    }
  };

  const handleChangeEnd = (newColorObj) => {
    if (newColorObj && onChangeEnd && !isDisabled) {
      onChangeEnd(newColorObj.toString("hex"));
    }
  };

  return (
    <ColorPicker value={colorValue} onChange={handleChange} className="w-full" isDisabled={isDisabled}>
      <div
        className={cn(
          "w-full h-11 flex items-center justify-between rounded-xl border border-border transition-all",
          "bg-surface-secondary",
          isDisabled && "opacity-40 pointer-events-none select-none cursor-not-allowed",
          className
        )}
      >
        <ColorPicker.Trigger
          className={cn(
            "flex items-center gap-3 flex-1 h-full px-3 outline-none",
            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          isDisabled={isDisabled}
        >
          <div
            className="w-6 h-6 rounded-md border border-border shrink-0 shadow-sm"
            style={{ backgroundColor: colorValue.toString("hex") }}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {colorValue.toString("hex").replace("#", "")}
          </span>
        </ColorPicker.Trigger>

        <div className="h-full flex items-center border-l border-border px-1.5">
          {/* Tombol di atas surface-raised, jadi hover-nya satu tingkat lebih terang (surface-hover) */}
          <IconButton
            label="Shuffle color"
            onPress={shuffleColor}
            isDisabled={isDisabled}
            className="text-muted hover:text-foreground hover:bg-surface-hover"
          >
            <Shuffle size={14} />
          </IconButton>
        </div>
      </div>

      {!isDisabled && (
        <ColorPicker.Popover className="gap-2 p-3 bg-surface border border-border shadow-2xl rounded-2xl text-foreground z-50">
          <ColorSwatchPicker className="justify-center pt-1 gap-1.5" size="xs" onChange={handleChangeEnd}>
            {colorPresets.map((preset) => (
              <ColorSwatchPicker.Item key={preset} color={preset}>
                <ColorSwatchPicker.Swatch className="rounded-md cursor-pointer hover:scale-110 transition" />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>

          <ColorArea
            aria-label="Color area"
            className="max-w-full h-36 rounded-xl border border-border overflow-hidden"
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
            onChangeEnd={handleChangeEnd}
          >
            <ColorArea.Thumb className="border-2 border-white shadow-md" />
          </ColorArea>

          <div className="flex items-center gap-2 px-1 py-1">
            <ColorSlider
              aria-label="Hue slider"
              channel="hue"
              className="flex-1"
              colorSpace="hsb"
              onChangeEnd={handleChangeEnd}
            >
              <ColorSlider.Track className="w-full h-3 rounded-full overflow-hidden">
                <ColorSlider.Thumb className="border-2 border-white shadow-md" />
              </ColorSlider.Track>
            </ColorSlider>

            <Button
              isIconOnly
              aria-label="Shuffle color"
              size="sm"
              variant="tertiary"
              onPress={shuffleColor}
              className="bg-surface-secondary hover:bg-surface-hover text-foreground border border-border rounded-lg"
            >
              <Shuffle size={14} />
            </Button>
          </div>

          {/* ColorField baru memanggil onChange setelah Enter / blur, jadi langsung disimpan */}
          <ColorField aria-label="Color field" onChange={handleChangeEnd}>
            <ColorField.Group variant="secondary" className="bg-surface-secondary border border-border rounded-xl">
              <ColorField.Prefix className="pl-2">
                <ColorSwatch size="xs" className="rounded-sm" />
              </ColorField.Prefix>
              <ColorField.Input className="text-foreground text-xs pl-1" />
            </ColorField.Group>
          </ColorField>
        </ColorPicker.Popover>
      )}
    </ColorPicker>
  );
}