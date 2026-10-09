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
      bg: "bg-gradient-to-b from-(--glossy-top) to-(--glossy-bottom)",
      hoverBg: "hover:from-(--glossy-top-hover) hover:to-(--glossy-bottom)",
      activeBg: "active:from-(--glossy-top-pressed) active:to-(--glossy-bottom)",
      border: "border-(color:--glossy-border)",
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

  // Props lain diteruskan ke Button HeroUI: pakai `onPress` & `isDisabled`,
  // bukan `onClick` & `disabled` (nama HTML biasa tidak dikenal, tombol tidak terkunci).

  return (
    <Button
      // Menggunakan cn() agar kelas kustom dari props (seperti fontSize & borderRadius)
      // berhasil menimpa bawaan internal HeroUI
      className={cn(
        "relative text-accent-foreground font-semibold h-9 px-4 min-w-0 transition-all duration-200 ease-in-out",
        "shadow-(--glossy-shadow)",
        "active:shadow-(--glossy-shadow-pressed)",
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
