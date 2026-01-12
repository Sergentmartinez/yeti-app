"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-2xl",
        "flex items-center justify-center",
        "bg-bg-surface-2 border border-border-subtle",
        "shadow-2xl shadow-black/30",
        "hover:scale-110 hover:border-cyan-vibrant/50",
        "transition-all duration-300 ease-out",
        "group"
      )}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {theme === "dark" ? (
        <Icons.Sun className="w-6 h-6 text-orange-vibrant group-hover:rotate-45 transition-transform duration-500" />
      ) : (
        <Icons.Moon className="w-6 h-6 text-cyan-vibrant group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
}
