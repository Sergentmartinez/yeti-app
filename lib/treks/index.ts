import { GR20 } from "./gr20";
import { TMB } from "./tmb";
import { CAMINO } from "./camino";
import { Trek } from "@/types";
import { GR20_TRACKS } from "./tracks/gr20-tracks";

// Connecter les tracks GPX aux stages GR20
GR20.stages.forEach((stage, index) => {
  const trackData = GR20_TRACKS[index + 1];
  if (trackData) {
    stage.track = trackData;
  }
});

const TREKS: Record<string, Trek> = {
  [GR20.slug]: GR20,
  [TMB.slug]: TMB,
  [CAMINO.slug]: CAMINO,
};

export function getTrekBySlug(slug: string): Trek | undefined {
  return TREKS[slug];
}

export function getAllTreks(): Trek[] {
  return Object.values(TREKS);
}