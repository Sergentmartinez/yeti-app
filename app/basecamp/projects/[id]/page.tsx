"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTrekBySlug } from "@/lib/treks";
import { getProject, hasEntitlement } from "@/lib/projects/local";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/icons";

export default function ProjectDashboard() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [tick, setTick] = useState(0);

  const project = useMemo(() => getProject(id), [id, tick]);
  const trek = useMemo(() => (project ? getTrekBySlug(project.trekSlug) : undefined), [project]);

  const sherpaOn = hasEntitlement(id, "sherpa");
  const groupOn = hasEntitlement(id, "group");

  const [payOpen, setPayOpen] = useState(false);
  const [defaultProduct, setDefaultProduct] = useState<"sherpa_diagnostic"|"group_mode"|"full_pack">("sherpa_diagnostic");

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-sm text-zinc-400">Projet introuvable.</div>
        <div className="mt-4">
          <Link href="/basecamp/projects"><Button>Retour</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Projet</div>
          <h1 className="mt-1 text-2xl font-black text-white">{project.name}</h1>
          <div className="mt-2 text-sm text-zinc-400">
            Trek: <span className="text-white">{trek?.name ?? project.trekSlug}</span>
            {project.startDate ? <> • Départ: <span className="text-white">{project.startDate}</span></> : null}
            {" "}• Membres: <span className="text-white">{project.members.length}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/basecamp/projects"><Button variant="outline">Mes projets</Button></Link>
          <Link href={`/treks/${project.trekSlug}`}><Button variant="outline">Voir le trek</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">Diagnostic Sherpa</div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold ${sherpaOn ? "bg-green-900/30 text-green-300" : "bg-zinc-900 text-zinc-400"}`}>
              {sherpaOn ? "Actif" : "Verrouillé"}
            </div>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Analyse de cohérence (sac ↔ dates ↔ difficulté) et recommandations priorisées.
          </p>
          {sherpaOn ? (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300">
              <div className="flex gap-2">
                <Icons.Gauge className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="font-bold text-white">Score de préparation : 72/100</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    V1 : logique simple. V2 : règles versionnées + météo + morphologie.
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-400">
                Exemple : “réduire 400g sur abri / cuisson” + “ajouter couche pluie fiable”.
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={() => { setDefaultProduct("sherpa_diagnostic"); setPayOpen(true); }}>
                <Icons.Lock className="mr-2 h-4 w-4" />
                Activer (7€ / projet)
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">Mode Groupe</div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold ${groupOn ? "bg-green-900/30 text-green-300" : "bg-zinc-900 text-zinc-400"}`}>
              {groupOn ? "Actif" : "Verrouillé"}
            </div>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Répartit le matériel partagé et génère une liste par personne.
          </p>
          {groupOn ? (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300">
              <div className="font-bold text-white">Répartition (exemple)</div>
              <div className="mt-2 text-xs text-zinc-400">
                Tente → Alice • Réchaud → Moi • Popote → Bob
              </div>
              <div className="mt-3">
                <Button variant="outline">Exporter par personne</Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={() => { setDefaultProduct("group_mode"); setPayOpen(true); }}>
                <Icons.Users className="mr-2 h-4 w-4" />
                Activer (12€ / projet)
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">Dossier complet</div>
            <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">Bundle</div>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Diagnostic + Groupe + export “dossier de préparation” (OSINT-safe).
          </p>
          <div className="mt-4">
            <Button onClick={() => { setDefaultProduct("full_pack"); setPayOpen(true); }}>
              <Icons.FileText className="mr-2 h-4 w-4" />
              Débloquer (15€ / projet)
            </Button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Le PDF est un livrable de préparation (pas un document certifié).
          </p>
        </div>
      </div>

      <PaywallModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        projectId={id}
        defaultProduct={defaultProduct}
        onPurchased={() => setTick(t => t + 1)}
      />
    </div>
  );
}
