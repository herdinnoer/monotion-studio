"use client";

import React from "react";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";

export function GlossyButton({
  children,
  colorScheme = "blue", // Default ke blue sesuai tombol Export kita
  fontSize = "text-[14px]", // <-- Default ukuran font (bisa text-xs, text-sm, text-base, dll)
  borderRadius = "rounded-[10px]",
  className,
  ...props
}) {
  // Mapping tema warna persis seperti di Arkana Edu
  const themes = {
    blue: {
      bg: "bg-gradient-to-b from-[#0E89F8] to-[#1d4ed8]",
      hoverBg: "hover:from-[#48A6FB] hover:to-[#1d4ed8]",
      activeBg: "active:from-[#1e40af] active:to-[#1d4ed8]",
      border: "border-[#003768]", // setara blue.400
    },
    pink: {
      bg: "bg-gradient-to-b from-[#F165AE] to-[#d93c8d]",
      hoverBg: "hover:from-[#ff7abf] hover:to-[#d93c8d]",
      activeBg: "active:from-[#d93c8d] active:to-[#0a090a]",
      border: "border-[#BF2173]",
    },
    green: {
      bg: "bg-gradient-to-b from-[#22c55e] to-[#00AA13]",
      hoverBg: "hover:from-[#4dca7b] hover:to-[#00AA13]",
      activeBg: "active:from-[#166534] active:to-[#14532d]",
      border: "border-[#16a34a]",
    },
  };

  const currentTheme = themes[colorScheme] || themes.blue;

  return (
    <Button
      // Menggunakan cn() agar kelas kustom dari props (seperti fontSize & borderRadius)
      // berhasil menimpa bawaan internal HeroUI
      className={cn(
        "relative text-white font-semibold h-9 px-4 min-w-0 transition-all duration-200 ease-in-out",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.1)]",
        "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
        "border",
        fontSize,
        borderRadius,
        currentTheme.bg,
        currentTheme.hoverBg,
        currentTheme.activeBg,
        currentTheme.border,
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
