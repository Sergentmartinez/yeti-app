"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function TestMapbox() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState('Initializing...');
    
    useEffect(() => {
        console.log('🗺️ Component mounted');
        setStatus('Component mounted');
        
        if (!mapContainer.current) {
            console.error('❌ Container not found');
            setStatus('ERROR: Container not found');
            return;
        }
        
        console.log('✅ Container found');
        setStatus('Container found, setting token...');
        
        // Token Mapbox de démo
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
        
        console.log('✅ Token set');
        setStatus('Token set, creating map...');
        
        try {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v12',
                center: [9.0, 42.2],
                zoom: 9
            });
            
            console.log('✅ Map object created');
            setStatus('Map object created, waiting for load...');
            
            map.on('load', () => {
                console.log('✅✅✅ MAP LOADED!');
                setStatus('✅ MAP LOADED SUCCESSFULLY!');
            });
            
            map.on('error', (e) => {
                console.error('❌ Map error:', e);
                setStatus('ERROR: ' + e.error.message);
            });
            
            return () => {
                console.log('🧹 Cleanup');
                map.remove();
            };
            
        } catch (error) {
            console.error('❌ Exception:', error);
            setStatus('EXCEPTION: ' + (error as Error).message);
        }
    }, []);
    
    return (
        <div className="w-screen h-screen flex flex-col">
            <div className="bg-black text-white p-4 font-mono text-sm z-50">
                Status: {status}
            </div>
            <div 
                ref={mapContainer}
                className="flex-1 bg-red-500"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
