"use client";

import React from "react";
import { Button, Tooltip } from "@heroui/react";

// Tombol ikon (DESIGN.md bagian 6 & 8): Button HeroUI isIconOnly + Tooltip + aria-label.
// Bukan komponen buatan sendiri, hanya pembungkus supaya pola ini tidak ditulis ulang
// di tiap tombol. Ukuran 32×32, radius 8px & opacity nonaktif diatur di globals.css.
// `label` = nama tombol untuk screen reader; `tooltip` boleh menambah shortcut,
// mis. label "Undo" + tooltip "Undo (Ctrl+Z)".
export function IconButton({ label, tooltip = label, variant = "ghost", children, ...props }) {
  return (
    <Tooltip>
      <Button isIconOnly size="sm" variant={variant} aria-label={label} {...props}>
        {children}
      </Button>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
}
