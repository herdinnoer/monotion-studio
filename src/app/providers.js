"use client";

import { useSyncExternalStore } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LucideProvider } from "lucide-react";

// Filter false-positive warning React 19 khusus untuk script tag next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    )
      return;
    origError.apply(console, args);
  };
}

const emptySubscribe = () => () => {};

export function Providers({ children }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Ketebalan garis semua ikon Lucide diatur sekali di sini (DESIGN.md bagian 6).
  // Dipasang di luar cek `mounted` supaya ikon tidak berubah tebal setelah hydration.
  return (
    <LucideProvider strokeWidth={1.75}>
      {/* Sebelum client hydration selesai, render children biasa tanpa ThemeProvider */}
      {mounted ? (
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          scriptProps={{ type: "text/javascript" }}
        >
          {children}
        </NextThemesProvider>
      ) : (
        children
      )}
    </LucideProvider>
  );
}
