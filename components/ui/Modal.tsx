"use client";

import { ReactNode, useEffect } from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={cn("absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl", className)}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="text-sm font-bold text-white">{title}</div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-900" aria-label="Fermer">
            <Icons.Close className="h-4 w-4 text-zinc-300" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
