import { AdventureProject, Purchase, ProductKey } from "@/types/projects";

const LS_PROJECTS = "yeti.projects.v1";
const LS_PURCHASES = "yeti.purchases.v1";

function nowISO() {
  return new Date().toISOString();
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function listProjects(): AdventureProject[] {
  if (typeof window === "undefined") return [];
  const items = safeParse<AdventureProject[]>(localStorage.getItem(LS_PROJECTS), []);
  return items.sort((a,b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export function getProject(id: string): AdventureProject | undefined {
  return listProjects().find(p => p.id === id);
}

export function upsertProject(p: AdventureProject): AdventureProject {
  if (typeof window === "undefined") return p;
  const all = listProjects();
  const idx = all.findIndex(x => x.id === p.id);
  const next = { ...p, updatedAt: nowISO() };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  localStorage.setItem(LS_PROJECTS, JSON.stringify(all));
  return next;
}

export function createProject(input: { name: string; trekSlug: string; startDate?: string; members?: { name: string }[] }): AdventureProject {
  const id = crypto.randomUUID();
  const createdAt = nowISO();
  const members = (input.members || [{ name: "Moi" }]).map(m => ({
    id: crypto.randomUUID(),
    name: m.name,
    role: m.name === "Moi" ? "leader" : "member",
  }));
  const p: AdventureProject = {
    id,
    name: input.name,
    trekSlug: input.trekSlug,
    startDate: input.startDate,
    status: "planning",
    members,
    createdAt,
    updatedAt: createdAt,
  };
  return upsertProject(p);
}

export function deleteProject(id: string) {
  if (typeof window === "undefined") return;
  const all = listProjects().filter(p => p.id !== id);
  localStorage.setItem(LS_PROJECTS, JSON.stringify(all));
  // keep purchases; user may want history
}

export function listPurchases(): Purchase[] {
  if (typeof window === "undefined") return [];
  return safeParse<Purchase[]>(localStorage.getItem(LS_PURCHASES), []);
}

export function hasEntitlement(projectId: string, feature: "sherpa" | "group" | "full"): boolean {
  const purchases = listPurchases().filter(p => p.projectId === projectId);
  const keys = new Set(purchases.map(p => p.productKey));
  if (feature === "full") return keys.has("full_pack");
  if (feature === "sherpa") return keys.has("sherpa_diagnostic") || keys.has("full_pack");
  if (feature === "group") return keys.has("group_mode") || keys.has("full_pack");
  return false;
}

export function recordPurchase(projectId: string, productKey: ProductKey, amountEUR: number): Purchase {
  if (typeof window === "undefined") {
    return { id: "server", projectId, productKey, amountEUR, createdAt: nowISO() };
  }
  const p: Purchase = {
    id: crypto.randomUUID(),
    projectId,
    productKey,
    amountEUR,
    createdAt: nowISO(),
  };
  const all = listPurchases();
  all.unshift(p);
  localStorage.setItem(LS_PURCHASES, JSON.stringify(all));
  return p;
}
