"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllTreks } from "@/lib/treks";
import { createProject, deleteProject, listProjects } from "@/lib/projects/local";
import { AdventureProject } from "@/types/projects";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/icons";

export default function ProjectsPage() {
  const treks = useMemo(() => getAllTreks(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trekSlug, setTrekSlug] = useState(treks[0]?.slug ?? "gr20");
  const [startDate, setStartDate] = useState("");

  const [tick, setTick] = useState(0);
  const projects = listProjects();

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
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Mes projets</h1>
          <p className="mt-1 text-sm text-zinc-400">Chaque projet = une expédition datée + un groupe + un sac.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icons.Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <div key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{p.name}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Trek: <span className="text-zinc-300">{p.trekSlug}</span>
                  {p.startDate ? <> • Départ: <span className="text-zinc-300">{p.startDate}</span></> : null}
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  Membres: <span className="text-zinc-300">{p.members.length}</span>
                </div>
              </div>
              <button onClick={() => onDelete(p)} className="rounded-lg p-2 hover:bg-zinc-900" aria-label="Supprimer">
                <Icons.Trash className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href={`/basecamp/projects/${p.id}`} className="flex-1">
                <Button className="w-full">Ouvrir</Button>
              </Link>
              <Link href={`/treks/${p.trekSlug}`} className="flex-1">
                <Button variant="outline" className="w-full">Voir le trek</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Créer un projet">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-300">Nom du projet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Mon GR20 Juillet 2026"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-300">Trek</label>
              <select
                value={trekSlug}
                onChange={(e) => setTrekSlug(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              >
                {treks.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300">Date de départ</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={onCreate}>Créer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
