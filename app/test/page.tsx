import { StageDetailsPanel } from "@/components/trek/StageDetailsPanel";
import { GPXPoint } from "@/lib/geo/gpx/parseGPX";

const points: GPXPoint[] = [
  { lat: 0, lon: 0, ele: 400 },
  { lat: 0, lon: 0, ele: 600 },
  { lat: 0, lon: 0, ele: 900 },
  { lat: 0, lon: 0, ele: 700 },
  { lat: 0, lon: 0, ele: 1100 },
  { lat: 0, lon: 0, ele: 800 },
];

const pois = [
  {
    id: "col",
    label: "Col historique",
    type: "history" as const,
    index: 2,
    description: "Col de passage ancien.",
  },
  {
    id: "danger",
    label: "Passage exposé",
    type: "danger" as const,
    index: 4,
    description: "Zone technique – vigilance.",
  },
  {
    id: "refuge",
    label: "Refuge",
    type: "refuge" as const,
    index: 1,
    description: "Refuge gardé – eau potable.",
  },
];

export default function TestPage() {
  return (
    <div style={{ padding: 40 }}>
      <StageDetailsPanel points={points} pois={pois} />
    </div>
  );
}
