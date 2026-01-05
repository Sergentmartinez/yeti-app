"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/treks", label: "Treks", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/basecamp", label: "Basecamp", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/basecamp/packbuilder", label: "Pack Builder", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/basecamp/gear", label: "Inventaire", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/basecamp/routes", label: "Mes Routes", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { href: "/basecamp/profile", label: "Mon Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const TREK_SHORTCUTS = [
  { slug: "gr20-corse", name: "GR20", theme: "orange" },
  { slug: "tour-mont-blanc", name: "TMB", theme: "orange" },
  { slug: "camino", name: "Camino", theme: "spirit" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-stone-950 border-r border-stone-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black tracking-tighter text-white">
            YETI<span className="text-orange-500">.</span>
          </span>
        </Link>
        <p className="text-xs text-stone-500 mt-1">Trek Copilot</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Trek Shortcuts */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
            Treks Rapides
          </h3>
          <div className="space-y-1">
            {TREK_SHORTCUTS.map((trek) => {
              const isActive = pathname === `/treks/${trek.slug}`;
              return (
                <Link
                  key={trek.slug}
                  href={`/treks/${trek.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                    isActive
                      ? trek.theme === "spirit"
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-orange-600/20 text-orange-400"
                      : "text-stone-500 hover:text-white hover:bg-stone-800"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    trek.theme === "spirit" ? "bg-blue-500" : "bg-orange-500"
                  )} />
                  {trek.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-stone-800">
        <div className="bg-linear-to-r from-orange-600 to-orange-500 rounded-xl p-4 text-white">
          <div className="text-sm font-bold mb-1">Premium</div>
          <p className="text-xs text-orange-100 mb-3">Export PDF, IA personnalisée...</p>
          <button className="w-full py-2 bg-white text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-50 transition">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}