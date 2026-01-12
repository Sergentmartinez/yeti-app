"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const GR20_COORDINATES: [number, number][] = [
  [42.4722, 8.8681], // Calenzana
  [42.4167, 8.8833], // Ortu di u Piobbu
  [42.3667, 8.9167], // Carozzu
  [42.3333, 8.8667], // Asco Stagnu
  [42.3000, 8.9000], // Tighjettu
  [42.2611, 8.9222], // Ciottulu di i Mori
];

export default function ExpeditionMap() {
  return (
    <MapContainer 
      center={[42.35, 8.9]} 
      zoom={11} 
      className="w-full h-full rounded-2xl z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={GR20_COORDINATES} color="#22d3ee" weight={4} opacity={0.8} />
      {GR20_COORDINATES.map((pos, i) => (
         <Marker key={i} position={pos}>
            <Popup>
                <div className="text-xs font-black uppercase">Étape {i + 1}</div>
            </Popup>
         </Marker>
      ))}
    </MapContainer>
  );
}
