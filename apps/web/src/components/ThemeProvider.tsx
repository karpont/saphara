"use client";

import { useEffect, type ReactNode } from "react";

/** HTML[data-theme] atar; localStorage'dan tema okur. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("saphara_theme") ?? "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  return <>{children}</>;
}
