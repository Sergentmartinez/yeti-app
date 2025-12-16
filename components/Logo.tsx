import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  color?: "white" | "dark";
}

export function Logo({ color = "dark" }: LogoProps) {
  return (
    <Link href="/" className="flex items-baseline gap-1 cursor-pointer select-none group decoration-0">
      {/* TEXTE YETI */}
      <span 
        className={cn(
          "text-3xl font-bold tracking-tighter uppercase transition-colors",
          // Si color="white" (fond sombre) -> Blanc. Sinon (fond clair) -> Noir.
          color === "white" ? "text-white group-hover:text-zinc-300" : "text-stone-900 group-hover:text-orange-600"
        )}
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        YETI
      </span>
      
      {/* LE CARRÉ ORANGE (NET, SANS OMBRE, QUI TOURNE) */}
      <div className="w-2.5 h-2.5 bg-orange-600 transition-all transform group-hover:rotate-45 duration-300"></div>
    </Link>
  );
}