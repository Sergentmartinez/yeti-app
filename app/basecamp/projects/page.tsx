"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllTreks } from "@/lib/treks";
import { createProject, deleteProject, listProjects } from "@/lib/projects/local";
import { AdventureProject } from "@/types/projects";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const treks = useMemo(() => getAllTreks(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trekSlug, setTrekSlug] = useState(treks[0]?.slug ?? "gr20");
  const [startDate, setStartDate] = useState("");

  const [tick, setTick] = useState(0);
  const projects = useMemo(() => listProjects(), [tick]);

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
    if (!confirm(`Supprimer le projet “${p.name}” ?`)) return;
    deleteProject(p.id);
    refresh();
  }

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-300">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Icons.Folder className="w-6 h-6 text-accent-cyan" />
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Mes Projets</h1>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">Gestion des expéditions</p>
          </div>
        </div>
        <button 
          onClick={() => setOpen(true)}
          className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Nouveau Projet</span>
        </button>
      </header>

      <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-slide-up">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="premium-card rounded-2xl p-6 flex flex-col group transition-all hover:translate-y-[-2px]">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="flex-1">
                  <div className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-accent-cyan transition-colors">{p.name}</div>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="text-[10px] font-bold text-text-faint uppercase tracking-wider flex items-center gap-2">
                      <Icons.MapPin className="w-3 h-3" /> Trek: <span className="text-text-muted">{p.trekSlug}</span>
                    </div>
                    {p.startDate && (
                      <div className="text-[10px] font-bold text-text-faint uppercase tracking-wider flex items-center gap-2">
                        <Icons.Calendar className="w-3 h-3" /> Départ: <span className="text-text-muted">{p.startDate}</span>
                      </div>
                    )}
                    <div className="text-[10px] font-bold text-text-faint uppercase tracking-wider flex items-center gap-2">
                      <Icons.Users className="w-3 h-3" /> Membres: <span className="text-text-muted">{p.members.length}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(p)} 
                  className="rounded-lg p-2 text-text-faint hover:text-accent-red hover:bg-accent-red/10 transition-colors" 
                  aria-label="Supprimer"
                >
                  <Icons.Trash className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-border-subtle flex gap-3">
                <Link href={`/basecamp/projects/${p.id}`} className="flex-1">
                  <button className="w-full py-2 rounded-xl bg-bg-surface-3 text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-bg-surface-4 transition-colors">
                    Ouvrir
                  </button>
                </Link>
                <Link href={`/treks/${p.trekSlug}`} className="flex-1">
                  <button className="w-full py-2 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary hover:border-text-faint transition-colors">
                    Détails
                  </button>
                </Link>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div 
              onClick={() => setOpen(true)}
              className="premium-card rounded-2xl p-12 border-dashed border-2 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-accent-cyan/50 transition-colors"
            >
              <Icons.Folder className="w-12 h-12 text-text-faint mb-4 group-hover:text-accent-cyan/50 transition-all" />
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Aucun projet actif</h3>
              <p className="text-[10px] font-bold text-text-faint uppercase mt-2">Commencez une nouvelle aventure</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="CRÉER UN PROJET">
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-faint uppercase tracking-widest">Nom de l&apos;Aventure</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: GR20 SUD JUILLET..."
              className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-sm font-black text-text-primary focus:ring-1 focus:ring-accent-cyan/50 outline-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-faint uppercase tracking-widest">Trek</label>
              <select
                value={trekSlug}
                onChange={(e) => setTrekSlug(e.target.value)}
                className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-sm font-black text-text-primary focus:ring-1 focus:ring-accent-cyan/50"
              >
                {treks.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-faint uppercase tracking-widest">Date prévue</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-sm font-black text-text-primary focus:ring-1 focus:ring-accent-cyan/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-faint hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onCreate}
              className="px-8 py-3 rounded-xl bg-accent-cyan text-bg-surface-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-cyan/20 hover:scale-105 transition-all"
            >
              Lancer l&apos;Aventure
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
