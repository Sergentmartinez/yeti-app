// app/basecamp/routes/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Map as MapIcon, Mountain, Route as RouteIcon, MapPin, Calendar, TrendingUp,
  Upload, Download, RefreshCw, Plus, X, ChevronRight, Layers,
  Box, Activity, Flag, Search, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// DYNAMIC IMPORTS (Leaflet + Three.js = client only)
// ============================================================================
const ExpeditionMap = dynamic(() => import("@/components/maps/ExpeditionMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

const Route3DView = dynamic(() => import("@/components/maps/Route3DView"), {
  ssr: false,
  loading: () => <MapLoader />,
});

const MapLoader = () => (
  <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center rounded-2xl border border-white/[0.08]">
    <div className="flex items-center gap-3 text-zinc-500">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-sm">Chargement de la carte…</span>
    </div>
  </div>
);

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  blue: "#3b82f6",
};

// ============================================================================
// TYPES
// ============================================================================
interface Stage {
  id: number;
  name: string;
  dist: string;
  elev: string;
  absElev: string;
  status: "completed" | "active" | "pending";
  coords?: [number, number];
  day?: number;
}

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  name?: string;
}

// ============================================================================
// HELPERS
// ============================================================================
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// PAGE
// ============================================================================
export default function RoutesPage() {
  const [fullTrackPoints, setFullTrackPoints] = useState<TrackPoint[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [hoveredTrackPoint, setHoveredTrackPoint] = useState<TrackPoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [isFetchingElevation, setIsFetchingElevation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomToCoords, setZoomToCoords] = useState<[number, number] | null>(null);
  const [mapView, setMapView] = useState<"2d" | "3d">("2d");
  const [loadingGPX, setLoadingGPX] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // Form state
  const [stageName, setStageName] = useState("");
  const [stageCoords, setStageCoords] = useState<[number, number] | null>(null);
  const [stageElev, setStageElev] = useState("");
  const [stageAbsElev, setStageAbsElev] = useState("");
  const [stageDist, setStageDist] = useState("");

  // ============================================================================
  // LOAD GPX GR20 (15 étapes)
  // ============================================================================
  const loadGR20GPX = async () => {
    setLoadingGPX(true);
    try {
      const refugeInfo = [
        { name: "Calenzana", day: 1 },
        { name: "Ortu di u Piobbu", day: 2 },
        { name: "Carrozzu", day: 3 },
        { name: "Ascu Stagnu", day: 4 },
        { name: "Tighjettu", day: 5 },
        { name: "Ciottulu di i Mori", day: 6 },
        { name: "Manganu", day: 7 },
        { name: "Petra Piana", day: 8 },
        { name: "Onda", day: 9 },
        { name: "Vizzavona", day: 10 },
        { name: "Capannelle", day: 11 },
        { name: "Prati", day: 12 },
        { name: "Usciolu", day: 13 },
        { name: "Asinau", day: 14 },
        { name: "Paliri", day: 15 },
        { name: "Conca", day: 16 },
      ];

      const gpxFiles = [
        "gr20-e01-calenzana-ortu-gpstraces-11km-ibp91.gpx",
        "gr20-e02-ortu-carrozzu-gpstraces-8km-ibp103.gpx",
        "gr20-e03-carrozzu-ascu-stagnu-gpstraces-5km-ibp94.gpx",
        "gr20-e04-ascu-stagnu-bergerie-ballone-gpstraces-10km-ibp131.gpx",
        "gr20-e05-bergerie-ballone-ciottulu-di-imori-gpstraces-5km-ibp63.gpx",
        "gr20-e06-ciottulu-di-imori-manganu-gpstraces-25km-ibp115.gpx",
        "gr20-e07-manganu-petra-piana-gpstraces-9km-ibp96.gpx",
        "gr20-e08-petra-piana-onda-gpstraces-10km-ibp62.gpx",
        "gr20-e09-onda-vizzavona-gpstraces-11km-ibp92.gpx",
        "gr20-e10-vizzavona-capannelle-gpstraces-14km-ibp86.gpx",
        "gr20-e11-capannelle-prati-gpstraces-18km-ibp98.gpx",
        "gr20-e12-prati-usciolu-gpstraces-11km-ibp79.gpx",
        "gr20-e13-usciolu-asinau-gpstraces-17km-ibp98.gpx",
        "gr20-e14-asinau-paliri-gpstraces-12km-ibp76.gpx",
        "gr20-e15-paliri-conca-gpstraces-14km-ibp65.gpx",
      ];

      const allTrackPoints: TrackPoint[] = [];
      const endPoints: { lat: number; lon: number; ele: number; stageIndex: number }[] = [];
      const stageElevationGains: number[] = [];
      let cumulativeDistance = 0;

      for (let i = 0; i < gpxFiles.length; i++) {
        const response = await fetch(`/gpx/France/GR20/${gpxFiles[i]}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "application/xml");
        const trackElements = doc.querySelectorAll("trkpt");
        const segmentPoints: TrackPoint[] = [];

        trackElements.forEach((pt) => {
          const lat = parseFloat(pt.getAttribute("lat") || "0");
          const lon = parseFloat(pt.getAttribute("lon") || "0");
          const ele = parseFloat(pt.querySelector("ele")?.textContent || "0");
          const point = { lat, lon, ele };
          segmentPoints.push(point);
          allTrackPoints.push(point);
        });

        let elevationGain = 0;
        for (let j = 1; j < segmentPoints.length; j++) {
          const diff = segmentPoints[j].ele - segmentPoints[j - 1].ele;
          if (diff > 0) elevationGain += diff;
        }
        stageElevationGains.push(Math.round(elevationGain));

        if (i === 0 && segmentPoints.length > 0) {
          endPoints.push({ ...segmentPoints[0], stageIndex: 0 });
        }
        if (segmentPoints.length > 0) {
          endPoints.push({ ...segmentPoints[segmentPoints.length - 1], stageIndex: i + 1 });
        }
      }

      const mainStages: Stage[] = [];
      endPoints.forEach((point, index) => {
        if (index >= refugeInfo.length) return;
        let dist = "0";
        let elevGain = "0";
        if (index > 0) {
          const prevPoint = endPoints[index - 1];
          cumulativeDistance += calculateDistance(prevPoint.lat, prevPoint.lon, point.lat, point.lon);
          dist = cumulativeDistance.toFixed(1);
          elevGain = stageElevationGains[index - 1]?.toString() || "0";
        }
        mainStages.push({
          id: Date.now() + index,
          name: refugeInfo[index].name,
          dist,
          elev: elevGain,
          absElev: point.ele.toFixed(0),
          status: "active",
          coords: [point.lat, point.lon],
          day: refugeInfo[index].day,
        });
      });

      setFullTrackPoints(allTrackPoints);
      setStages(mainStages);
      if (mainStages.length > 0) setActiveStage(mainStages[0].id);
    } catch (error) {
      console.error("Failed to load GR20 GPX:", error);
    } finally {
      setLoadingGPX(false);
    }
  };

  useEffect(() => {
    loadGR20GPX();
  }, []);

  // Auto-scroll sidebar
  useEffect(() => {
    if (activeStage !== null && stageRefs.current[activeStage] && sidebarRef.current) {
      const stageElement = stageRefs.current[activeStage];
      const sidebar = sidebarRef.current;
      if (stageElement) {
        const sRect = sidebar.getBoundingClientRect();
        const eRect = stageElement.getBoundingClientRect();
        const offset = eRect.top - sRect.top - sRect.height / 2 + eRect.height / 2;
        sidebar.scrollTo({ top: sidebar.scrollTop + offset, behavior: "smooth" });
      }
    }
  }, [activeStage]);

  // ============================================================================
  // ELEVATION API (pour picking manuel)
  // ============================================================================
  const fetchRealElevationAtPoint = async (lat: number, lng: number) => {
    setIsFetchingElevation(true);
    try {
      const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      const data = await res.json();
      if (data.results?.[0]) {
        const elev = Math.round(data.results[0].elevation);
        setStageAbsElev(elev.toString());
        const lastStage = [...stages].reverse().find((s) => editingStageId ? s.id !== editingStageId : true);
        if (lastStage?.absElev) {
          setStageElev(Math.max(0, elev - parseInt(lastStage.absElev)).toString());
        }
      }
    } catch (error) {
      console.error("Elevation API failed", error);
    } finally {
      setIsFetchingElevation(false);
    }
  };

  // ============================================================================
  // STATS
  // ============================================================================
  const totalDist = useMemo(() => {
    let d = 0;
    for (let i = 1; i < fullTrackPoints.length; i++) {
      d += calculateDistance(
        fullTrackPoints[i - 1].lat,
        fullTrackPoints[i - 1].lon,
        fullTrackPoints[i].lat,
        fullTrackPoints[i].lon
      );
    }
    return d;
  }, [fullTrackPoints]);

  const totalElevGain = useMemo(() => {
    return stages.reduce((acc, s) => acc + parseInt(s.elev || "0"), 0);
  }, [stages]);

  const maxAlt = useMemo(() => {
    return fullTrackPoints.length > 0
      ? Math.max(...fullTrackPoints.map((p) => p.ele))
      : 0;
  }, [fullTrackPoints]);

  const daysCount = stages.length > 0 ? Math.max(...stages.map((s) => s.day || 0)) : 0;

  // Sample chart points
  const sampledTrackPoints = useMemo(() => {
    if (fullTrackPoints.length === 0) return [];
    const maxPoints = 500;
    if (fullTrackPoints.length <= maxPoints) return fullTrackPoints;
    const step = Math.floor(fullTrackPoints.length / maxPoints);
    const sampled: TrackPoint[] = [];
    for (let i = 0; i < fullTrackPoints.length; i += step) sampled.push(fullTrackPoints[i]);
    return sampled;
  }, [fullTrackPoints]);

  const chartPoints = useMemo(() => sampledTrackPoints.map((p) => p.ele), [sampledTrackPoints]);

  const stagePositionsOnChart = useMemo(() => {
    if (!stages.length || !sampledTrackPoints.length) return [];
    return stages
      .map((stage) => {
        if (!stage.coords) return { index: -1, stage };
        let closest = -1;
        let minDist = Infinity;
        sampledTrackPoints.forEach((p, idx) => {
          const d = calculateDistance(stage.coords![0], stage.coords![1], p.lat, p.lon);
          if (d < minDist) {
            minDist = d;
            closest = idx;
          }
        });
        return { index: closest, stage };
      })
      .filter((p) => p.index !== -1);
  }, [stages, sampledTrackPoints]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handlePointPicked = (lat: number, lng: number) => {
    setStageCoords([lat, lng]);
    let lastPoint: { lat: number; lon: number; ele: number } | undefined;
    if (editingStageId) {
      const s = stages.find((x) => x.id === editingStageId);
      if (s?.coords) lastPoint = { lat: s.coords[0], lon: s.coords[1], ele: parseFloat(s.absElev || "0") };
    }
    if (!lastPoint && fullTrackPoints.length > 0) lastPoint = fullTrackPoints[fullTrackPoints.length - 1];
    if (lastPoint) {
      setStageDist(calculateDistance(lastPoint.lat, lastPoint.lon, lat, lng).toFixed(1));
    }
    fetchRealElevationAtPoint(lat, lng);
    setIsPickingMode(false);
    setIsModalOpen(true);
  };

  const downloadGPX = () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="YETI" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>Mon Itinéraire GR20</name><trkseg>${fullTrackPoints
    .map((p) => `<trkpt lat="${p.lat}" lon="${p.lon}"><ele>${p.ele.toFixed(0)}</ele></trkpt>`)
    .join("")}</trkseg></trk>
</gpx>`;
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "itineraire_gr20_yeti.gpx";
    a.click();
  };

  const openEditModal = (id: number) => {
    const s = stages.find((x) => x.id === id);
    if (s) {
      setEditingStageId(id);
      setStageName(s.name);
      setStageElev(s.elev);
      setStageAbsElev(s.absElev);
      setStageDist(s.dist);
      setStageCoords(s.coords || null);
      setIsModalOpen(true);
    }
  };

  const openAddModal = () => {
    setEditingStageId(null);
    setStageName("");
    setStageCoords(null);
    setStageElev("");
    setStageAbsElev("");
    setStageDist("");
    setIsModalOpen(true);
  };

  const handleSaveStage = () => {
    if (!stageName) return;
    const stageData = {
      name: stageName,
      elev: stageElev || "0",
      absElev: stageAbsElev || "0",
      dist: stageDist || "0",
      coords: stageCoords || undefined,
      status: "active" as const,
    };
    if (editingStageId !== null) {
      setStages((prev) => prev.map((s) => (s.id === editingStageId ? { ...s, ...stageData, day: s.day } : s)));
    } else {
      const nextId = stages.length > 0 ? Math.max(...stages.map((s) => s.id)) + 1 : 1;
      if (stageCoords) {
        setFullTrackPoints((prev) => [
          ...prev,
          { lat: stageCoords[0], lon: stageCoords[1], ele: parseFloat(stageAbsElev || "0"), name: stageName },
        ]);
      }
      setStages((prev) => [...prev, { id: nextId, ...stageData, day: stages.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Itinéraire GR20 — Corse
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <RouteIcon className="text-[#f21e2c]" size={42} strokeWidth={1.5} />
                Mon itinéraire
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                La trace GPX officielle du GR20 chargée automatiquement. Vue carte 2D/3D,
                profil d'élévation interactif, et tous les refuges détectés.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".gpx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    // Minimal parse: just load track points
                    const xml = ev.target?.result as string;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(xml, "application/xml");
                    const pts: TrackPoint[] = [];
                    doc.querySelectorAll("trkpt").forEach((pt) => {
                      pts.push({
                        lat: parseFloat(pt.getAttribute("lat") || "0"),
                        lon: parseFloat(pt.getAttribute("lon") || "0"),
                        ele: parseFloat(pt.querySelector("ele")?.textContent || "0"),
                      });
                    });
                    setFullTrackPoints(pts);
                  };
                  reader.readAsText(file);
                }}
              />
              <ActionButton onClick={loadGR20GPX} icon={RefreshCw} label="Recharger" color={THEME.cyan} />
              <ActionButton onClick={() => fileInputRef.current?.click()} icon={Upload} label="Importer" color={THEME.violet} />
              <ActionButton onClick={downloadGPX} icon={Download} label="Exporter" color={THEME.emerald} />
            </div>
          </div>
        </header>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Distance totale"
            value={`${totalDist.toFixed(1)}`}
            unit="km"
            hint={`${fullTrackPoints.length.toLocaleString()} points GPS`}
            color={THEME.red}
            icon={RouteIcon}
          />
          <StatCard
            label="Dénivelé cumulé"
            value={`${totalElevGain.toLocaleString()}`}
            unit="m D+"
            hint="Sur tout le parcours"
            color={THEME.orange}
            icon={TrendingUp}
          />
          <StatCard
            label="Altitude max"
            value={`${maxAlt.toFixed(0)}`}
            unit="m"
            hint="Point culminant"
            color={THEME.violet}
            icon={Mountain}
          />
          <StatCard
            label="Jours de marche"
            value={`${daysCount}`}
            unit="jours"
            hint={`${stages.length} refuges`}
            color={THEME.emerald}
            icon={Calendar}
          />
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-12 gap-4">
          {/* SIDEBAR ÉTAPES */}
          <aside className="col-span-12 lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#111] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white uppercase tracking-wider">Étapes</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{stages.length} refuges</div>
              </div>
              <div className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-zinc-400">
                {totalDist.toFixed(0)} km
              </div>
            </div>

            <div ref={sidebarRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "calc(100vh - 420px)" }}>
              {loadingGPX && (
                <div className="flex items-center gap-2 text-zinc-500 text-xs py-8 justify-center">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Chargement GPX…
                </div>
              )}
              {stages.map((stage, i) => {
                const isNewDay = i === 0 || stage.day !== stages[i - 1]?.day;
                const prevDist = i > 0 ? parseFloat(stages[i - 1].dist) : 0;
                const segDist = (parseFloat(stage.dist) - prevDist).toFixed(1);
                const isActive = activeStage === stage.id;

                return (
                  <div key={stage.id}>
                    {isNewDay && stage.day && (
                      <div className="flex items-center gap-2 mt-3 mb-2 px-1">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#f21e2c]/30" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#f21e2c] bg-[#f21e2c]/10 px-2 py-0.5 rounded">
                          Jour {stage.day}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#f21e2c]/30" />
                      </div>
                    )}
                    <button
                      ref={(el) => {
                        stageRefs.current[stage.id] = el;
                      }}
                      onClick={() => setActiveStage(stage.id)}
                      onDoubleClick={() => openEditModal(stage.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all",
                        isActive
                          ? "bg-[#f21e2c]/10 border-[#f21e2c]/40"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-white truncate">{stage.name}</span>
                        {isActive && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#f21e2c] mt-1.5" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <MiniMetric label="KM" value={segDist} color="white" />
                        <MiniMetric label="D+" value={`+${stage.elev}`} color={THEME.cyan} />
                        <MiniMetric label="Alt" value={`${stage.absElev}m`} color={THEME.yellow} />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={openAddModal}
              className="m-3 py-3 rounded-xl border-2 border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Plus size={14} /> Nouvelle étape
            </button>
          </aside>

          {/* MAP + PROFILE */}
          <main className="col-span-12 lg:col-span-9 space-y-4">
            {/* MAP */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden" style={{ height: "500px" }}>
              {/* View switcher */}
              <div className="absolute top-4 left-4 z-[1001] flex gap-1 rounded-xl bg-[#0d0d0d]/95 backdrop-blur-md border border-white/10 p-1">
                <button
                  onClick={() => setMapView("2d")}
                  className={cn(
                    "px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors",
                    mapView === "2d"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Layers size={12} /> 2D
                </button>
                <button
                  onClick={() => setMapView("3d")}
                  className={cn(
                    "px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors",
                    mapView === "3d"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Box size={12} /> 3D
                </button>
              </div>

              {/* Picking indicator */}
              {isPickingMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] px-5 py-2 bg-[#F9591F] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-2xl animate-pulse">
                  Cliquez sur la carte pour placer une étape
                </div>
              )}

              {mapView === "2d" ? (
                <ExpeditionMap
                  stages={fullTrackPoints}
                  refuges={stages}
                  activeStageId={activeStage}
                  pickingMode={isPickingMode}
                  onSelectPoint={handlePointPicked}
                  onHoverPoint={setHoveredTrackPoint}
                  hoveredPoint={hoveredTrackPoint}
                  zoomToCoords={zoomToCoords}
                  onZoomEnd={() => setZoomToCoords(null)}
                />
              ) : (
                <Route3DView
                  trackPoints={fullTrackPoints}
                  refuges={stages}
                  activeStageId={activeStage}
                  hoveredPoint={hoveredTrackPoint}
                />
              )}
            </div>

            {/* ELEVATION PROFILE */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <Activity size={14} className="text-[#f21e2c]" />
                    Profil d'élévation
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {chartPoints.length} points échantillonnés
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">Min</span>
                    <span className="font-black text-cyan-400 tabular-nums">
                      {chartPoints.length > 0 ? Math.min(...chartPoints).toFixed(0) : 0}m
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">Max</span>
                    <span className="font-black text-orange-400 tabular-nums">
                      {chartPoints.length > 0 ? Math.max(...chartPoints).toFixed(0) : 0}m
                    </span>
                  </div>
                </div>
              </div>

              {chartPoints.length > 0 ? (
                <div
                  className="relative w-full flex items-end gap-[1px]"
                  style={{ height: "160px" }}
                  onMouseMove={(e) => {
                    if (sampledTrackPoints.length === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const idx = Math.floor((x / rect.width) * sampledTrackPoints.length);
                    if (idx >= 0 && idx < sampledTrackPoints.length) {
                      setHoveredTrackPoint(sampledTrackPoints[idx]);
                    }
                  }}
                  onMouseLeave={() => setHoveredTrackPoint(null)}
                >
                  {chartPoints.map((elev, i) => {
                    const minE = Math.min(...chartPoints);
                    const maxE = Math.max(...chartPoints);
                    const range = maxE - minE || 1;
                    const h = ((elev - minE) / range) * 100;
                    const isHovered =
                      hoveredTrackPoint &&
                      sampledTrackPoints[i] &&
                      hoveredTrackPoint.lat === sampledTrackPoints[i].lat;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-t-sm transition-all duration-75",
                          "bg-gradient-to-t from-[#f21e2c] via-[#F9591F] to-[#FEC631]",
                          isHovered ? "opacity-100 scale-x-[2]" : "opacity-60"
                        )}
                        style={{ height: `${Math.max(3, h)}%` }}
                      />
                    );
                  })}

                  {/* Stage markers */}
                  {stagePositionsOnChart.map(({ index, stage }, i) => {
                    const isActive = activeStage === stage.id;
                    const isAlt = i % 2 === 1;
                    return (
                      <div
                        key={stage.id}
                        className="absolute top-0 h-full flex flex-col items-center cursor-pointer group"
                        style={{
                          left: `${(index / sampledTrackPoints.length) * 100}%`,
                          transform: "translateX(-50%)",
                        }}
                        onClick={() => setActiveStage(stage.id)}
                      >
                        <div
                          className={cn(
                            "w-0.5 h-full transition-all",
                            isActive ? "bg-[#f21e2c]/70" : "bg-white/20 group-hover:bg-[#f21e2c]/50"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all border-2",
                            isActive
                              ? "bg-[#f21e2c] border-white text-white scale-110"
                              : "bg-[#1a1a1a] border-zinc-600 text-zinc-300 group-hover:border-[#f21e2c]",
                            isAlt ? "top-[-10px]" : "bottom-[-10px]"
                          )}
                        >
                          {stage.day}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tooltip */}
                  {hoveredTrackPoint && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 border border-[#f21e2c]/30 text-white z-20 pointer-events-none">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Altitude</div>
                      <div className="text-lg font-black text-[#f21e2c] tabular-nums">
                        {hoveredTrackPoint.ele.toFixed(0)} m
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center text-zinc-500 text-sm" style={{ height: "160px" }}>
                  Chargement du profil…
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ============ MODAL ÉTAPE ============ */}
      <AnimatePresence>
        {isModalOpen && (
          <StageEditModal
            isEditing={editingStageId !== null}
            stageName={stageName}
            setStageName={setStageName}
            stageCoords={stageCoords}
            stageAbsElev={stageAbsElev}
            setStageAbsElev={setStageAbsElev}
            stageElev={stageElev}
            setStageElev={setStageElev}
            stageDist={stageDist}
            setStageDist={setStageDist}
            isFetchingElevation={isFetchingElevation}
            onPickPoint={() => {
              setIsModalOpen(false);
              setIsPickingMode(true);
            }}
            onSave={handleSaveStage}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ActionButton = ({
  onClick,
  icon: Icon,
  label,
  color,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  color: string;
}) => (
  <button
    onClick={onClick}
    className="h-10 px-3.5 rounded-xl border border-white/10 bg-[#111] hover:bg-[#161616] flex items-center gap-2 transition-colors group"
  >
    <Icon size={14} style={{ color }} />
    <span className="text-[11px] font-bold text-white">{label}</span>
  </button>
);

const StatCard = ({
  label,
  value,
  unit,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <Icon size={14} className="text-zinc-600" />
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-black tracking-tight tabular-nums" style={{ color }}>
        {value}
      </span>
      {unit && <span className="text-xs font-bold text-zinc-500">{unit}</span>}
    </div>
    {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
  </div>
);

const MiniMetric = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
    <span
      className="text-xs font-black tabular-nums"
      style={{ color: color === "white" ? "#ffffff" : color }}
    >
      {value}
    </span>
  </div>
);

const StageEditModal = ({
  isEditing,
  stageName,
  setStageName,
  stageCoords,
  stageAbsElev,
  setStageAbsElev,
  stageElev,
  setStageElev,
  stageDist,
  setStageDist,
  isFetchingElevation,
  onPickPoint,
  onSave,
  onClose,
}: {
  isEditing: boolean;
  stageName: string;
  setStageName: (v: string) => void;
  stageCoords: [number, number] | null;
  stageAbsElev: string;
  setStageAbsElev: (v: string) => void;
  stageElev: string;
  setStageElev: (v: string) => void;
  stageDist: string;
  setStageDist: (v: string) => void;
  isFetchingElevation: boolean;
  onPickPoint: () => void;
  onSave: () => void;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
    >
      <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">
            {isEditing ? "Modifier l'étape" : "Nouvelle étape"}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Définissez le point de passage, l'altitude et la distance
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <button
          onClick={onPickPoint}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-[#f21e2c]/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#f21e2c]/10 flex items-center justify-center">
              <MapPin size={16} className="text-[#f21e2c]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Localisation GPS
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {stageCoords
                  ? `${stageCoords[0].toFixed(4)}, ${stageCoords[1].toFixed(4)}`
                  : "Cliquer pour placer sur la carte"}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
            Nom de l'étape
          </label>
          <input
            type="text"
            placeholder="Ex: Refuge de Petra Piana"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#f21e2c]/50 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Altitude
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={stageAbsElev}
                onChange={(e) => setStageAbsElev(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#f21e2c]/50 text-sm tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">m</span>
              {isFetchingElevation && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              D+
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={stageElev}
                onChange={(e) => setStageElev(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#f21e2c]/50 text-sm tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">m</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Distance
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={stageDist}
                onChange={(e) => setStageDist(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#f21e2c]/50 text-sm tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold transition-colors"
        >
          {isEditing ? "Mettre à jour" : "Ajouter l'étape"}
        </button>
      </div>
    </motion.div>
  </motion.div>
);
