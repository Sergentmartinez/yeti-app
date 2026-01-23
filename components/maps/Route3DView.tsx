"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, PerspectiveCamera, Text, Billboard } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

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

// Fonction pour convertir lat/lon en coordonnées cartésiennes
function latLonToXY(lat: number, lon: number, minLat: number, maxLat: number, minLon: number, maxLon: number, scale = 200) {
    const x = ((lon - minLon) / (maxLon - minLon)) * scale - scale / 2;
    const y = ((lat - minLat) / (maxLat - minLat)) * scale - scale / 2;
    return { x, y };
}

function RoutePathMesh({ trackPoints }: { trackPoints: TrackPoint[] }) {
    const { points, minElev, maxElev } = useMemo(() => {
        if (trackPoints.length === 0) return { points: [], minElev: 0, maxElev: 0 };

        const minLat = Math.min(...trackPoints.map(p => p.lat));
        const maxLat = Math.max(...trackPoints.map(p => p.lat));
        const minLon = Math.min(...trackPoints.map(p => p.lon));
        const maxLon = Math.max(...trackPoints.map(p => p.lon));
        const minElev = Math.min(...trackPoints.map(p => p.ele));
        const maxElev = Math.max(...trackPoints.map(p => p.ele));

        // Échelle de hauteur pour l'exagération verticale (réduite pour plus de réalisme)
        const elevationScale = 0.02;

        const pts = trackPoints.map(point => {
            const { x, y } = latLonToXY(point.lat, point.lon, minLat, maxLat, minLon, maxLon);
            const z = (point.ele - minElev) * elevationScale;
            return [x, z, y] as [number, number, number];
        });

        return { points: pts, minElev, maxElev };
    }, [trackPoints]);

    if (points.length === 0) return null;

    return (
        <Line
            points={points}
            color="#f97316"
            lineWidth={4}
        />
    );
}

function RefugeMarkers({ trackPoints, refuges, activeStageId }: { trackPoints: TrackPoint[], refuges?: Refuge[], activeStageId?: number | null }) {
    const markers = useMemo(() => {
        if (!refuges || trackPoints.length === 0) return [];

        const minLat = Math.min(...trackPoints.map(p => p.lat));
        const maxLat = Math.max(...trackPoints.map(p => p.lat));
        const minLon = Math.min(...trackPoints.map(p => p.lon));
        const maxLon = Math.max(...trackPoints.map(p => p.lon));
        const minElev = Math.min(...trackPoints.map(p => p.ele));
        const elevationScale = 0.02;

        return refuges
            .filter(r => r.coords)
            .map(refuge => {
                // Trouver le point le plus proche
                let closestPoint = trackPoints[0];
                let minDist = Infinity;

                trackPoints.forEach(point => {
                    const dist = Math.sqrt(
                        Math.pow(point.lat - refuge.coords![0], 2) +
                        Math.pow(point.lon - refuge.coords![1], 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        closestPoint = point;
                    }
                });

                const { x, y } = latLonToXY(closestPoint.lat, closestPoint.lon, minLat, maxLat, minLon, maxLon);
                const z = (closestPoint.ele - minElev) * elevationScale + 2;

                return {
                    id: refuge.id,
                    name: refuge.name,
                    day: refuge.day,
                    position: [x, z, y] as [number, number, number],
                    isActive: activeStageId === refuge.id
                };
            });
    }, [trackPoints, refuges, activeStageId]);

    return (
        <>
            {markers.map(marker => (
                <group key={marker.id} position={marker.position}>
                    <mesh>
                        <sphereGeometry args={[marker.isActive ? 1 : 0.6, 16, 16]} />
                        <meshStandardMaterial 
                            color={marker.isActive ? "#f97316" : "#06b6d4"} 
                            emissive={marker.isActive ? "#f97316" : "#06b6d4"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                    {/* Ligne verticale jusqu'au sol */}
                    <Line
                        points={[[0, 0, 0], [0, -marker.position[1], 0]]}
                        color={marker.isActive ? "#f97316" : "#06b6d4"}
                        lineWidth={1}
                        opacity={0.3}
                        transparent
                    />
                    {/* Nom de l'étape - toujours face à la caméra */}
                    <Billboard position={[0, 3, 0]}>
                        <Text
                            fontSize={1.5}
                            color="white"
                            anchorX="center"
                            anchorY="bottom"
                            outlineWidth={0.15}
                            outlineColor="#000000"
                        >
                            {marker.name}
                        </Text>
                    </Billboard>
                    {/* Numéro du jour - toujours face à la caméra */}
                    <Billboard position={[0, 1.5, 0]}>
                        <Text
                            fontSize={1.2}
                            color={marker.isActive ? "#f97316" : "#06b6d4"}
                            anchorX="center"
                            anchorY="middle"
                            fontWeight="bold"
                            outlineWidth={0.1}
                            outlineColor="#000000"
                        >
                            J{marker.day}
                        </Text>
                    </Billboard>
                </group>
            ))}
        </>
    );
}

function HoveredPointMarker({ trackPoints, hoveredPoint }: { trackPoints: TrackPoint[], hoveredPoint: TrackPoint | null }) {
    const position = useMemo(() => {
        if (!hoveredPoint || trackPoints.length === 0) return null;

        const minLat = Math.min(...trackPoints.map(p => p.lat));
        const maxLat = Math.max(...trackPoints.map(p => p.lat));
        const minLon = Math.min(...trackPoints.map(p => p.lon));
        const maxLon = Math.max(...trackPoints.map(p => p.lon));
        const minElev = Math.min(...trackPoints.map(p => p.ele));
        const elevationScale = 0.02;

        const { x, y } = latLonToXY(hoveredPoint.lat, hoveredPoint.lon, minLat, maxLat, minLon, maxLon);
        const z = (hoveredPoint.ele - minElev) * elevationScale + 1;

        return [x, z, y] as [number, number, number];
    }, [trackPoints, hoveredPoint]);

    if (!position) return null;

    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial 
                    color="#f97316" 
                    emissive="#f97316"
                    emissiveIntensity={1}
                />
            </mesh>
            <pointLight color="#f97316" intensity={2} distance={10} />
        </group>
    );
}

function Scene({ trackPoints, refuges, activeStageId, hoveredPoint }: Route3DViewProps) {
    return (
        <>
            <PerspectiveCamera makeDefault position={[150, 80, 150]} />
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2}
                minDistance={30}
                maxDistance={400}
            />
            
            <ambientLight intensity={0.6} />
            <directionalLight position={[50, 50, 25]} intensity={0.8} castShadow />
            <directionalLight position={[-50, 30, -25]} intensity={0.3} />
            
            <RoutePathMesh trackPoints={trackPoints} />
            <RefugeMarkers trackPoints={trackPoints} refuges={refuges} activeStageId={activeStageId} />
            <HoveredPointMarker trackPoints={trackPoints} hoveredPoint={hoveredPoint || null} />
            
            {/* Grille au sol */}
            <gridHelper args={[300, 40, "#444", "#222"]} position={[0, -2, 0]} />
            
            {/* Axes de référence */}
            <axesHelper args={[30]} />
        </>
    );
}

export default function Route3DView({ trackPoints, refuges, activeStageId, hoveredPoint }: Route3DViewProps) {
    const [error, setError] = useState<string | null>(null);

    if (trackPoints.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                <p className="text-zinc-500">Aucun tracé disponible</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-zinc-950 relative">
            <Canvas shadows>
                <Scene trackPoints={trackPoints} refuges={refuges} activeStageId={activeStageId} hoveredPoint={hoveredPoint} />
            </Canvas>
            
            {/* Contrôles info */}
            <div className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                <p className="font-bold mb-1 text-zinc-300">Contrôles 3D</p>
                <p>• Clic gauche + glisser : Rotation</p>
                <p>• Molette : Zoom</p>
                <p>• Clic droit + glisser : Déplacer</p>
            </div>
            
            {/* Légende - positionnée à droite */}
            <div className="absolute top-4 right-4 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800">
                <p className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-2">Légende</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-vibrant"></div>
                    <span>Refuges</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="w-3 h-3 rounded-full bg-orange-vibrant"></div>
                    <span>Refuge actif</span>
                </div>
            </div>
        </div>
    );
}
