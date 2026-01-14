"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
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
        name: "Tactique",
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
function MapInner({ stages, pickingMode, onSelectPoint }: any) {
    const map = useMap();
    const [isReady, setIsReady] = useState(false);
    const [style, setStyle] = useState<keyof typeof MAP_STYLES>('tactical');

    useEffect(() => {
        if (!map) return;
        map.whenReady(() => setIsReady(true));
    }, [map]);

    const polylinePositions = stages
        .filter((s: any) => s.coords)
        .map((s: any) => s.coords as [number, number]);

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
            
            {stages.filter((s: any) => s.coords).map((stage: any) => (
                <Marker key={stage.id} position={stage.coords!}>
                    <Popup>
                        <div className="text-xs font-black uppercase text-text-primary underline mb-1">{stage.name}</div>
                        <div className="text-[10px] font-bold text-text-muted">{stage.absElev}m / +{stage.elev}m D+</div>
                    </Popup>
                </Marker>
            ))}
            
            {pickingMode && onSelectPoint && <MapPicker onPointSelected={onSelectPoint} />}
            <ZoomControls />
            <StyleSwitcher activeStyle={style} onStyleChange={setStyle} />
        </>
    );
}

interface ExpeditionMapProps {
    stages: Array<{
        id: number;
        name: string;
        coords?: [number, number];
        absElev?: string;
        elev?: string;
    }>;
    onSelectPoint?: (lat: number, lng: number) => void;
    pickingMode?: boolean;
}

export default function ExpeditionMap({ stages, onSelectPoint, pickingMode }: ExpeditionMapProps) {
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

  const polylinePositions = stages
    .filter(s => s.coords)
    .map(s => s.coords as [number, number]);

  const mapCenter = polylinePositions.length > 0 
    ? polylinePositions[polylinePositions.length - 1] 
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
        <MapInner stages={stages} pickingMode={pickingMode} onSelectPoint={onSelectPoint} />
      </MapContainer>
    </div>
  );
}
