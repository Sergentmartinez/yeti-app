"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Icons } from '@/components/icons';
import { useState, useEffect, useRef } from 'react';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(map) map.zoomIn(); }}
        className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-all hover:scale-110 bg-bg-surface-1/80 backdrop-blur-md shadow-xl"
      >
        <Icons.Plus className="w-5 h-5" />
      </button>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(map) map.zoomOut(); }}
        className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-all hover:scale-110 bg-bg-surface-1/80 backdrop-blur-md shadow-xl"
      >
        <Icons.Minus className="w-5 h-5" />
      </button>
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
    const hasInvalidated = useRef(false);

    useEffect(() => {
        if (!map) return;

        let isMounted = true;

        map.whenReady(() => {
            if (isMounted) {
                // Ensure the map container is in the DOM
                const container = map.getContainer();
                if (container && container.offsetParent !== null) {
                    setIsReady(true);
                    if (!hasInvalidated.current) {
                        setTimeout(() => {
                            if (isMounted && map) {
                                map.invalidateSize();
                                hasInvalidated.current = true;
                            }
                        }, 250);
                    }
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, [map]);

    const polylinePositions = stages
        .filter((s: any) => s.coords)
        .map((s: any) => s.coords as [number, number]);

    // Non-DOM dependent logic can stay here, but LayersControl MUST wait for a stable map
    if (!isReady) return null;

    return (
        <>
            <LayersControl position="top-right">
                <LayersControl.BaseLayer checked name="Tactical (Map)">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.Overlay name="Topo Lines">
                    <TileLayer
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                    />
                </LayersControl.Overlay>
            </LayersControl>

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

  // Center on last valid coordinate or Corsica default
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
