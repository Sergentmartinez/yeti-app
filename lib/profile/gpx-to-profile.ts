export interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
  distanceFromStart?: number;
}

export interface ProfilePoint {
  x: number;
  y: number;
}

export interface ProfilePOI {
  x: number;
  y: number;
  label: string;
  type: string;
}

export interface StageProfile {
  points: ProfilePoint[];
  pois: ProfilePOI[];
  bounds: {
    minAlt: number;
    maxAlt: number;
    totalDist: number;
  };
}

function haversine(a: GPXPoint, b: GPXPoint): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function gpxToProfile(
  gpx: GPXPoint[],
  pois: { gpxIndex: number; label: string; type: string }[]
): StageProfile {
  let dist = 0;
  const enriched = gpx.map((p, i) => {
    if (i > 0) dist += haversine(gpx[i - 1], p);
    return { ...p, distanceFromStart: dist };
  });

  const minAlt = Math.min(...enriched.map(p => p.ele));
  const maxAlt = Math.max(...enriched.map(p => p.ele));

  const points = enriched.map(p => ({
    x: p.distanceFromStart ?? 0,
    y: p.ele,
  }));

  const projectedPois = pois.map(p => {
    const ref = enriched[p.gpxIndex];
    return {
      x: ref.distanceFromStart ?? 0,
      y: ref.ele,
      label: p.label,
      type: p.type,
    };
  });

  return {
    points,
    pois: projectedPois,
    bounds: {
      minAlt,
      maxAlt,
      totalDist: dist,
    },
  };
}
