"use client";

import { useEffect, useRef, useMemo } from 'react';
import { GPSPoint, POI, TrekTheme } from '@/types';
import * as THREE from 'three';

// --- UTILITAIRES ---

// Fonction simple pour calculer la distance entre deux points GPS (Haversine approx)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI / 180); }

// Fonction pour créer des étiquettes de texte 3D (Sprites)
function createTextSprite(message: string, scale = 1, color = "#6b7280") { // stone-500
    const fontsize = 48; 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const font = `bold ${fontsize}px Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    context.font = font;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;
    
    canvas.width = textWidth + 40; 
    canvas.height = fontsize + 40;

    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true, opacity: 0.8 });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const ratio = canvas.width / canvas.height;
    const baseScale = 12;
    sprite.scale.set(scale * ratio * baseScale, scale * baseScale, 1);
    
    return sprite;
}


// --- COMPOSANT PRINCIPAL ---

interface StageProfile3DStaticProps {
    track: GPSPoint[];
    pois?: POI[];
    theme: TrekTheme;
    activePoi: POI | null;
    onPoiClick: (poi: POI) => void;
}

export const StageProfile3DStatic = ({ 
    track, 
    pois = [], 
    theme, 
    activePoi, 
    onPoiClick 
}: StageProfile3DStaticProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const poiMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

    const isSpirit = theme === 'spirit';
    
    // 🎨 COULEURS
    const colors = useMemo(() => ({
        wall: isSpirit ? 0x3b82f6 : 0xc2410c, 
        top:  isSpirit ? 0x93c5fd : 0xf97316, 
        grid: 0xd1d5db, 
        bg: 0xfafaf9
    }), [isSpirit]);

    // --- PREPARATION DES DONNEES (useMemo) ---
    const data = useMemo(() => {
        if (!track || track.length < 2) return null;

        // 1. Analyse des données brutes
        const eles = track.map(p => p.ele);
        const minEle = Math.min(...eles); const maxEle = Math.max(...eles);
        const lats = track.map(p => p.lat); const lons = track.map(p => p.lon);
        const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons); const maxLon = Math.max(...lons);
        const latRange = maxLat - minLat || 0.0001;
        const lonRange = maxLon - minLon || 0.0001;
        const eleRange = maxEle - minEle || 100;

        // Calcul de la distance totale
        let totalDistKm = 0;
        for(let i=1; i<track.length; i++) {
            totalDistKm += getDistanceFromLatLonInKm(track[i-1].lat, track[i-1].lon, track[i].lat, track[i].lon);
        }

        // CONFIGURATION SCÈNE 3D
        const SCENE_SIZE_X = 300; 
        const HEIGHT_SCALE = 100;
        const WALL_THICKNESS = 12;
        const BASE_Y = -10; 

        // 2. Échantillonnage
        const TARGET_POINTS = 80;
        const step = Math.max(1, Math.floor(track.length / TARGET_POINTS));
        const sampledTrack = [];
        sampledTrack.push(track[0]);
        for(let i=step; i<track.length - step; i+=step) sampledTrack.push(track[i]);
        sampledTrack.push(track[track.length-1]);

        // 3. Conversion en Vecteurs 3D Bruts
        const rawVectors = sampledTrack.map(p => {
            const x = ((p.lon - minLon) / lonRange) * SCENE_SIZE_X;
            const z = ((p.lat - minLat) / latRange) * SCENE_SIZE_X * (latRange/lonRange) * -1; 
            const y = ((p.ele - minEle) / eleRange) * HEIGHT_SCALE;
            return new THREE.Vector3(x, y, z);
        });

        // 4. Alignement et Rotation (Départ à 0,0,0)
        const startVec = rawVectors[0];
        const endVec = rawVectors[rawVectors.length - 1];
        const angle = Math.atan2(endVec.z - startVec.z, endVec.x - startVec.x);

        const rotatedPoints = rawVectors.map(p => {
            const centeredX = p.x - startVec.x;
            const centeredZ = p.z - startVec.z;
            
            let rotatedX = centeredX * Math.cos(-angle) - centeredZ * Math.sin(-angle);
            let rotatedZ = centeredX * Math.sin(-angle) + centeredZ * Math.cos(-angle);

            if (Math.abs(rotatedX) < 0.001) rotatedX = 0;
            if (Math.abs(rotatedZ) < 0.001) rotatedZ = 0;

            return new THREE.Vector3(rotatedX, p.y, rotatedZ);
        });

        // 5. Génération de la Courbe Lisse
        const curve = new THREE.CatmullRomCurve3(rotatedPoints);
        curve.tension = 0.1; 
        const pathPoints = curve.getPoints(400); 

        // 6. Projection des POIs
        const projectedPois = pois.map(poi => {
            const pct = poi.x / 100;
            const idx = Math.floor(pct * (pathPoints.length - 1));
            const realIdx = Math.floor(pct * (track.length - 1));
            return {
                ...poi,
                position: pathPoints[idx],
                alt: track[realIdx]?.ele || 0
            };
        });

        // Ratio KM / Unité 3D
        const finalEnd = pathPoints[pathPoints.length-1];
        const kmTo3DRatio = finalEnd.x / totalDistKm;

        return { 
            path: pathPoints, minEle, maxEle, totalDistKm, projectedPois, 
            thickness: WALL_THICKNESS, baseY: BASE_Y, heightScale: HEIGHT_SCALE, eleRange, kmTo3DRatio
        };
    }, [track, pois]);

    // --- RENDU 3D (useEffect) ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !data) return;

        const { path, thickness, baseY, minEle, maxEle, totalDistKm, heightScale, eleRange, kmTo3DRatio } = data;
        const W = container.clientWidth;
        const H = container.clientHeight;
        const aspect = W / H;

        while (container.firstChild) container.removeChild(container.firstChild);

        // 1. SCÈNE & CAMÉRA
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(colors.bg);

        const d = 100;
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 5000);
        camera.position.set(-45, 200, 300); 
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 2. LUMIÈRES
        scene.add(new THREE.AmbientLight(0xffffff, 1.2)); 
        const mainLight = new THREE.DirectionalLight(0xffffff, 4.0);
        mainLight.position.set(-300, 150, 200); 
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.set(4096, 4096);
        mainLight.shadow.bias = -0.0005;
        const dShadow = 500;
        mainLight.shadow.camera.left = -dShadow; mainLight.shadow.camera.right = dShadow;
        mainLight.shadow.camera.top = dShadow; mainLight.shadow.camera.bottom = -dShadow;
        scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0xffdab9, 0.4); 
        fillLight.position.set(200, 100, -200);
        scene.add(fillLight);

        // 3. GÉOMÉTRIE RUBAN
        const leftRail: THREE.Vector3[] = [];
        const rightRail: THREE.Vector3[] = [];
        const halfThick = thickness / 2;

        for (let i = 0; i < path.length; i++) {
            const curr = path[i];
            const prev = path[i - 1] || curr;
            const next = path[i + 1] || curr;
            const tangent = new THREE.Vector3().subVectors(next, prev).normalize();
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(halfThick);
            leftRail.push(new THREE.Vector3().addVectors(curr, normal));
            rightRail.push(new THREE.Vector3().subVectors(curr, normal));
        }

        const vertices: number[] = [];
        const indices: number[] = [];

        for (let i = 0; i < path.length; i++) {
            const l = leftRail[i]; const r = rightRail[i];
            vertices.push(l.x, l.y, l.z - halfThick);    // 0
            vertices.push(r.x, r.y, r.z - halfThick);    // 1
            vertices.push(l.x, baseY, l.z - halfThick);  // 2
            vertices.push(r.x, baseY, r.z - halfThick);  // 3
        }

        for (let i = 0; i < path.length - 1; i++) {
            const base = i * 4; const next = (i + 1) * 4;
            indices.push(base + 0, next + 0, base + 1); indices.push(next + 0, next + 1, base + 1); // Top
            indices.push(base + 2, next + 2, base + 0); indices.push(next + 2, next + 0, base + 0); // Left
            indices.push(base + 1, next + 1, base + 3); indices.push(next + 1, next + 3, base + 3); // Right
        }
        indices.push(2, 3, 0); indices.push(3, 1, 0); // Cap start
        const last = (path.length - 1) * 4;
        indices.push(last + 0, last + 1, last + 2); indices.push(last + 1, last + 3, last + 2); // Cap end

        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: colors.wall,
            roughness: 0.5,
            metalness: 0.0,
            flatShading: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        const linePoints = path.map(p => new THREE.Vector3(p.x, p.y + 0.5, p.z - halfThick));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, opacity: 0.5, transparent: true });
        scene.add(new THREE.Line(lineGeo, lineMat));

        // 4. ENVIRONNEMENT (Grilles et Étiquettes)
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);

        const gridEndX = Math.ceil(size.x / 50) * 50 + 50;
        const gridBackZ = -50; 
        const gridFrontZ = 100; 

        // A. GRILLE SOL (Horizontale)
        const gridMat = new THREE.LineBasicMaterial({ color: colors.grid, opacity: 0.6, transparent: true });
        const floorPoints: number[] = [];
        const ALT_STEP = 500;
        const startAlt = Math.floor(minEle / ALT_STEP) * ALT_STEP;
        for (let alt = startAlt; alt <= maxEle + ALT_STEP/2; alt += ALT_STEP) {
            const y = baseY + ((alt - minEle) / eleRange) * heightScale;
            floorPoints.push(-50, y, gridBackZ,  gridEndX, y, gridBackZ);
        }
        const DIST_STEP_KM = 1;
        for (let km = 1; km <= totalDistKm + DIST_STEP_KM/2; km += DIST_STEP_KM) {
            const x = km * kmTo3DRatio;
            floorPoints.push(x, baseY, gridBackZ, x, baseY, gridFrontZ);
        }
        const floorGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(floorPoints, 3));
        scene.add(new THREE.LineSegments(floorGeo, gridMat));

        // B. ÉTIQUETTES ALTITUDE (Axe Y vertical au fond à gauche)
        const altLabelGroup = new THREE.Group();
        for (let alt = startAlt; alt <= maxEle + ALT_STEP/1; alt += ALT_STEP) {
            if (alt < minEle) continue;
            const y = baseY + ((alt - minEle) / eleRange) * heightScale;
            const sprite = createTextSprite(`${alt}m`, 1.5);
            if(sprite) {
                sprite.position.set(1, y, gridBackZ);
                altLabelGroup.add(sprite);
            }
        }
        scene.add(altLabelGroup);

        // C. ÉTIQUETTES DISTANCE (Axe X horizontal devant)
        const distLabelGroup = new THREE.Group();
        for (let km = 0.0; km <= totalDistKm + 0.9; km += DIST_STEP_KM) {
             const x = km * kmTo3DRatio;
             let label = `${km}km`;
             if (km > totalDistKm - DIST_STEP_KM/2 && km < totalDistKm + 0.1) {
                label = `${Math.round(totalDistKm)}km`;
             }
             const sprite = createTextSprite(label, 1.4);
             if(sprite) {
                 sprite.position.set(x, baseY, gridFrontZ + 10);
                 distLabelGroup.add(sprite);
             }
        }
        scene.add(distLabelGroup);


        // 5. POIS
        poiMeshesRef.current.clear();
        data.projectedPois.forEach(poi => {
            const g = new THREE.Group();
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            const border = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshBasicMaterial({ color: colors.wall, side: THREE.BackSide }));
            g.add(sphere); g.add(border);

            const dropLine = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0,0,0), 
                    new THREE.Vector3(0, baseY - poi.position.y, 0)
                ]),
                new THREE.LineBasicMaterial({ color: colors.wall, transparent: true, opacity: 0.5, linewidth: 1 })
            );
            g.add(dropLine);
            g.position.copy(poi.position).z -= halfThick;
            g.position.y += 10;
            scene.add(g);
            poiMeshesRef.current.set(poi.label, sphere);
        });

        // 6. AUTO-ZOOM
        const fitBox = new THREE.Box3();
        fitBox.expandByObject(mesh);
        fitBox.expandByObject(altLabelGroup);
        fitBox.expandByObject(distLabelGroup);
        
        const fitSize = new THREE.Vector3(); fitBox.getSize(fitSize);
        const fitCenter = new THREE.Vector3(); fitBox.getCenter(fitCenter);

        const margin = 1.15; 
        const maxDim = Math.max(fitSize.x * 0.6, fitSize.y, fitSize.z * 0.9);

        if (aspect > 1) { 
            camera.top = maxDim * margin / 2;
            camera.bottom = -maxDim * margin / 2;
            camera.left = -maxDim * margin * aspect / 2;
            camera.right = maxDim * margin * aspect / 2;
        } else { 
            camera.left = -maxDim * margin / 2;
            camera.right = maxDim * margin / 2;
            camera.top = maxDim * margin / aspect / 2;
            camera.bottom = -maxDim * margin / aspect / 2;
        }
        
        camera.lookAt(fitCenter);
        camera.position.set(fitCenter.x - 200, fitCenter.y + 130, fitCenter.z + 200);
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);

        // Interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const onClick = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const hits = raycaster.intersectObjects(Array.from(poiMeshesRef.current.values()), true); 
            if (hits.length > 0) {
                let obj = hits[0].object;
                while(obj.parent && obj.parent.type !== 'Scene') obj = obj.parent;
                for (const [label, mesh] of poiMeshesRef.current.entries()) {
                    if (obj.children.includes(mesh) || obj === mesh) {
                        const p = data.projectedPois.find(x => x.label === label);
                        if (p) onPoiClick(p); break;
                    }
                }
            }
        };
        container.addEventListener('click', onClick);

        // Cleanup
        return () => {
            container.removeEventListener('click', onClick);
            if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
            renderer.dispose();
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            });
        };

    }, [data, colors, onPoiClick]);

    if (!data) return <div className="h-full flex items-center justify-center text-stone-400 font-mono text-sm animate-pulse">Chargement du profil 3D...</div>;

    return (
        <div className="relative w-full h-full bg-[#fafaf9] overflow-hidden cursor-grab active:cursor-grabbing rounded-xl">
            <div ref={containerRef} className="w-full h-full" />
            
            {/* UI Overlay (POI Actif) */}
            {activePoi && (
                <div className="absolute top-4 right-4 z-20 text-xs font-bold text-stone-800 bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2 rounded-full border border-stone-200 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    {activePoi.label} 
                    <span className="text-stone-500 font-mono font-normal ml-1">({Math.round(activePoi.alt || 0)}m)</span>
                </div>
            )}
        </div>
    );
};