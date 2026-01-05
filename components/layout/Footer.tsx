"use client";

import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="py-6 bg-stone-950 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-6 flex justify-center">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} YETI. Your European Trek Intelligence.
          </p>
      </div>
    </footer>
  );
}
