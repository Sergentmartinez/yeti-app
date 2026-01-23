"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Icons } from '@/components/icons';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MAP_STYLES = {
    tactical: {
        name: "Carte",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attr: '&copy; OpenStreetMap contributors'
    },
    satellite: {
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr: 'Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
    },
    topo: {
        name: "Relief",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attr: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
    }
};

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(map) map.zoomIn(); }}
        className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-all hover:scale-110 bg-bg-surface-1/80 backdrop-blur-md shadow-xl border border-border-subtle"
      >
        <Icons.Plus className="w-5 h-5" />
      </button>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(map) map.zoomOut(); }}
        className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-all hover:scale-110 bg-bg-surface-1/80 backdrop-blur-md shadow-xl border border-border-subtle"
      >
        <Icons.Minus className="w-5 h-5" />
      </button>
    </div>
  );
}

function StyleSwitcher({ activeStyle, onStyleChange }: { activeStyle: keyof typeof MAP_STYLES, onStyleChange: (s: keyof typeof MAP_STYLES) => void }) {
    return (
        <div className="absolute top-6 right-6 z-[1000] flex gap-2">
            {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((styleKey) => (
                <button
                    key={styleKey}
                    onClick={() => onStyleChange(styleKey)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-xl backdrop-blur-md border",
                        activeStyle === styleKey 
                            ? "bg-cyan-vibrant text-white border-cyan-vibrant" 
                            : "bg-bg-surface-1/80 text-text-muted border-border-subtle hover:text-text-primary"
                    )}
                >
                    {MAP_STYLES[styleKey].name}
                </button>
            ))}
        </div>
    );
}

function MapPicker({ onPointSelected }: { onPointSelected: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPointSelected(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Inner component to ensure map context is available
// Temporarily define TrackPoint here until moved to a shared types file
interface TrackPoint {
    lat: number;
    lon: number;
    ele: number;
    name?: string;
    id?: number; // Added id for consistency
}

interface Refuge {
    id: number;
    name: string;
    coords?: [number, number];
    day?: number;
}

// Inner component to ensure map context is available
function MapInner({ stages, refuges, activeStageId, pickingMode, onSelectPoint, onHoverPoint, hoveredPoint, zoomToCoords, onZoomEnd }: {
    stages: TrackPoint[];
    refuges?: Refuge[];
    activeStageId?: number | null;
    pickingMode?: boolean;
    onSelectPoint?: (lat: number, lng: number) => void;
    onHoverPoint?: (point: TrackPoint | null) => void;
    hoveredPoint?: TrackPoint | null;
    zoomToCoords?: [number, number] | null;
    onZoomEnd?: () => void;
}) {
    const map = useMap();
    const [isReady, setIsReady] = useState(false);
    const [style, setStyle] = useState<keyof typeof MAP_STYLES>("tactical");
    const hasFitBounds = useRef(false);

    useEffect(() => {
        if (!map) return;
        
        // Create a custom pane for the hover cursor with higher z-index
        if (!map.getPane('hoverPane')) {
            const hoverPane = map.createPane('hoverPane');
            hoverPane.style.zIndex = '650'; // Higher than markerPane (600)
        }
        
        map.whenReady(() => setIsReady(true));
    }, [map]);

    const polylinePositions = stages.map(s => [s.lat, s.lon] as [number, number]);

    // Auto-fit bounds to show entire track (only once on initial load)
    useEffect(() => {
        if (!map || !isReady || polylinePositions.length === 0 || hasFitBounds.current) return;
        
        const bounds = L.latLngBounds(polylinePositions);
        map.fitBounds(bounds, { padding: [50, 50] });
        hasFitBounds.current = true;
    }, [map, isReady, polylinePositions]);

    useEffect(() => {
        if (map && zoomToCoords) {
            map.flyTo(zoomToCoords, 14, {
                animate: true,
                duration: 1.5
            });
            map.once('zoomend', () => {
                onZoomEnd?.();
            });
        }
    }, [map, zoomToCoords, onZoomEnd]);

    // Handle map hover for synchronization
    useMapEvents({
        mousemove(e) {
            if (!onHoverPoint || stages.length === 0) return;

            let minDist = Infinity;
            let closestPoint: TrackPoint | null = null;

            for (let i = 0; i < stages.length; i++) {
                const s = stages[i];
                const latLng = L.latLng(s.lat, s.lon);
                const dist = latLng.distanceTo(e.latlng);

                if (dist < minDist) {
                    minDist = dist;
                    // Consider a threshold for actual hover to reduce noise
                    if (dist < 100) { // 100 meters threshold
                        closestPoint = s; // Use the actual TrackPoint object
                    }
                }
            }
            onHoverPoint(closestPoint);
        },
        mouseout() {
            if (onHoverPoint) onHoverPoint(null);
        }
    });

    if (!isReady) return null;

    return (
        <>
            <TileLayer
                key={style} // Key change forces fresh mount of TileLayer, very stable
                attribution={MAP_STYLES[style].attr}
                url={MAP_STYLES[style].url}
            />

            {polylinePositions.length > 1 && (
                <Polyline positions={polylinePositions} color="#22d3ee" weight={4} opacity={0.8} />
            )}
            
            {/* Render refuge markers with day numbers */}
            {refuges?.map((refuge) => {
                if (!refuge.coords) return null;
                
                const isActive = activeStageId === refuge.id;
                const scale = isActive ? 1.3 : 1;
                const badgeSize = 24 * scale;
                const fontSize = 11 * scale;
                
                const customIcon = L.divIcon({
                    html: `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; transition: all 0.2s;">
                            <div style="background: #f97316; color: white; width: ${badgeSize}px; height: ${badgeSize}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: ${fontSize}px; border: 2px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3); transform: scale(${scale});">
                                ${refuge.day || '?'}
                            </div>
                            <div style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(4px); color: #18181b; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 1px solid #e4e4e7;">
                                ${refuge.name}
                            </div>
                        </div>
                    `,
                    className: 'custom-refuge-marker',
                    iconSize: [80, 50],
                    iconAnchor: [40, 25],
                });
                
                return (
                    <Marker key={refuge.id} position={refuge.coords} icon={customIcon}>
                        <Popup>
                            <div className="text-sm font-bold">{refuge.name}</div>
                            <div className="text-xs text-text-muted">Jour {refuge.day}</div>
                        </Popup>
                    </Marker>
                );
            })}

            {hoveredPoint && hoveredPoint.lat && hoveredPoint.lon && (
                <CircleMarker center={[hoveredPoint.lat, hoveredPoint.lon]} radius={8} color="#f97316" fillOpacity={0.7} pane="hoverPane" />
            )}
            
            {pickingMode && onSelectPoint && <MapPicker onPointSelected={onSelectPoint} />}
            <ZoomControls />
            <StyleSwitcher activeStyle={style} onStyleChange={setStyle} />
        </>
    );
}

interface Refuge {
    id: number;
    name: string;
    coords?: [number, number];
    day?: number;
}

interface ExpeditionMapProps {
    stages: TrackPoint[]; // These are now all track points
    refuges?: Refuge[]; // Refuges to display as markers
    activeStageId?: number | null; // Active stage for zoom effect
    onSelectPoint?: (lat: number, lng: number) => void;
    pickingMode?: boolean;
    onHoverPoint?: (point: TrackPoint | null) => void; // Callback for hovered point
    hoveredPoint?: TrackPoint | null; // Point to highlight on map
    zoomToCoords?: [number, number] | null;
    onZoomEnd?: () => void;
}

export default function ExpeditionMap({ stages, refuges, activeStageId, onSelectPoint, pickingMode, onHoverPoint, hoveredPoint, zoomToCoords, onZoomEnd }: ExpeditionMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <div className="w-full h-full bg-bg-surface-2 animate-pulse flex items-center justify-center rounded-2xl">
          <Icons.Map className="w-12 h-12 text-text-faint" />
        </div>
    );
  }

  const polylinePositions = stages.map(s => [s.lat, s.lon] as [number, number]);

  const mapCenter = polylinePositions.length > 0 
    ? polylinePositions[Math.floor(polylinePositions.length / 2)] // Center map on middle of track
    : [42.35, 8.9] as [number, number];

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={mapCenter} 
        zoom={pickingMode ? 14 : 11} 
        className="w-full h-full rounded-2xl z-0"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <MapInner stages={stages} refuges={refuges} activeStageId={activeStageId} pickingMode={pickingMode} onSelectPoint={onSelectPoint} onHoverPoint={onHoverPoint} hoveredPoint={hoveredPoint} zoomToCoords={zoomToCoords} onZoomEnd={onZoomEnd} />
      </MapContainer>
    </div>
  );
}
