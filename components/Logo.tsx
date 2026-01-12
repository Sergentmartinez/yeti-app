import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface LogoProps {
  color?: "white" | "dark";
  variant?: "light" | "dark"; // Alias for color
  className?: string;
}

export function Logo({ color, variant, className }: LogoProps) {
  // Resolve color from variant (light = white on dark background)
  const resolvedColor = variant === "light" ? "white" : (color || "dark");
  
  return (
    <Link href="/" className={cn("flex items-center gap-2 group decoration-0 select-none", className)}>
      <div className="relative">
        <div className="w-8 h-8 bg-orange-vibrant text-white rounded-lg flex items-center justify-center shadow-lg shadow-orange-vibrant/20 group-hover:rotate-12 transition-transform duration-500">
          <Icons.Logo className="w-5 h-5 transition-transform group-hover:scale-110" />
        </div>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-vibrant rounded-sm border-2 border-bg-base transform rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
      </div>
      <div className="flex flex-col -space-y-1">
        <span
          className={cn(
            "text-xl font-black tracking-tighter uppercase transition-all duration-300",
            resolvedColor === "white" ? "text-white group-hover:text-cyan-vibrant" : "text-text-primary group-hover:text-orange-vibrant"
          )}
        >
          YETI
        </span>
        <span className="text-[8px] font-black tracking-[0.3em] uppercase opacity-40">Expédition</span>
      </div>
    </Link>
  );
}
