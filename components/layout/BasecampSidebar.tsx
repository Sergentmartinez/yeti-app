"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

const GLOBAL_NAV = [
  { href: "/basecamp", label: "Mission Control", icon: Icons.Home, exact: true },
  { href: "/basecamp/gear", label: "Mon Garage", icon: Icons.Archive, count: 62 },
  { href: "/basecamp/projects", label: "Mes Projets", icon: Icons.Folder },
];

const PROJECT_NAV = [
  { href: "/basecamp/dashboard", label: "Dashboard", icon: Icons.Gauge, badge: "85%", badgeVariant: "cyan" },
  { href: "/basecamp/timeline", label: "Timeline", icon: Icons.Activity, badge: "J-22", badgeVariant: "orange" },
  { href: "/basecamp/packbuilder", label: "Pack Builder", icon: Icons.NavPack },
  { href: "/basecamp/routes", label: "Itinéraire", icon: Icons.NavRoutes },
  { href: "/basecamp/weather", label: "Météo", icon: Icons.CloudSun },
  { href: "/basecamp/sherpa", label: "Sherpa AI", icon: Icons.Zap },
];

export function BasecampSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-bg-surface-1 border-border-subtle transition-all duration-300 sidebar-texture">
      {/* Brand Header */}
      <div className="flex h-14 items-center px-6 border-b border-border-subtle">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tighter text-2xl text-text-primary">
          YETI
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {/* Vue Globale Section */}
        <div className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] px-3 mb-2 mt-2">
          Vue Globale
        </div>
        <div className="space-y-0.5">
          {GLOBAL_NAV.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href) && !pathname.includes('packbuilder');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all",
                  isActive
                    ? "bg-bg-surface-4/50 text-accent-orange shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-accent-orange" : "text-text-muted group-hover:text-text-primary")} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.count && (
                   <span className="text-[10px] font-bold bg-bg-surface-3 text-text-muted px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Projet Actif Section */}
        <div className="pt-6 pb-2">
          <div className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] px-3 mb-2 flex items-center justify-between">
            <span>Projet Actif</span>
            <span className="text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded text-[9px]">GR20</span>
          </div>
        </div>
        
        <div className="space-y-0.5">
          {PROJECT_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all",
                   isActive
                    ? "bg-bg-surface-4/50 text-accent-orange shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-accent-orange" : "text-text-muted group-hover:text-text-primary")} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                    item.badgeVariant === 'cyan' ? "bg-accent-cyan-muted text-accent-cyan" : 
                    item.badgeVariant === 'orange' ? "bg-accent-orange-muted text-accent-orange" :
                    "bg-bg-surface-3 text-text-muted"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-border-subtle p-4">
        <Link
          href="/basecamp/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30 transition-colors mb-2"
        >
          <Icons.Settings className="w-4 h-4 text-text-muted" />
          <span>Paramètres</span>
        </Link>
        
        <Link
          href="/basecamp/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-bg-surface-4/30 group"
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-accent-orange shadow-md relative">
             <Image 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"
                alt="Marco"
                fill
                className="object-cover"
             />
          </div>
          <div className="flex flex-1 flex-col truncate">
            <span className="text-sm font-bold text-text-primary truncate">Marco</span>
            <span className="text-[10px] font-black text-accent-orange uppercase tracking-tight">Membre Pro</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}