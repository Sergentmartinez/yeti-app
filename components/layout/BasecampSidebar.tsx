// components/layout/BasecampSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const BASECAMP_NAV = [
  { href: "/basecamp", label: "Dashboard", icon: Icons.Home, exact: true },
  { href: "/basecamp/gear", label: "Mon Inventaire", icon: Icons.NavInventory },
  { href: "/basecamp/packs", label: "Mes Packs", icon: Icons.NavPack },
  { href: "/basecamp/routes", label: "Mes Routes", icon: Icons.NavRoutes },
  { href: "/basecamp/profile", label: "Mon Profil", icon: Icons.User },
];

export function BasecampSidebar() {
  const pathname = usePathname();

  return (
    // Z-INDEX CORRECTIF : z-40 pour rester sous le contenu principal (z-50)
    <aside className="fixed left-0 top-0 h-screen w-64 bg-stone-950 border-r border-stone-800 flex flex-col z-40"> 
      {/* Logo */}
      <div className="p-6 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
            <Icons.Logo className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            YETI<span className="text-orange-500">.</span>
          </span>
        </Link>
      </div>

      {/* Basecamp Section */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 mb-3">
            <Icons.NavBasecamp className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Basecamp</span>
          </div>
          <p className="px-3 text-xs text-stone-600 mb-4">Ton espace personnel d&apos;aventurier</p>
          
          <div className="space-y-1">
            {BASECAMP_NAV.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname?.startsWith(item.href) && pathname !== "/basecamp/packbuilder";
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-orange-600 text-white"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pack Builder - Outil séparé */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          <div className="flex items-center gap-2 px-3 mb-3">
            <Icons.NavPack className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Outil</span>
          </div>
          
          <Link
            href="/basecamp/packbuilder"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === "/basecamp/packbuilder"
                ? "bg-orange-600 text-white"
                : "text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-700"
            )}
          >
            <Icons.Activity className="w-5 h-5" />
            Pack Builder
          </Link>
          <p className="px-3 mt-2 text-[10px] text-stone-600">Construis le sac parfait pour ton trek</p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          <div className="px-3 mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Explorer</span>
          </div>
          <Link
            href="/treks"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <Icons.NavTrek className="w-4 h-4" />
            Voir les Treks
          </Link>
        </div>
      </nav>

      {/* Bottom Section (Abonnement) */}
      <div className="p-4 border-t border-stone-800">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Star className="w-4 h-4" />
            <span className="text-sm font-bold">Premium</span>
          </div>
          <p className="text-xs text-orange-100 mb-3">Export PDF, IA personnalisée...</p>
          <button className="w-full py-2 bg-white text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-50 transition">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}