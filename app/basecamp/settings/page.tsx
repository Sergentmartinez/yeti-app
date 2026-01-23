// app/basecamp/settings/page.tsx
"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const SETTINGS_SECTIONS = [
  {
    id: "appearance",
    label: "Apparence",
    icon: Icons.Eye,
    settings: [
      { id: "theme", label: "Thème", type: "theme" },
      { id: "density", label: "Densité d'affichage", type: "select", options: ["Compact", "Normal", "Confortable"], value: "Normal" },
      { id: "animations", label: "Animations", type: "toggle", value: true },
    ]
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Icons.Bell,
    settings: [
      { id: "push", label: "Notifications push", type: "toggle", value: true },
      { id: "email", label: "Résumé hebdomadaire par email", type: "toggle", value: false },
      { id: "weather_alerts", label: "Alertes météo", type: "toggle", value: true },
      { id: "deadline_reminders", label: "Rappels d'échéances", type: "toggle", value: true },
    ]
  },
  {
    id: "units",
    label: "Unités",
    icon: Icons.Gauge,
    settings: [
      { id: "weight", label: "Poids", type: "select", options: ["Grammes (g)", "Onces (oz)"], value: "Grammes (g)" },
      { id: "distance", label: "Distance", type: "select", options: ["Kilomètres", "Miles"], value: "Kilomètres" },
      { id: "temperature", label: "Température", type: "select", options: ["Celsius (°C)", "Fahrenheit (°F)"], value: "Celsius (°C)" },
    ]
  },
  {
    id: "data",
    label: "Données",
    icon: Icons.Database,
    settings: [
      { id: "export", label: "Exporter mes données", type: "button", action: "export" },
      { id: "sync", label: "Dernière synchronisation", type: "info", value: "Il y a 5 minutes" },
    ]
  },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: false,
    weather_alerts: true,
    deadline_reminders: true,
    animations: true,
  });

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-bg-base transition-colors">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Paramètres</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-emerald-vibrant uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-vibrant animate-pulse" />
            Synchronisé
          </span>
        </div>
      </header>

      <div className="p-8 max-w-[900px] mx-auto space-y-8 animate-slide-up">
        
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.id} className="premium-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle bg-bg-surface-2/50 flex items-center gap-3">
              <section.icon className="w-5 h-5 text-cyan-vibrant" />
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">{section.label}</h3>
            </div>
            <div className="divide-y divide-border-subtle">
              {section.settings.map((setting) => (
                <div key={setting.id} className="p-4 flex items-center justify-between hover:bg-bg-surface-3/30 transition-colors">
                  <span className="text-sm font-medium text-text-primary">{setting.label}</span>
                  
                  {setting.type === "theme" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleTheme}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
                          "bg-bg-surface-3 border border-border-subtle"
                        )}
                      >
                        {theme === "dark" ? (
                          <>
                            <Icons.Moon className="w-4 h-4 text-cyan-vibrant" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sombre</span>
                          </>
                        ) : (
                          <>
                            <Icons.Sun className="w-4 h-4 text-orange-vibrant" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Clair</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {setting.type === "toggle" && (
                    <button
                      onClick={() => handleToggle(setting.id)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        toggles[setting.id] ? "bg-cyan-vibrant" : "bg-bg-surface-4"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all",
                        toggles[setting.id] ? "left-7" : "left-1"
                      )} />
                    </button>
                  )}
                  
                    {setting.type === "select" && 'options' in setting && (
                      <select className="bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-2 text-sm font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-cyan-vibrant/50">
                        {setting.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  
                  {setting.type === "button" && (
                    <button className="premium-card px-4 py-2 rounded-xl text-[10px] font-black text-cyan-vibrant uppercase tracking-widest hover:bg-cyan-vibrant/10 transition-colors">
                      Exporter
                    </button>
                  )}
                  
                  {setting.type === "info" && (
                    <span className="text-sm text-text-muted">{setting.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* DANGER ZONE */}
        <section className="premium-card rounded-2xl overflow-hidden ring-1 ring-red-vibrant/20">
          <div className="p-4 border-b border-red-vibrant/20 bg-red-vibrant/5 flex items-center gap-3">
            <Icons.Warning className="w-5 h-5 text-red-vibrant" />
            <h3 className="text-sm font-black text-red-vibrant uppercase tracking-widest">Zone Danger</h3>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Supprimer mon compte</div>
              <div className="text-[11px] text-text-muted">Cette action est irréversible</div>
            </div>
            <button className="px-4 py-2 rounded-xl text-[10px] font-black text-red-vibrant uppercase tracking-widest border border-red-vibrant/30 hover:bg-red-vibrant/10 transition-colors">
              Supprimer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
