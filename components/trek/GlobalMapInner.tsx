// components/trek/GlobalMapInner.tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// On corrige les icônes Leaflet par défaut qui buggent souvent avec Webpack
import L from "leaflet";

// Petit fix pour les icônes manquantes
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Composant utilitaire pour le recentrage (utilise le Hook useMap ici sans erreur)
const FitBounds = ({ bounds }: { bounds: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds.length > 0 && map) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

interface GlobalMapInnerProps {
    trackPoints: [number, number][];
}

const GlobalMapInner = ({ trackPoints }: GlobalMapInnerProps) => {
    // Centre par défaut (Corse)
    const defaultCenter: [number, number] = [42.15, 9.0];

    return (
        <MapContainer
            center={defaultCenter}
            zoom={9}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />

            {trackPoints.length > 0 && (
                <>
                    <Polyline
                        positions={trackPoints}
                        pathOptions={{ color: '#ea580c', weight: 4, opacity: 0.8 }}
                    />
                    <FitBounds bounds={trackPoints} />
                </>
            )}
        </MapContainer>
    );
};

export default GlobalMapInner;