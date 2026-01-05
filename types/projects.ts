export type ProjectStatus = "planning" | "ready" | "completed";

export type ProductKey = "sherpa_diagnostic" | "group_mode" | "full_pack";

export interface ProjectMember {
  id: string;
  name: string;
  role?: "leader" | "member";
}

export interface AdventureProject {
  id: string; // adventureId
  name: string;
  trekSlug: string;
  startDate?: string; // ISO yyyy-mm-dd
  status: ProjectStatus;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  projectId: string;
  productKey: ProductKey;
  amountEUR: number;
  createdAt: string;
}
