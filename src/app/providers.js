"use client";

import { useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

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

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sebelum client hydration selesai, render children biasa tanpa Provider
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      scriptProps={{ type: "text/javascript" }}
    >
      {children}
    </NextThemesProvider>
  );
}
