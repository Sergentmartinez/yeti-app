"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X, Map as MapIcon, Loader2 } from "lucide-react";

const GlobalMapInner = dynamic(() => import("./GlobalMapInner"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center text-stone-400 bg-stone-100">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    )
});

interface GlobalMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    gpxUrl: string;
}

export const GlobalMapModal = ({ isOpen, onClose, gpxUrl }: GlobalMapModalProps) => {
    const [trackPoints, setTrackPoints] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchGPX = async () => {
            try {
                setLoading(true);
                const response = await fetch(gpxUrl);
                const text = await response.text();

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");
                const trkpts = xmlDoc.getElementsByTagName("trkpt");

                const points: [number, number][] = [];
                for (let i = 0; i < trkpts.length; i++) {
                    const lat = parseFloat(trkpts[i].getAttribute("lat") || "0");
                    const lon = parseFloat(trkpts[i].getAttribute("lon") || "0");
                    points.push([lat, lon]);
                }

                setTrackPoints(points);
            } catch (error) {
                console.error("Erreur chargement GPX:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGPX();
    }, [isOpen, gpxUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
            
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <MapIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-800">Carte Globale GR20</h3>
                            <p className="text-xs text-stone-500 font-mono">Calenzana → Conca</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-stone-500" />
                    </button>
                </div>

                <div className="flex-1 relative bg-stone-100">
                    {!loading && trackPoints.length > 0 ? (
                        <GlobalMapInner trackPoints={trackPoints} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};