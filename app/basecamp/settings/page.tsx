// app/basecamp/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Eye, Bell, Gauge, Database, Shield, Globe, Zap, Monitor,
  Moon, Sun, Check, Download, Upload, Trash2, AlertTriangle,
  ChevronRight, CloudUpload, Lock, Fingerprint, Languages, Palette,
  Volume2, Wifi, Cpu, Smartphone, LogOut,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
type SectionId = "appearance" | "notifications" | "units" | "data" | "privacy" | "account";

interface NavSection {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
};

const NAV_SECTIONS: NavSection[] = [
  { id: "appearance", label: "Apparence", icon: Palette, description: "Thème, couleurs, densité" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Alertes & rappels", badge: "4", badgeColor: THEME.cyan },
  { id: "units", label: "Unités & langue", icon: Gauge, description: "Mesures, devise, locale" },
  { id: "data", label: "Données & sync", icon: Database, description: "Export, backup, Supabase", badge: "PRO", badgeColor: THEME.red },
  { id: "privacy", label: "Confidentialité", icon: Shield, description: "Vie privée, sessions" },
  { id: "account", label: "Compte", icon: LogOut, description: "Déconnexion & suppression" },
];

// ============================================================================
// PAGE
// ============================================================================
export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SectionId>("appearance");
  const [lastSaved, setLastSaved] = useState<string>("À l'instant");

  // Global settings state
  const [settings, setSettings] = useState({
    // Appearance
    density: "Normal",
    accentColor: "red",
    animations: true,
    reducedMotion: false,
    // Notifications
    push: true,
    email: false,
    weatherAlerts: true,
    deadlineReminders: true,
    soundEffects: false,
    // Units
    weightUnit: "g",
    distanceUnit: "km",
    tempUnit: "C",
    currency: "EUR",
    language: "fr",
    // Privacy
    analytics: true,
    crashReports: true,
    biometricLock: false,
  });

  // Load / persist
  useEffect(() => {
    const stored = localStorage.getItem("yeti-settings");
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  const update = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("yeti-settings", JSON.stringify(next));
    setLastSaved("À l'instant");
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1500px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
              Console · Préférences système
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <SettingsIcon className="text-[#f21e2c]" size={42} strokeWidth={1.5} />
                Paramètres
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Configurez votre expérience Yeti : apparence, notifications, unités, confidentialité.
                Les changements sont sauvegardés automatiquement.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Synchronisé</div>
                <div className="text-[10px] text-emerald-300/70">Sauvegardé {lastSaved}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ============ MAIN LAYOUT : NAV + CONTENT ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* =================== NAV SIDEBAR =================== */}
          <nav className="lg:col-span-3 space-y-1.5">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-2">
                {NAV_SECTIONS.map((section) => (
                  <NavItem
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                  />
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#f21e2c]/10 to-transparent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-[#f21e2c]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#f21e2c]">
                    Raccourcis
                  </span>
                </div>
                <div className="space-y-1.5">
                  <QuickAction icon={Download} label="Exporter mes données" />
                  <QuickAction icon={Upload} label="Importer backup" />
                </div>
              </div>
            </div>
          </nav>

          {/* =================== CONTENT =================== */}
          <div className="lg:col-span-9 space-y-5">

            {/* ============ APPARENCE ============ */}
            {activeSection === "appearance" && (
              <Section title="Apparence" description="Personnalisez l'interface de Yeti" icon={Palette} color={THEME.violet}>

                {/* Theme card */}
                <Setting
                  title="Thème de l'interface"
                  description="Sombre recommandé pour les sessions longues"
                  icon={theme === "dark" ? Moon : Sun}
                >
                  <div className="flex gap-2">
                    <ThemeOption
                      label="Sombre"
                      icon={Moon}
                      color={THEME.cyan}
                      selected={theme === "dark"}
                      onClick={() => theme !== "dark" && toggleTheme()}
                    />
                    <ThemeOption
                      label="Clair"
                      icon={Sun}
                      color={THEME.orange}
                      selected={theme === "light"}
                      onClick={() => theme !== "light" && toggleTheme()}
                    />
                    <ThemeOption
                      label="Auto"
                      icon={Monitor}
                      color={THEME.violet}
                      selected={false}
                      disabled
                    />
                  </div>
                </Setting>

                {/* Accent color */}
                <Setting
                  title="Couleur d'accent"
                  description="Couleur principale utilisée à travers l'app"
                  icon={Palette}
                >
                  <div className="flex gap-2">
                    {[
                      { id: "red", color: THEME.red },
                      { id: "orange", color: THEME.orange },
                      { id: "yellow", color: THEME.yellow },
                      { id: "emerald", color: THEME.emerald },
                      { id: "cyan", color: THEME.cyan },
                      { id: "violet", color: THEME.violet },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => update("accentColor", c.id)}
                        className={cn(
                          "w-9 h-9 rounded-xl transition-all relative",
                          settings.accentColor === c.id && "ring-2 ring-offset-2 ring-offset-[#111]"
                        )}
                        style={{
                          background: c.color,
                          ...(settings.accentColor === c.id && { boxShadow: `0 0 0 2px ${c.color}` }),
                        }}
                      >
                        {settings.accentColor === c.id && (
                          <Check size={14} className="text-white absolute inset-0 m-auto" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </Setting>

                <Setting title="Densité d'affichage" description="Espacement des éléments" icon={Monitor}>
                  <SelectField
                    value={settings.density}
                    options={["Compact", "Normal", "Confortable"]}
                    onChange={(v) => update("density", v)}
                  />
                </Setting>

                <Setting title="Animations" description="Transitions et micro-interactions" icon={Zap}>
                  <Toggle value={settings.animations} onChange={(v) => update("animations", v)} />
                </Setting>

                <Setting title="Réduire le mouvement" description="Pour les utilisateurs sensibles au mouvement" icon={Eye}>
                  <Toggle value={settings.reducedMotion} onChange={(v) => update("reducedMotion", v)} />
                </Setting>
              </Section>
            )}

            {/* ============ NOTIFICATIONS ============ */}
            {activeSection === "notifications" && (
              <Section title="Notifications" description="Gérez quand et comment Yeti vous alerte" icon={Bell} color={THEME.cyan}>
                <Setting title="Notifications push" description="Sur navigateur et mobile" icon={Smartphone}>
                  <Toggle value={settings.push} onChange={(v) => update("push", v)} />
                </Setting>
                <Setting title="Résumé hebdomadaire" description="Récap de la semaine chaque lundi matin" icon={Wifi}>
                  <Toggle value={settings.email} onChange={(v) => update("email", v)} />
                </Setting>
                <Setting title="Alertes météo" description="Notif quand les conditions changent sur votre trek" icon={AlertTriangle}>
                  <Toggle value={settings.weatherAlerts} onChange={(v) => update("weatherAlerts", v)} />
                </Setting>
                <Setting title="Rappels d'échéances" description="Tâches J-7 et jour J de la timeline" icon={Bell}>
                  <Toggle value={settings.deadlineReminders} onChange={(v) => update("deadlineReminders", v)} />
                </Setting>
                <Setting title="Sons d'interface" description="Effets sonores sur les interactions" icon={Volume2}>
                  <Toggle value={settings.soundEffects} onChange={(v) => update("soundEffects", v)} />
                </Setting>
              </Section>
            )}

            {/* ============ UNITS ============ */}
            {activeSection === "units" && (
              <Section title="Unités & langue" description="Format des mesures et localisation" icon={Gauge} color={THEME.yellow}>
                <Setting title="Poids" description="Utilisé dans Garage & Pack Builder" icon={Gauge}>
                  <SegmentedControl
                    value={settings.weightUnit}
                    options={[
                      { value: "g", label: "Grammes" },
                      { value: "oz", label: "Onces" },
                    ]}
                    onChange={(v) => update("weightUnit", v)}
                  />
                </Setting>
                <Setting title="Distance" description="Distance & dénivelé des treks" icon={Globe}>
                  <SegmentedControl
                    value={settings.distanceUnit}
                    options={[
                      { value: "km", label: "Kilomètres" },
                      { value: "mi", label: "Miles" },
                    ]}
                    onChange={(v) => update("distanceUnit", v)}
                  />
                </Setting>
                <Setting title="Température" description="Format météo et bulletins" icon={Gauge}>
                  <SegmentedControl
                    value={settings.tempUnit}
                    options={[
                      { value: "C", label: "°Celsius" },
                      { value: "F", label: "°Fahrenheit" },
                    ]}
                    onChange={(v) => update("tempUnit", v)}
                  />
                </Setting>
                <Setting title="Devise" description="Budget, achats & total pack" icon={Cpu}>
                  <SelectField
                    value={settings.currency}
                    options={["EUR", "USD", "GBP", "CHF"]}
                    onChange={(v) => update("currency", v)}
                  />
                </Setting>
                <Setting title="Langue" description="Interface multilingue (bientôt)" icon={Languages}>
                  <SelectField
                    value={settings.language === "fr" ? "Français" : "English"}
                    options={["Français", "English (soon)"]}
                    onChange={(v) => update("language", v === "Français" ? "fr" : "en")}
                  />
                </Setting>
              </Section>
            )}

            {/* ============ DATA ============ */}
            {activeSection === "data" && (
              <Section title="Données & synchronisation" description="Sauvegardes, exports et Supabase" icon={Database} color={THEME.red}>

                {/* Sync status card */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <CloudUpload size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">Tout est synchronisé</div>
                        <div className="text-[11px] text-zinc-400">Dernière sync il y a 5 min · Supabase EU-West</div>
                      </div>
                    </div>
                    <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors">
                      Forcer sync
                    </button>
                  </div>
                </motion.div>

                {/* Storage */}
                <Setting title="Stockage utilisé" description="78 MB sur 500 MB · quota Free" icon={Database}>
                  <div className="w-48">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1">
                      <div className="h-full w-[15%] bg-gradient-to-r from-[#f21e2c] to-[#F9591F] rounded-full" />
                    </div>
                    <div className="text-[10px] text-zinc-500 text-right tabular-nums">15,6%</div>
                  </div>
                </Setting>

                <Setting title="Exporter mes données" description="JSON complet (projets, timeline, garage)" icon={Download}>
                  <button className="h-9 px-4 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold flex items-center gap-2 transition-colors">
                    <Download size={12} /> Télécharger
                  </button>
                </Setting>

                <Setting title="Importer un backup" description="Restaurer depuis un fichier JSON" icon={Upload}>
                  <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors">
                    <Upload size={12} /> Choisir fichier
                  </button>
                </Setting>

                <Setting title="Auto-backup quotidien" description="Sauvegarde automatique chaque nuit" icon={CloudUpload} proFeature>
                  <Toggle value={false} onChange={() => {}} disabled />
                </Setting>
              </Section>
            )}

            {/* ============ PRIVACY ============ */}
            {activeSection === "privacy" && (
              <Section title="Confidentialité & sécurité" description="Vos données vous appartiennent" icon={Shield} color={THEME.emerald}>
                <Setting title="Verrouillage biométrique" description="Face ID / empreinte au lancement" icon={Fingerprint}>
                  <Toggle value={settings.biometricLock} onChange={(v) => update("biometricLock", v)} />
                </Setting>
                <Setting title="Analytiques anonymes" description="Nous aide à améliorer l'app (aucune donnée perso)" icon={Cpu}>
                  <Toggle value={settings.analytics} onChange={(v) => update("analytics", v)} />
                </Setting>
                <Setting title="Rapports de crash" description="Envoyer automatiquement les erreurs" icon={AlertTriangle}>
                  <Toggle value={settings.crashReports} onChange={(v) => update("crashReports", v)} />
                </Setting>
                <Setting title="Sessions actives" description="3 appareils connectés" icon={Monitor}>
                  <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors">
                    Gérer <ChevronRight size={12} />
                  </button>
                </Setting>
                <Setting title="Changer le mot de passe" description="Dernière modification il y a 2 mois" icon={Lock}>
                  <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors">
                    Modifier <ChevronRight size={12} />
                  </button>
                </Setting>
              </Section>
            )}

            {/* ============ ACCOUNT ============ */}
            {activeSection === "account" && (
              <>
                <Section title="Compte" description="Gestion de votre compte Yeti" icon={LogOut} color={THEME.orange}>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f21e2c] to-[#B21D3B] flex items-center justify-center text-white font-black text-lg">
                        MN
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">Marco N.</div>
                        <div className="text-[11px] text-zinc-500">marco@yeti.app · Compte Pro</div>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white">
                      Modifier
                    </button>
                  </div>

                  <Setting title="Se déconnecter" description="Fermer la session sur cet appareil" icon={LogOut}>
                    <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors">
                      <LogOut size={12} /> Déconnexion
                    </button>
                  </Setting>
                </Section>

                {/* DANGER ZONE */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent overflow-hidden"
                >
                  <div className="p-4 border-b border-red-500/20 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">Zone dangereuse</h3>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Trash2 size={13} className="text-red-400" />
                        Supprimer mon compte
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Suppression définitive de vos données · Cette action est irréversible
                      </div>
                    </div>
                    <button className="h-9 px-4 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors">
                      Supprimer
                    </button>
                  </div>
                </motion.section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const NavItem = ({
  section, isActive, onClick,
}: {
  section: NavSection;
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 h-[52px] rounded-xl flex items-center gap-3 transition-all text-left",
        isActive
          ? "bg-[#f21e2c]/10 border border-[#f21e2c]/30"
          : "hover:bg-white/5 border border-transparent"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          isActive ? "bg-[#f21e2c]/20" : "bg-white/5"
        )}
      >
        <Icon size={14} className={isActive ? "text-[#f21e2c]" : "text-zinc-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-xs font-bold truncate", isActive ? "text-white" : "text-zinc-300")}>
          {section.label}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">{section.description}</div>
      </div>
      {section.badge && (
        <div
          className="px-1.5 h-4 rounded-full flex items-center text-[8px] font-black uppercase tracking-wider text-white"
          style={{ background: section.badgeColor }}
        >
          {section.badge}
        </div>
      )}
      {isActive && <ChevronRight size={12} className="text-[#f21e2c] flex-shrink-0" />}
    </button>
  );
};

const Section = ({
  title, description, icon: Icon, color, children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.section
    key={title}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl border border-white/[0.08] bg-[#111] overflow-hidden"
  >
    <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
      >
        <Icon size={16} />
      </div>
      <div>
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
    </div>
    <div className="divide-y divide-white/[0.04]">
      {children}
    </div>
  </motion.section>
);

const Setting = ({
  title, description, icon: Icon, children, proFeature = false,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  proFeature?: boolean;
}) => (
  <div className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          {title}
          {proFeature && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#f21e2c]/20 border border-[#f21e2c]/30 text-[#f21e2c] text-[8px] font-black uppercase tracking-wider">
              Pro
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{description}</div>
      </div>
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({
  value, onChange, disabled = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    className={cn(
      "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
      value ? "bg-[#f21e2c]" : "bg-white/10",
      disabled && "opacity-40 cursor-not-allowed"
    )}
  >
    <motion.div
      animate={{ x: value ? 22 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
    />
  </button>
);

const SelectField = ({
  value, options, onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-9 px-3 pr-8 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#f21e2c]/50 hover:bg-[#222] transition-colors cursor-pointer"
  >
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const SegmentedControl = ({
  value, options, onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#1a1a1a] border border-white/10">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={cn(
          "px-3 h-7 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors",
          value === opt.value
            ? "bg-white text-black"
            : "text-zinc-400 hover:text-white"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ThemeOption = ({
  label, icon: Icon, color, selected, onClick, disabled = false,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex-1 min-w-[90px] p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1.5",
      selected
        ? "bg-[#f21e2c]/10 border-[#f21e2c]/50"
        : "bg-white/[0.02] border-white/10 hover:bg-white/5",
      disabled && "opacity-40 cursor-not-allowed"
    )}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: `${color}20`, border: `1px solid ${color}30`, color }}
    >
      <Icon size={14} />
    </div>
    <span className={cn("text-[10px] font-bold uppercase tracking-wider", selected ? "text-white" : "text-zinc-400")}>
      {label}
    </span>
    {selected && (
      <div className="w-4 h-4 rounded-full bg-[#f21e2c] flex items-center justify-center">
        <Check size={10} className="text-white" strokeWidth={3} />
      </div>
    )}
  </button>
);

const QuickAction = ({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) => (
  <button className="w-full px-2.5 h-9 rounded-lg hover:bg-white/5 flex items-center gap-2 transition-colors text-left">
    <Icon size={12} className="text-[#f21e2c]" />
    <span className="text-[11px] font-semibold text-zinc-300 flex-1">{label}</span>
    <ChevronRight size={10} className="text-zinc-600" />
  </button>
);
