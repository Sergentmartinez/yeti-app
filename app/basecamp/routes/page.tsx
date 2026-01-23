// app/basecamp/routes/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useYetiStore } from '@/lib/store/useYetiStore';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import type { Phase } from '@/lib/types/timeline';

// Port dynamiquement la map pour éviter les erreurs SSR de Leaflet
const ExpeditionMap = dynamic(() => import('@/components/maps/ExpeditionMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg-surface-2 animate-pulse flex items-center justify-center rounded-2xl">
      <Icons.Map className="w-12 h-12 text-text-faint" />
    </div>
  )
});

const Route3DView = dynamic(() => import('@/components/maps/Route3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg-surface-2 animate-pulse flex items-center justify-center rounded-2xl">
      <Icons.Map className="w-12 h-12 text-text-faint" />
    </div>
  )
});

interface Stage {
    id: number;
    name: string;
    dist: string;
    elev: string; // This is D+ for the stage
    absElev: string; // Absolute elevation for the chart
    status: 'completed' | 'active' | 'pending';
    coords?: [number, number];
    day?: number; // Add day for sidebar display
}

interface TrackPoint {
    lat: number;
    lon: number;
    ele: number;
    name?: string; // Optional name for track points if available
}

export default function ItineraryPage() {
    const [fullTrackPoints, setFullTrackPoints] = useState<TrackPoint[]>([]);
    const [stages, setStages] = useState<Stage[]>([]); // For refuges/key stops
    const [activeStage, setActiveStage] = useState<number | null>(null);
    const [hoveredTrackPoint, setHoveredTrackPoint] = useState<TrackPoint | null>(null); // For map/profile sync
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStageId, setEditingStageId] = useState<number | null>(null);
    const [isPickingMode, setIsPickingMode] = useState(false);
    const [isFetchingElevation, setIsFetchingElevation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [zoomToCoords, setZoomToCoords] = useState<[number, number] | null>(null);
    const [mapView, setMapView] = useState<'2d' | '3d'>('2d');
    const sidebarRef = useRef<HTMLDivElement>(null);
    const stageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const { createProject } = useYetiStore();
    
    // Form state for adding/editing custom stages
    const [stageName, setStageName] = useState("");
    const [stageCoords, setStageCoords] = useState<[number, number] | null>(null);
    const [stageElev, setStageElev] = useState("");
    const [stageAbsElev, setStageAbsElev] = useState("");
    const [stageDist, setStageDist] = useState("");

    const REFUGES_KEYWORDS = [
        "refuge", "bergerie", "bivouac", 
        "Tighjettu", "Carozzu", "Ciottulu di i Mori", "Manganu", 
        "Petra Piana", "Onda", "Vizzavona", "Capannelle", 
        "Prati", "Usciolu", "Asinao", "I Croci", "Paliri", "Conca", "Calenzana"
    ];

    const isRefugeWaypoint = (name: string) => {
        const lowerName = name.toLowerCase();
        return REFUGES_KEYWORDS.some(keyword => lowerName.includes(keyword.toLowerCase()));
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Generic GPX parsing function
    const parseGPXData = (xml: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        
        const trackPoints: TrackPoint[] = [];
        const trackElements = doc.querySelectorAll("trkpt");
        trackElements.forEach(pt => {
            const lat = parseFloat(pt.getAttribute("lat") || "0");
            const lon = parseFloat(pt.getAttribute("lon") || "0");
            const ele = parseFloat(pt.querySelector("ele")?.textContent || "0");
            trackPoints.push({ lat, lon, ele });
        });

        const refugeStages: Stage[] = [];
        const waypointElements = doc.querySelectorAll("wpt");
        let dayCounter = 1;
        let prevRefugeCoords: [number, number] | null = null;
        let prevRefugeAbsElev: number | null = null;
        let cumulativeDistance = 0;

        // Add Calenzana as the starting point if not already in waypoints
        if (trackPoints.length > 0 && !Array.from(waypointElements).some(wpt => wpt.querySelector("name")?.textContent?.toLowerCase().includes("calenzana"))) {
            const firstTrkPt = trackPoints[0];
            refugeStages.push({
                id: Date.now(), // Unique ID
                name: "Calenzana",
                dist: "0", // Initial distance
                elev: "0", // Initial elevation gain
                absElev: firstTrkPt.ele.toFixed(0),
                status: 'active',
                coords: [firstTrkPt.lat, firstTrkPt.lon],
                day: dayCounter++
            });
            prevRefugeCoords = [firstTrkPt.lat, firstTrkPt.lon];
            prevRefugeAbsElev = firstTrkPt.ele;
        }

        Array.from(waypointElements).forEach((wpt, index) => {
            const name = wpt.querySelector("name")?.textContent || `Waypoint ${index + 1}`;
            if (isRefugeWaypoint(name)) {
                const lat = parseFloat(wpt.getAttribute("lat") || "0");
                const lon = parseFloat(wpt.getAttribute("lon") || "0");
                const ele = parseFloat(wpt.querySelector("ele")?.textContent || "0");

                let dist = "0";
                let elevGain = "0";

                if (prevRefugeCoords && prevRefugeAbsElev !== null) {
                    const segmentDistance = calculateDistance(prevRefugeCoords[0], prevRefugeCoords[1], lat, lon);
                    cumulativeDistance += segmentDistance;
                    dist = cumulativeDistance.toFixed(1);
                    elevGain = (ele - prevRefugeAbsElev).toFixed(0);
                } else if (trackPoints.length > 0) { // First refuge, calculate from start of track
                    const firstTrkPt = trackPoints[0];
                    const segmentDistance = calculateDistance(firstTrkPt.lat, firstTrkPt.lon, lat, lon);
                    cumulativeDistance += segmentDistance;
                    dist = cumulativeDistance.toFixed(1);
                    elevGain = (ele - firstTrkPt.ele).toFixed(0);
                }

                refugeStages.push({
                    id: Date.now() + index, // Unique ID
                    name: name,
                    dist: dist,
                    elev: elevGain,
                    absElev: ele.toFixed(0),
                    status: 'active',
                    coords: [lat, lon],
                    day: dayCounter++
                });

                prevRefugeCoords = [lat, lon];
                prevRefugeAbsElev = ele;
            }
        });
        return { trackPoints, refugeStages };
    };

    const loadGR20GPX = async () => {
        try {
            // Les 16 refuges principaux du GR20 avec leurs positions approximatives
            const refugeStages = [
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
                { name: "Conca", day: 16 }
            ];

            // Liste des 15 fichiers GPX des étapes du GR20
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
                "gr20-e15-paliri-conca-gpstraces-14km-ibp65.gpx"
            ];

            const allTrackPoints: TrackPoint[] = [];
            const endPoints: { lat: number; lon: number; ele: number; stageIndex: number }[] = [];
            const stageElevationGains: number[] = []; // D+ pour chaque étape
            let cumulativeDistance = 0;

            // Charger tous les fichiers GPX
            for (let i = 0; i < gpxFiles.length; i++) {
                const response = await fetch(`/gpx/France/GR20/${gpxFiles[i]}`);
                const xmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(xmlText, "application/xml");
                
                // Extraire tous les points de trace
                const trackElements = doc.querySelectorAll("trkpt");
                const segmentPoints: TrackPoint[] = [];
                
                trackElements.forEach(pt => {
                    const lat = parseFloat(pt.getAttribute("lat") || "0");
                    const lon = parseFloat(pt.getAttribute("lon") || "0");
                    const ele = parseFloat(pt.querySelector("ele")?.textContent || "0");
                    const point = { lat, lon, ele };
                    segmentPoints.push(point);
                    allTrackPoints.push(point);
                });

                // Calculer le D+ réel pour cette étape
                let elevationGain = 0;
                for (let j = 1; j < segmentPoints.length; j++) {
                    const diff = segmentPoints[j].ele - segmentPoints[j - 1].ele;
                    if (diff > 0) {
                        elevationGain += diff;
                    }
                }
                stageElevationGains.push(Math.round(elevationGain));

                // Stocker le point de départ de la première étape
                if (i === 0 && segmentPoints.length > 0) {
                    endPoints.push({
                        ...segmentPoints[0],
                        stageIndex: 0
                    });
                }

                // Stocker le point d'arrivée de chaque étape
                if (segmentPoints.length > 0) {
                    endPoints.push({
                        ...segmentPoints[segmentPoints.length - 1],
                        stageIndex: i + 1
                    });
                }
            }

            // Créer les stages à partir des points de départ/arrivée
            const mainStages: Stage[] = [];
            endPoints.forEach((point, index) => {
                if (index >= refugeStages.length) return;

                let dist = "0";
                let elevGain = "0";

                if (index > 0) {
                    const prevPoint = endPoints[index - 1];
                    const segmentDist = calculateDistance(
                        prevPoint.lat, prevPoint.lon,
                        point.lat, point.lon
                    );
                    cumulativeDistance += segmentDist;
                    dist = cumulativeDistance.toFixed(1);
                    // Utiliser le D+ calculé réellement depuis les points GPX
                    elevGain = stageElevationGains[index - 1]?.toString() || "0";
                }

                mainStages.push({
                    id: Date.now() + index,
                    name: refugeStages[index].name,
                    dist: dist,
                    elev: elevGain,
                    absElev: point.ele.toFixed(0),
                    status: 'active',
                    coords: [point.lat, point.lon],
                    day: refugeStages[index].day
                });
            });

            setFullTrackPoints(allTrackPoints);
            setStages(mainStages);

            if (mainStages.length > 0) {
                setActiveStage(mainStages[0].id);
            }
        } catch (error) {
            console.error("Failed to load GR20 GPX:", error);
            alert("Impossible de charger les fichiers GPX du GR20.");
        }
    };

    useEffect(() => {
        loadGR20GPX();
    }, []);

    // Auto-scroll sidebar to active stage
    useEffect(() => {
        if (activeStage !== null && stageRefs.current[activeStage] && sidebarRef.current) {
            const stageElement = stageRefs.current[activeStage];
            const sidebar = sidebarRef.current;
            
            if (stageElement) {
                const sidebarRect = sidebar.getBoundingClientRect();
                const stageRect = stageElement.getBoundingClientRect();
                
                // Calculate the offset to center the stage element
                const offset = stageRect.top - sidebarRect.top - (sidebarRect.height / 2) + (stageRect.height / 2);
                
                sidebar.scrollTo({
                    top: sidebar.scrollTop + offset,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeStage]);

    // --- LOGIC: Fetch Real Elevation from API --- (for custom point picking)
    const fetchRealElevationAtPoint = async (lat: number, lng: number) => {
        setIsFetchingElevation(true);
        try {
            const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                const absoluteElevation = Math.round(data.results[0].elevation);
                setStageAbsElev(absoluteElevation.toString());
                
                // When picking a point, calculate elev gain from the last stage on the sidebar
                const lastStage = [...stages].reverse().find(s => s.coords && (editingStageId ? s.id !== editingStageId : true));
                if (lastStage && lastStage.absElev) {
                    const gain = Math.max(0, absoluteElevation - parseInt(lastStage.absElev)); 
                    setStageElev(gain.toString());
                } else {
                    setStageElev("0");
                }
            }
        } catch (error) {
            console.error("Elevation API failed", error);
        } finally {
            setIsFetchingElevation(false);
        }
    };

    // --- GPX Import (manual via button) ---
    const handleManualGPXImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const xml = event.target?.result as string;
            const { trackPoints, refugeStages } = parseGPXData(xml);
            setFullTrackPoints(trackPoints);
            setStages(refugeStages);

            if (refugeStages.length > 0) {
                setActiveStage(refugeStages[0].id);
            }
        };
        reader.readAsText(file);
    };

    const handlePointPicked = (lat: number, lng: number) => {
        setStageCoords([lat, lng]);
        
        // Calculate dist/elev from closest point on fullTrackPoints, not just stages
        let lastPointForCalculation: { lat: number; lon: number; ele: number; } | undefined;
        if (editingStageId) {
             const editedStage = stages.find(s => s.id === editingStageId);
             if (editedStage?.coords) {
                lastPointForCalculation = { lat: editedStage.coords[0], lon: editedStage.coords[1], ele: parseFloat(editedStage.absElev || "0") };
             }
        }
        if (!lastPointForCalculation && fullTrackPoints.length > 0) {
            lastPointForCalculation = fullTrackPoints[fullTrackPoints.length - 1];
        }

        if (lastPointForCalculation) {
            const d = calculateDistance(lastPointForCalculation.lat, lastPointForCalculation.lon, lat, lng);
            setStageDist(d.toFixed(1));
            fetchRealElevationAtPoint(lat, lng); // This will update absElev and calc elev gain
        } else {
            setStageDist("0");
            fetchRealElevationAtPoint(lat, lng); // Still fetch elevation even if no prev point
        }

        setIsPickingMode(false);
        setIsModalOpen(true);
    };

    const downloadGPX = () => {
        const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="YETI PWA" xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>Mon Itinéraire GR20</name>\n    <trkseg>\n      ${fullTrackPoints.map(p => `\n      <trkpt lat="${p.lat}" lon="${p.lon}">\n        <ele>${p.ele.toFixed(0)}</ele>\n      </trkpt>`).join("")}\n    </trkseg>\n  </trk>\n</gpx>`;
        const blob = new Blob([gpx], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = 'itineraire_gr20_yeti.gpx';
        a.click();
    };

    const openEditModal = (id: number) => {
        const s = stages.find(x => x.id === id);
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
            status: 'active' as const
        };

        if (editingStageId !== null) {
            setStages(prev => prev.map(s => s.id === editingStageId ? { ...s, ...stageData, day: s.day } : s));
        } else {
            const nextId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) + 1 : 1;
            // For manually added stages, also add to fullTrackPoints if coords exist
            if (stageCoords) {
                 setFullTrackPoints(prev => [...prev, { lat: stageCoords[0], lon: stageCoords[1], ele: parseFloat(stageAbsElev || "0"), name: stageName }]);
            }
            setStages(prev => [...prev, { id: nextId, ...stageData, day: stages.length + 1 }]); // Assign a day to new manual stages
        }
        
        setIsModalOpen(false);
    };

    const totalElev = useMemo(() => fullTrackPoints.reduce((acc, curr) => acc + curr.ele, 0), [fullTrackPoints]);
    const totalDist = useMemo(() => {
        let dist = 0;
        if (fullTrackPoints.length > 1) {
            for (let i = 1; i < fullTrackPoints.length; i++) {
                dist += calculateDistance(fullTrackPoints[i-1].lat, fullTrackPoints[i-1].lon, fullTrackPoints[i].lat, fullTrackPoints[i].lon);
            }
        }
        return dist.toFixed(1);
    }, [fullTrackPoints]);

    // Data for elevation chart - Sampled for performance
    const chartPoints = useMemo(() => {
        if (fullTrackPoints.length === 0) return [];
        
        // Sample points for better performance and visibility
        const maxPoints = 500;
        if (fullTrackPoints.length <= maxPoints) {
            return fullTrackPoints.map(p => p.ele);
        }
        
        const step = Math.floor(fullTrackPoints.length / maxPoints);
        const sampled: number[] = [];
        for (let i = 0; i < fullTrackPoints.length; i += step) {
            sampled.push(fullTrackPoints[i].ele);
        }
        return sampled;
    }, [fullTrackPoints]);

    const sampledTrackPoints = useMemo(() => {
        if (fullTrackPoints.length === 0) return [];
        
        const maxPoints = 500;
        if (fullTrackPoints.length <= maxPoints) {
            return fullTrackPoints;
        }
        
        const step = Math.floor(fullTrackPoints.length / maxPoints);
        const sampled: TrackPoint[] = [];
        for (let i = 0; i < fullTrackPoints.length; i += step) {
            sampled.push(fullTrackPoints[i]);
        }
        return sampled;
    }, [fullTrackPoints]);

    const stagePositionsOnChart = useMemo(() => {
        if (!stages.length || !sampledTrackPoints.length) return [];

        return stages
            .map(stage => {
                if (!stage.coords) return { index: -1, stage };

                let closestSampledIndex = -1;
                let minDistance = Infinity;

                sampledTrackPoints.forEach((point, index) => {
                    const dist = calculateDistance(stage.coords![0], stage.coords![1], point.lat, point.lon);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestSampledIndex = index;
                    }
                });

                return { index: closestSampledIndex, stage };
            })
            .filter(p => p.index !== -1);
    }, [stages, sampledTrackPoints]);

    const handleStageClickOnProfile = (stage: Stage) => {
        // Ne zoome pas, juste active l'étape
        setActiveStage(stage.id);
    };

    const handleSaveProjectToTimeline = () => {
        // TODO: Fix type mismatch between Stage and Task types
        alert('Fonctionnalité de sauvegarde temporairement désactivée');
        // const timeline: Phase[] = [{
        //     id: 'plan',
        //     label: 'Planification',
        //     status: 'active',
        //     sub: 'En cours',
        //     range: [60, 45],
        //     tasks: stages.map((stage, index) => ({
        //         id: stage.id,
        //         title: `Étape ${stage.day}: ${stage.name}`,
        //         status: 'pending',
        //         dueDate: `J-${60 - index * 2}`
        //     }))
        // }];
        // createProject('gr20', 'GR20 Full Traverse', undefined, timeline);
    };

    return (
        <div className="h-screen flex flex-col bg-bg-base transition-colors overflow-hidden">
            <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-text-primary tracking-tight">Itinéraire</h1>
                </div>
                {isPickingMode && (
                    <div className="absolute left-1/2 -translate-x-1/2 px-6 py-2 bg-orange-vibrant text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-50 ring-4 ring-orange-vibrant/20">
                        Cliquez sur la carte pour définir l'étape
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleManualGPXImport} 
                        accept=".gpx" 
                        className="hidden" 
                    />
                    <button 
                        onClick={loadGR20GPX}
                        className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-orange-vibrant hover:bg-orange-vibrant/10 transition-colors"
                        title="Recharger l&apos;itinéraire GR20 par défaut"
                    >
                        <Icons.Download className="w-4 h-4 rotate-180" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-cyan-vibrant hover:bg-cyan-vibrant/10 transition-colors"
                    >
                        <Icons.Upload className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Importer GPX</span>
                    </button>
                    <button 
                        onClick={downloadGPX}
                        className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-vibrant hover:bg-emerald-vibrant/10 transition-colors"
                    >
                        <Icons.Download className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Exporter</span>
                    </button>
                    <button 
                        onClick={handleSaveProjectToTimeline}
                        className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-purple-vibrant hover:bg-purple-vibrant/10 transition-colors"
                    >
                        <Icons.Save className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sauvegarder</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside ref={sidebarRef} className="w-80 border-r border-border-subtle bg-bg-surface-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em]">Flux d'étapes</div>
                        <div className="text-[10px] font-bold text-text-muted bg-bg-surface-3 px-2 py-0.5 rounded">{totalDist} km</div>
                    </div>
                    
                    <div className="space-y-4">
                        {stages.map((stage, index) => {
                            const isNewDay = index === 0 || (stage.day !== stages[index - 1]?.day);
                            
                            return (
                                <div key={stage.id}>
                                    {isNewDay && stage.day && (
                                        <div className="flex items-center gap-3 mb-3 mt-2">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-vibrant/30 to-transparent" />
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-vibrant/10 rounded-lg border border-orange-vibrant/30">
                                                <Icons.Calendar className="w-3.5 h-3.5 text-orange-vibrant" />
                                                <span className="text-xs font-black text-orange-vibrant uppercase tracking-widest">
                                                    JOUR {stage.day}
                                                </span>
                                            </div>
                                            <div className="flex-1 h-px bg-gradient-to-r from-orange-vibrant/30 via-transparent to-transparent" />
                                        </div>
                                    )}
                                    
                                    <div
                                        ref={(el) => { stageRefs.current[stage.id] = el; }}
                                        onClick={() => setActiveStage(stage.id)}
                                        onDoubleClick={() => openEditModal(stage.id)}
                                        className={cn(
                                            "p-4 rounded-xl cursor-pointer transition-all border group relative",
                                            activeStage === stage.id
                                                ? "bg-bg-surface-2 border-orange-vibrant/50 shadow-lg shadow-orange-vibrant/5 scale-[1.02]"
                                                : "bg-transparent border-border-subtle hover:bg-bg-surface-3 hover:border-orange-vibrant/20"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-col gap-0.5 flex-1">
                                                <h4 className="text-base font-black tracking-tight text-text-primary line-clamp-1">{stage.name}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-text-muted">Km {stage.dist}</span>
                                                <button onClick={(e) => { e.stopPropagation(); openEditModal(stage.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-orange-vibrant hover:bg-orange-vibrant/10 rounded-lg transition-all">
                                                    <Icons.PlusCircle className="w-3.5 h-3.5 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Distance</span>
                                                <span className="text-sm font-black text-text-primary font-mono">
                                                    {index > 0 
                                                        ? (parseFloat(stage.dist) - parseFloat(stages[index - 1].dist)).toFixed(1)
                                                        : "0"
                                                    } km
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider">D+</span>
                                                <span className="text-sm font-black text-cyan-vibrant font-mono">+{stage.elev}m</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Altitude</span>
                                                <span className="text-sm font-black text-text-primary font-mono">{stage.absElev}m</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={openAddModal} className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-border-default text-text-faint hover:text-orange-vibrant hover:border-orange-vibrant/30 transition-all flex flex-col items-center justify-center gap-1 group bg-orange-vibrant/5">
                         <Icons.Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle Étape</span>
                    </button>
                </aside>

                <main className="flex-1 relative flex flex-col overflow-hidden">
                    <div className="h-[calc(100%-280px)] p-4">
                         <div className="w-full h-full premium-card rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-border-subtle">
                              {/* Onglets de vue - positionnés en haut à gauche pour ne pas empiéter sur la légende ni les contrôles 3D */}
                              <div className="absolute top-4 left-4 z-[1001] flex gap-2">
                                  <button
                                      onClick={() => setMapView('2d')}
                                      className={cn(
                                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg backdrop-blur-md border",
                                          mapView === '2d'
                                              ? "bg-cyan-vibrant text-white border-cyan-vibrant"
                                              : "bg-bg-surface-1/90 text-text-muted border-border-subtle hover:text-text-primary"
                                      )}
                                  >
                                      2D
                                  </button>
                                  <button
                                      onClick={() => setMapView('3d')}
                                      className={cn(
                                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg backdrop-blur-md border",
                                          mapView === '3d'
                                              ? "bg-cyan-vibrant text-white border-cyan-vibrant"
                                              : "bg-bg-surface-1/90 text-text-muted border-border-subtle hover:text-text-primary"
                                      )}
                                  >
                                      3D
                                  </button>
                              </div>

                              {mapView === '2d' ? (
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
                    </div>

                    <div className="h-[280px] px-4 pb-4 shrink-0">
                         <div className="w-full h-full premium-card rounded-2xl p-6 relative group overflow-hidden">
                               <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                        <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Profil d&apos;Élévation</div>
                                        <div className="text-sm font-black text-orange-vibrant font-mono bg-orange-vibrant/5 px-3 py-1 rounded-lg ring-1 ring-orange-vibrant/20">
                                             {chartPoints.length} points GPS
                                        </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                        <div className="text-xs font-bold text-text-muted">
                                            Min: <span className="text-cyan-vibrant">{Math.min(...chartPoints).toFixed(0)}m</span>
                                        </div>
                                        <div className="text-xs font-bold text-text-muted">
                                            Max: <span className="text-orange-vibrant">{Math.max(...chartPoints).toFixed(0)}m</span>
                                        </div>
                                   </div>
                              </div>
                              
                              {chartPoints.length > 0 ? (
                                  <div 
                                       className="relative w-full flex items-end gap-[1px]"
                                       style={{ height: 'calc(100% - 60px)' }}
                                       onMouseMove={(e) => {
                                            if (sampledTrackPoints.length === 0) return;
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const barWidth = rect.width / sampledTrackPoints.length;
                                            const index = Math.floor(x / barWidth);
                                            
                                            if (index >= 0 && index < sampledTrackPoints.length) {
                                                setHoveredTrackPoint(sampledTrackPoints[index]);
                                            } else {
                                                setHoveredTrackPoint(null);
                                            }
                                       }}
                                       onMouseLeave={() => setHoveredTrackPoint(null)}
                                  >
                                       {chartPoints.map((elevation, i) => {
                                            const minElev = Math.min(...chartPoints);
                                            const maxElev = Math.max(...chartPoints);
                                            const range = maxElev - minElev || 1;
                                            const h = ((elevation - minElev) / range) * 100;
                                            const isHovered = hoveredTrackPoint && sampledTrackPoints[i] && hoveredTrackPoint.lat === sampledTrackPoints[i].lat && hoveredTrackPoint.lon === sampledTrackPoints[i].lon;
                                            
                                            return (
                                                 <div 
                                                   key={i} 
                                                   className={cn(
                                                       "flex-1 rounded-t-[1px] transition-all duration-75", 
                                                       "bg-gradient-to-t from-orange-vibrant via-orange-500 to-yellow-400",
                                                       isHovered ? "opacity-100 scale-x-[2] scale-y-[1.05] z-10 shadow-[0_0_20px_rgba(249,115,22,0.8)]" : "opacity-70"
                                                   )} 
                                                   style={{ height: `${Math.max(3, h)}%` }} 
                                                 />
                                            );
                                       })}

                                       {/* Stage markers on profile */}
                                       {stagePositionsOnChart.map(({ index, stage }, i) => {
                                            if (index === -1) return null;
                                            const isActive = activeStage === stage.id;
                                            // Alterner la position des labels pour éviter les chevauchements
                                            const isAlternate = i % 2 === 1;
                                            
                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="absolute bottom-0 h-full flex flex-col items-center cursor-pointer group/marker z-10"
                                                    style={{ left: `${(index / sampledTrackPoints.length) * 100}%`, transform: 'translateX(-50%)' }}
                                                    onClick={() => handleStageClickOnProfile(stage)}
                                                >
                                                    {/* Ligne verticale */}
                                                    <div className={cn(
                                                        "w-0.5 h-full transition-all",
                                                        isActive ? "bg-orange-vibrant/60" : "bg-white/30 group-hover/marker:bg-orange-vibrant/50"
                                                    )}></div>
                                                    
                                                    {/* Point du jour */}
                                                    <div className={cn(
                                                        "absolute w-5 h-5 rounded-full flex items-center justify-center transition-all border-2 shadow-lg",
                                                        isActive 
                                                            ? "bg-orange-vibrant border-zinc-900 scale-110" 
                                                            : "bg-zinc-800 border-zinc-600 group-hover/marker:border-orange-vibrant group-hover/marker:scale-110",
                                                        isAlternate ? "top-[-10px]" : "bottom-[-10px]"
                                                    )}>
                                                        <span className="text-[8px] font-black text-white">{stage.day}</span>
                                                    </div>
                                                    
                                                    {/* Label visible seulement au hover ou si actif */}
                                                    <div className={cn(
                                                        "absolute text-center pointer-events-none",
                                                        isAlternate ? "bottom-[-45px]" : "top-[-45px]"
                                                    )}>
                                                        <div className={cn(
                                                            "bg-zinc-900/95 backdrop-blur-md border text-white text-[8px] font-black px-2 py-0.5 rounded-md whitespace-nowrap shadow-xl transition-all",
                                                            isActive 
                                                                ? "border-orange-vibrant/50 opacity-100 scale-100" 
                                                                : "border-zinc-700/50 opacity-0 scale-90 group-hover/marker:opacity-100 group-hover/marker:scale-100"
                                                        )}>
                                                            {stage.name}
                                                        </div>
                                                        {/* Petite ligne de connexion */}
                                                        <div className={cn(
                                                            "w-0.5 bg-zinc-700 mx-auto transition-opacity",
                                                            isActive ? "opacity-50" : "opacity-0 group-hover/marker:opacity-50",
                                                            isAlternate ? "h-3 mt-1" : "h-3 mb-1"
                                                        )}></div>
                                                    </div>
                                                </div>
                                            )
                                       })}
                                       
                                       {/* Hover indicator from map or profile */}
                                       {hoveredTrackPoint && (
                                            <>
                                                {/* Ligne verticale du hover */}
                                                <div 
                                                    className="absolute bottom-0 pointer-events-none z-20 transition-all"
                                                    style={{ 
                                                        left: `${(sampledTrackPoints.indexOf(hoveredTrackPoint) / sampledTrackPoints.length) * 100}%`,
                                                        height: '100%',
                                                        width: '2px',
                                                        background: 'linear-gradient(to top, rgba(249, 115, 22, 0.8), rgba(249, 115, 22, 0.2))',
                                                        boxShadow: '0 0 12px rgba(249, 115, 22, 0.6)'
                                                    }}
                                                />
                                                {/* Point de hover */}
                                                <div 
                                                    className="absolute pointer-events-none z-20"
                                                    style={{ 
                                                        left: `${(sampledTrackPoints.indexOf(hoveredTrackPoint) / sampledTrackPoints.length) * 100}%`,
                                                        bottom: `${((hoveredTrackPoint.ele - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints))) * 100}%`,
                                                        transform: 'translate(-50%, 50%)'
                                                    }}
                                                >
                                                    <div className="w-3 h-3 rounded-full bg-orange-vibrant border-2 border-white shadow-lg animate-pulse"></div>
                                                </div>
                                            </>
                                       )}
                                  </div>
                              ) : (
                                  <div className="relative w-full flex items-center justify-center" style={{ height: 'calc(100% - 60px)' }}>
                                      <div className="text-text-faint text-sm">Chargement du profil...</div>
                                  </div>
                              )}
                              
                              {/* Tooltip elevation info */}
                              {hoveredTrackPoint && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-orange-vibrant/40 text-white pointer-events-none shadow-2xl z-50 flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Altitude</div>
                                        <div className="text-xl font-black text-orange-vibrant font-mono">
                                            {hoveredTrackPoint.ele.toFixed(0)} m
                                        </div>
                                    </div>
                                    {hoveredTrackPoint.name && (
                                        <>
                                            <div className="w-px h-8 bg-zinc-700"></div>
                                            <div className="flex flex-col">
                                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Point</div>
                                                <div className="text-sm font-bold text-white">
                                                    {hoveredTrackPoint.name}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                              )}
                         </div>
                    </div>
                </main>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStageId ? "CONFIGURATION ÉTAPE" : "NOUVELLE ÉTAPE"}>
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface-2 border border-border-subtle group cursor-pointer hover:border-orange-vibrant/30 transition-all" onClick={() => { setIsModalOpen(false); setIsPickingMode(true); }}>
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-orange-vibrant/10 flex items-center justify-center">
                                 <Icons.MapPin className="w-4 h-4 text-orange-vibrant" />
                             </div>
                             <div>
                                 <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Localisation GPS</div>
                                 <div className="text-xs font-bold text-text-primary">
                                     {stageCoords ? `${stageCoords[0].toFixed(4)}, ${stageCoords[1].toFixed(4)}` : "Cliquer pour pointer sur carte"}
                                 </div>
                             </div>
                         </div>
                         <Icons.ChevronRight className="w-4 h-4 text-text-faint group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nom / Destination</label>
                        <input type="text" placeholder="Refuge..." value={stageName} onChange={(e) => setStageName(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3 relative">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Altitude (m)</label>
                            <input type="number" placeholder="Alt." value={stageAbsElev} onChange={(e) => setStageAbsElev(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                            {isFetchingElevation && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin border-2 border-orange-vibrant border-t-transparent rounded-full w-4 h-4" />}                            
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gain D+ (m)</label>
                            <input type="number" placeholder="Gain" value={stageElev} onChange={(e) => setStageElev(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dist. (km)</label>
                            <input type="number" placeholder="Dist" value={stageDist} onChange={(e) => setStageDist(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary">Annuler</button>
                        <button type="button" onClick={handleSaveStage} className="px-8 py-3 rounded-xl bg-orange-vibrant text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-vibrant/20 transition-all hover:scale-105 active:scale-95">
                            {editingStageId ? "Mettre à jour" : "Ajouter"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
