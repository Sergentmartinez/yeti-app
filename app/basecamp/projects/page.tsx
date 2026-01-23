"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getAllTreks } from "@/lib/treks";
import { createProject, deleteProject, listProjects } from "@/lib/projects/local";
import { AdventureProject } from "@/types/projects";
import { Modal } from "@/components/ui/Modal";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const treks = useMemo(() => getAllTreks(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trekSlug, setTrekSlug] = useState(treks[0]?.slug ?? "gr20");
  const [startDate, setStartDate] = useState("");
  const [mounted, setMounted] = useState(false);

  const [tick, setTick] = useState(0);
  const [projects, setProjects] = useState<AdventureProject[]>([]);
  
  // Charger les projets seulement côté client pour éviter l'erreur d'hydratation
  useEffect(() => {
    setMounted(true);
    setProjects(listProjects());
  }, []);
  
  useEffect(() => {
    if (mounted) {
      setProjects(listProjects());
    }
  }, [tick, mounted]);

  function refresh() { setTick(t => t + 1); }

  function onCreate() {
    const t = treks.find(x => x.slug === trekSlug);
    const defaultName = name.trim() || (t ? `${t.name} — Mon projet` : "Mon projet");
    createProject({ name: defaultName, trekSlug, startDate: startDate || undefined });
    setOpen(false);
    setName("");
    setStartDate("");
    refresh();
  }

  function onDelete(p: AdventureProject) {
    if (!confirm(`Supprimer le projet "${p.name}" ?`)) return;
    deleteProject(p.id);
    refresh();
  }

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-300">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-2/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Icons.Folder className="w-6 h-6 text-accent-cyan" />
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Mes Expéditions</h1>
            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] leading-none mt-1">Tactical Backbone v4.0</p>
          </div>
        </div>
        <button 
          onClick={() => setOpen(true)}
          className="premium-card px-5 py-2.5 rounded-xl flex items-center gap-2 text-accent-cyan hover:bg-accent-cyan/10 transition-all hover:scale-105 active:scale-95 border border-accent-cyan/20"
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Nouveau Projet</span>
        </button>
      </header>

      <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-slide-up">
        {!mounted ? (
          // Skeleton loading pendant l'hydratation
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="premium-card rounded-2xl p-6 bg-bg-surface-1 animate-pulse">
                <div className="h-6 bg-bg-surface-3 rounded mb-4 w-3/4" />
                <div className="h-4 bg-bg-surface-3 rounded mb-2 w-1/2" />
                <div className="h-4 bg-bg-surface-3 rounded mb-2 w-2/3" />
                <div className="h-4 bg-bg-surface-3 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          // Contenu réel après hydratation
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => (
              <div key={p.id} className="premium-card rounded-2xl p-6 flex flex-col group transition-all hover:translate-y-[-4px] bg-bg-surface-1 hover:shadow-2xl hover:border-accent-cyan/30 border-2 border-transparent">
                <div className="flex items-start justify-between gap-3 mb-8">
                  <div className="flex-1">
                    <div className="text-lg font-black text-text-primary uppercase tracking-tight group-hover:text-accent-cyan transition-colors">{p.name}</div>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2.5 group/item">
                        <Icons.MapPin className="w-3.5 h-3.5 text-accent-cyan opacity-60 group-hover/item:opacity-100 transition-opacity" /> 
                        Itinéraire: <span className="text-text-primary font-mono">{p.trekSlug}</span>
                      </div>
                      {p.startDate && (
                        <div className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2.5 group/item">
                          <Icons.Calendar className="w-3.5 h-3.5 text-accent-orange opacity-60 group-hover/item:opacity-100 transition-opacity" /> 
                          Départ: <span className="text-text-primary font-mono">{p.startDate}</span>
                        </div>
                      )}
                      <div className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2.5 group/item">
                        <Icons.Users className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover/item:opacity-100 transition-opacity" /> 
                        Équipe: <span className="text-text-primary font-mono">{p.members.length} membre{p.members.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(p)} 
                    className="rounded-lg p-2.5 text-text-faint hover:text-accent-red hover:bg-accent-red/10 transition-colors" 
                    aria-label="Supprimer"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto pt-6 border-t border-border-subtle flex gap-4">
                  <Link href={`/basecamp/projects/${p.id}`} className="flex-1">
                    <button className="w-full py-3 rounded-xl bg-bg-surface-3 text-xs font-black uppercase tracking-[0.2em] text-text-primary hover:bg-accent-cyan hover:text-bg-base transition-all shadow-lg active:scale-95">
                      Launch
                    </button>
                  </Link>
                  <Link href={`/treks/${p.trekSlug}`} className="flex-1">
                    <button className="w-full py-3 rounded-xl border border-border-subtle text-xs font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary hover:border-text-faint transition-all active:scale-95">
                      Data
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div 
                onClick={() => setOpen(true)}
                className="premium-card rounded-2xl p-16 border-dashed border-2 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-accent-cyan/50 transition-all bg-bg-surface-1/50"
              >
                <div className="w-16 h-16 rounded-full bg-bg-surface-3 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Folder className="w-8 h-8 text-text-faint group-hover:text-accent-cyan transition-all" />
                </div>
                <h3 className="text-base font-black text-text-primary uppercase tracking-widest">Aucune expédition en cours</h3>
                <p className="text-xs font-bold text-text-muted uppercase mt-3 tracking-widest">Initialisez votre premier Tactical Backbone</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="INITIALISER L'EXPÉDITION">
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Nom de mission</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: GR20_SUD_ALPHA..."
              className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-5 py-4 text-sm font-black text-text-primary focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 outline-none transition-all placeholder:text-text-faint"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Terrain cible</label>
              <select
                value={trekSlug}
                onChange={(e) => setTrekSlug(e.target.value)}
                className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-5 py-4 text-sm font-black text-text-primary focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 outline-none transition-all"
              >
                {treks.map(t => <option key={t.slug} value={t.slug}>{t.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Fenêtre de départ</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-5 py-4 text-sm font-black text-text-primary focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-5 pt-6">
            <button 
              onClick={() => setOpen(false)}
              className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
            >
              Abandonner
            </button>
            <button 
              onClick={onCreate}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(138,180,248,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Icons.Zap className="w-4 h-4" />
              Lancer Mission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
