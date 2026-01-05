"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/treks", label: "Treks" },
  { href: "/basecamp", label: "Basecamp" },
  { href: "/basecamp/packbuilder", label: "Pack Builder" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter text-white">YETI<span className="text-orange-500">.</span></Link>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn("text-sm font-medium transition-colors", pathname === link.href ? "text-orange-500" : "text-stone-400 hover:text-white")}>{link.label}</Link>
          ))}
        </div>
        <Link href="/basecamp" className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition">Mon Basecamp</Link>
      </div>
    </nav>
  );
}
