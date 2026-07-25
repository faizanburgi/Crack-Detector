"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid rendering theme-dependent UI until mounted, so the server-rendered
  // markup (always dark by default) matches the client on first paint.
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-line-bright bg-panel text-muted shadow-sm transition-colors hover:border-scan/50 hover:text-scan md:right-6 md:top-6"
    >
      {mounted && (
        <>
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </>
      )}
    </button>
  );
}
