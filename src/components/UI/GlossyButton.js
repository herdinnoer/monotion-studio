"use client";

import React from "react";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";

// Satu warna saja (biru), diambil dari token --glossy-* di globals.css (DESIGN.md bagian 8)
export function GlossyButton({
  children,
  fontSize = "text-[14px]", // <-- Default ukuran font (bisa text-xs, text-sm, text-base, dll)
  borderRadius = "rounded-button",
  className,
  ...props
}) {
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
        "bg-gradient-to-b from-(--glossy-top) to-(--glossy-bottom)",
        "hover:from-(--glossy-top-hover) hover:to-(--glossy-bottom)",
        "active:from-(--glossy-top-pressed) active:to-(--glossy-bottom)",
        "border-(color:--glossy-border)",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
