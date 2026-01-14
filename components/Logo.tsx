import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  color?: "white" | "dark";
  variant?: "light" | "dark"; // Alias for color
}

export function Logo({ color, variant }: LogoProps) {
  // Resolve color from variant (light = white on dark background)
  const resolvedColor = variant === "light" ? "white" : (color || "dark");
  return (
    <Link href="/" className="flex items-baseline gap-1.5 cursor-pointer select-none group decoration-0">
      {/* TEXTE YETI */}
      <span
        className={cn(
          "text-3xl font-black tracking-tighter uppercase transition-all duration-300",
          // Si color="white" (fond sombre) -> Blanc. Sinon (fond clair) -> Noir.
          resolvedColor === "white" ? "text-white group-hover:text-zinc-300" : "text-zinc-950 group-hover:text-orange-600"
        )}
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        YETI
      </span>

      {/* LE CARRÉ ORANGE (NET, SANS OMBRE, QUI TOURNE) */}
      <div className="w-2.5 h-2.5 bg-orange-600 transition-all transform group-hover:rotate-45 duration-500 shadow-sm mb-1"></div>
    </Link>
  );
}