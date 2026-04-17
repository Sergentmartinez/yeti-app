"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, PerspectiveCamera, Html } from "@react-three/drei";
import { useMemo, Suspense, Component, ReactNode } from "react";
import * as THREE from "three";

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  name?: string;
}

interface Refuge {
  id: number;
  name: string;
  coords?: [number, number];
  day?: number;
}

interface Route3DViewProps {
  trackPoints: TrackPoint[];
  refuges?: Refuge[];
  activeStageId?: number | null;
  hoveredPoint?: TrackPoint | null;
}

// ============================================================================
// ERROR BOUNDARY (évite l'écran blanc si Three.js crash)
// ============================================================================
class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message };
  }
  componentDidCatch(err: Error) {
    console.error("[Route3DView] Scene error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <p className="text-red-500 font-bold mb-2">Erreur 3D</p>
            <p className="text-xs text-zinc-500 max-w-sm">{this.state.error}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// HELPERS
// ============================================================================
function latLonToXY(
  lat: number,
  lon: number,
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  scale = 200
) {
  const x = ((lon - minLon) / (maxLon - minLon)) * scale - scale / 2;
  const y = ((lat - minLat) / (maxLat - minLat)) * scale - scale / 2;
  return { x, y };
}

// ============================================================================
// TERRAIN (fond sombre subtil)
// ============================================================================
function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
      <planeGeometry args={[400, 400, 1, 1]} />
      <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0} />
    </mesh>
  );
}

// ============================================================================
// PATH
// ============================================================================
function RoutePathMesh({ trackPoints }: { trackPoints: TrackPoint[] }) {
  const points = useMemo(() => {
    if (trackPoints.length === 0) return [];

    const minLat = Math.min(...trackPoints.map((p) => p.lat));
    const maxLat = Math.max(...trackPoints.map((p) => p.lat));
    const minLon = Math.min(...trackPoints.map((p) => p.lon));
    const maxLon = Math.max(...trackPoints.map((p) => p.lon));
    const minElev = Math.min(...trackPoints.map((p) => p.ele));
    const elevationScale = 0.02;

    return trackPoints.map((p) => {
      const { x, y } = latLonToXY(p.lat, p.lon, minLat, maxLat, minLon, maxLon);
      const z = (p.ele - minElev) * elevationScale;
      return [x, z, y] as [number, number, number];
    });
  }, [trackPoints]);

  if (points.length < 2) return null;

  return <Line points={points} color="#f21e2c" lineWidth={3} />;
}

// ============================================================================
// REFUGE MARKERS (HTML labels au lieu de <Text> — évite le CDN font crash)
// ============================================================================
function RefugeMarkers({
  trackPoints,
  refuges,
  activeStageId,
}: {
  trackPoints: TrackPoint[];
  refuges?: Refuge[];
  activeStageId?: number | null;
}) {
  const markers = useMemo(() => {
    if (!refuges || trackPoints.length === 0) return [];

    const minLat = Math.min(...trackPoints.map((p) => p.lat));
    const maxLat = Math.max(...trackPoints.map((p) => p.lat));
    const minLon = Math.min(...trackPoints.map((p) => p.lon));
    const maxLon = Math.max(...trackPoints.map((p) => p.lon));
    const minElev = Math.min(...trackPoints.map((p) => p.ele));
    const elevationScale = 0.02;

    return refuges
      .filter((r) => r.coords)
      .map((refuge) => {
        let closest = trackPoints[0];
        let minD = Infinity;
        trackPoints.forEach((p) => {
          const d =
            Math.pow(p.lat - refuge.coords![0], 2) +
            Math.pow(p.lon - refuge.coords![1], 2);
          if (d < minD) {
            minD = d;
            closest = p;
          }
        });

        const { x, y } = latLonToXY(closest.lat, closest.lon, minLat, maxLat, minLon, maxLon);
        const z = (closest.ele - minElev) * elevationScale + 1;

        return {
          id: refuge.id,
          name: refuge.name,
          day: refuge.day,
          position: [x, z, y] as [number, number, number],
          isActive: activeStageId === refuge.id,
        };
      });
  }, [trackPoints, refuges, activeStageId]);

  return (
    <>
      {markers.map((m) => (
        <group key={m.id} position={m.position}>
          <mesh>
            <sphereGeometry args={[m.isActive ? 1.2 : 0.7, 16, 16]} />
            <meshStandardMaterial
              color={m.isActive ? "#f21e2c" : "#06b6d4"}
              emissive={m.isActive ? "#f21e2c" : "#06b6d4"}
              emissiveIntensity={m.isActive ? 0.7 : 0.4}
            />
          </mesh>
          {/* Tige verticale jusqu'au sol */}
          <Line
            points={[
              [0, 0, 0],
              [0, -m.position[1] - 3, 0],
            ]}
            color={m.isActive ? "#f21e2c" : "#06b6d4"}
            lineWidth={1}
            opacity={0.4}
            transparent
          />
          {/* Label HTML (pas de chargement font externe) */}
          {m.isActive && (
            <Html
              position={[0, 3, 0]}
              center
              distanceFactor={60}
              style={{
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  background: "rgba(242,30,44,0.95)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                J{m.day} · {m.name}
              </div>
            </Html>
          )}
        </group>
      ))}
    </>
  );
}

// ============================================================================
// HOVERED POINT
// ============================================================================
function HoveredPointMarker({
  trackPoints,
  hoveredPoint,
}: {
  trackPoints: TrackPoint[];
  hoveredPoint: TrackPoint | null;
}) {
  const position = useMemo(() => {
    if (!hoveredPoint || trackPoints.length === 0) return null;

    const minLat = Math.min(...trackPoints.map((p) => p.lat));
    const maxLat = Math.max(...trackPoints.map((p) => p.lat));
    const minLon = Math.min(...trackPoints.map((p) => p.lon));
    const maxLon = Math.max(...trackPoints.map((p) => p.lon));
    const minElev = Math.min(...trackPoints.map((p) => p.ele));
    const elevationScale = 0.02;

    const { x, y } = latLonToXY(
      hoveredPoint.lat,
      hoveredPoint.lon,
      minLat,
      maxLat,
      minLon,
      maxLon
    );
    const z = (hoveredPoint.ele - minElev) * elevationScale + 0.5;
    return [x, z, y] as [number, number, number];
  }, [trackPoints, hoveredPoint]);

  if (!position) return null;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#FEC631"
          emissive="#FEC631"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight color="#FEC631" intensity={2} distance={15} />
    </group>
  );
}

// ============================================================================
// SCENE
// ============================================================================
function Scene({
  trackPoints,
  refuges,
  activeStageId,
  hoveredPoint,
}: Route3DViewProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[150, 90, 150]} fov={50} />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={30}
        maxDistance={450}
      />

      {/* Lumières */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[60, 80, 30]} intensity={1} castShadow />
      <directionalLight position={[-60, 40, -30]} intensity={0.3} />
      <hemisphereLight args={["#4a5568", "#1a202c", 0.4]} />

      {/* Terrain de fond */}
      <Terrain />

      {/* Trace + markers */}
      <RoutePathMesh trackPoints={trackPoints} />
      <RefugeMarkers
        trackPoints={trackPoints}
        refuges={refuges}
        activeStageId={activeStageId}
      />
      <HoveredPointMarker
        trackPoints={trackPoints}
        hoveredPoint={hoveredPoint || null}
      />

      {/* Grille au sol */}
      <gridHelper args={[400, 50, "#2a2a2a", "#1a1a1a"]} position={[0, -2.9, 0]} />

      {/* Fog pour profondeur */}
      <fog attach="fog" args={["#0a0a0a", 200, 600]} />
    </>
  );
}

// ============================================================================
// EXPORT
// ============================================================================
export default function Route3DView({
  trackPoints,
  refuges,
  activeStageId,
  hoveredPoint,
}: Route3DViewProps) {
  if (trackPoints.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-zinc-500 text-sm">Aucun tracé disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative">
      <SceneErrorBoundary>
        <Canvas
          shadows
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
          }}
          dpr={[1, 2]}
          style={{ background: "#0a0a0a" }}
        >
          <Suspense fallback={null}>
            <Scene
              trackPoints={trackPoints}
              refuges={refuges}
              activeStageId={activeStageId}
              hoveredPoint={hoveredPoint}
            />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>

      {/* Contrôles info */}
      <div className="absolute bottom-4 left-4 bg-[#0d0d0d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[11px] text-zinc-400 pointer-events-none">
        <div className="font-black text-white uppercase tracking-wider text-[10px] mb-1.5">
          Contrôles
        </div>
        <div>↻ Clic + glisser : Rotation</div>
        <div>🔍 Molette : Zoom</div>
        <div>⇆ Clic droit : Déplacer</div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-[#0d0d0d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 pointer-events-none">
        <div className="text-[10px] font-black text-white uppercase tracking-wider mb-1.5">
          Légende
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#06b6d4", boxShadow: "0 0 8px #06b6d4" }}
          />
          <span>Refuges</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#f21e2c", boxShadow: "0 0 8px #f21e2c" }}
          />
          <span>Actif</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <div
            className="w-4 h-0.5 rounded-full"
            style={{ background: "#f21e2c" }}
          />
          <span>Trace GPX</span>
        </div>
      </div>
    </div>
  );
}
