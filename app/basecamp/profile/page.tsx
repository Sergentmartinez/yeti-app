"use client";

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { MOCK_USER } from "@/lib/data";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

// Types pour les mensurations
interface BodyStats {
  height: number;      // cm
  weight: number;      // kg
  torsoLength: number; // cm (C7 à crête iliaque)
  shoulderWidth: number; // cm
  hipWidth: number;    // cm
  apparelSize: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  gender: "male" | "female";
}

// Stats par défaut
const DEFAULT_STATS: BodyStats = {
  height: 175,
  weight: 70,
  torsoLength: 48,
  shoulderWidth: 45,
  hipWidth: 35,
  apparelSize: "M",
  gender: "male",
};

// === COMPOSANT MANNEQUIN 3D ===
interface Mannequin3DProps {
  stats: BodyStats;
  showBackpack: boolean;
  backpackSize: number;
}

const Mannequin3D = ({ stats, showBackpack, backpackSize }: Mannequin3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const mannequinRef = useRef<any>(null);
  const backpackRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const threeRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initScene = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      threeRef.current = THREE;

      // Determine colors based on current theme
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const bgColor = isDark ? 0x050507 : 0xfafaf9;
      const groundColor = isDark ? 0x111113 : 0xe7e5e4;
      const gridColor = isDark ? 0x27272a : 0xd6d3d1;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(bgColor);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.2, 4);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 8;
      controls.maxPolarAngle = Math.PI * 0.9;
      controls.target.set(0, 1, 0);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);

      // Ground
      const groundGeometry = new THREE.CircleGeometry(2, 32);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: groundColor,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid
      const gridHelper = new THREE.GridHelper(4, 20, gridColor, gridColor);
      gridHelper.position.y = 0;
      scene.add(gridHelper);

      // Mannequin initial
      const mannequin = createMannequin(THREE, stats);
      mannequinRef.current = mannequin;
      scene.add(mannequin);

      // Animation
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    initScene();

    return () => {
      cancelAnimationFrame(frameRef.current);
      const renderer = rendererRef.current;
      if (renderer && container) {
        const dom = renderer.domElement;
        if (dom && dom.parentNode === container) {
          container.removeChild(dom);
        }
        renderer.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update quand stats changent
  useEffect(() => {
    if (!sceneRef.current || !threeRef.current) return;

    const THREE = threeRef.current;

    // Supprimer ancien mannequin
    if (mannequinRef.current) {
      sceneRef.current.remove(mannequinRef.current);
    }

    // Nouveau mannequin
    const newMannequin = createMannequin(THREE, stats);
    mannequinRef.current = newMannequin;
    sceneRef.current.add(newMannequin);

    // Sac à dos
    if (backpackRef.current) {
      sceneRef.current.remove(backpackRef.current);
    }

    if (showBackpack) {
      const backpack = createBackpack(THREE, stats, backpackSize);
      backpackRef.current = backpack;
      sceneRef.current.add(backpack);
    }
  }, [stats, showBackpack, backpackSize]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px]"
    />
  );
};

// Créer le mannequin 3D
function createMannequin(THREE: any, stats: BodyStats) {
  const group = new THREE.Group();
  
  const scale = stats.height / 175;
  const shoulderScale = stats.shoulderWidth / 45;
  const hipScale = stats.hipWidth / 35;
  const torsoScale = stats.torsoLength / 48;
  const isFemale = stats.gender === "female";

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light';

  // Matériaux
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.7,
  });

  const clothingMaterial = new THREE.MeshStandardMaterial({
    color: isDark ? 0x27272a : 0x44403c,
    roughness: 0.8,
  });

  const shirtMaterial = new THREE.MeshStandardMaterial({
    color: isDark ? 0x52525b : 0x78716c,
    roughness: 0.9,
  });

  // TÊTE
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 32, 32), skinMaterial);
  head.position.y = 1.58 * scale;
  head.castShadow = true;
  group.add(head);

  // COU
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.045 * scale, 0.08 * scale, 16), skinMaterial);
  neck.position.y = 1.44 * scale;
  neck.castShadow = true;
  group.add(neck);

  // TORSE
  const torsoHeight = 0.5 * torsoScale * scale;
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(
        (isFemale ? 0.12 : 0.15) * shoulderScale * scale, 
        (isFemale ? 0.16 : 0.19) * shoulderScale * scale, 
        torsoHeight, 
        16
    ),
    shirtMaterial
  );
  torso.position.y = 1.15 * scale;
  torso.castShadow = true;
  group.add(torso);

  // BASSIN
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(
      (isFemale ? 0.17 : 0.14) * hipScale * scale,
      (isFemale ? 0.17 : 0.14) * hipScale * scale * 0.95,
      0.12 * scale,
      16
    ),
    clothingMaterial
  );
  pelvis.position.y = 0.84 * scale;
  pelvis.castShadow = true;
  group.add(pelvis);

  // JAMBES (Simplified for performance/readability in refactor)
  const legGeom = new THREE.CylinderGeometry(0.05 * scale, 0.03 * scale, 0.75 * scale, 12);
  const legL = new THREE.Mesh(legGeom, clothingMaterial);
  legL.position.set(-0.08 * hipScale * scale, 0.4 * scale, 0);
  legL.castShadow = true;
  group.add(legL);

  const legR = new THREE.Mesh(legGeom, clothingMaterial);
  legR.position.set(0.08 * hipScale * scale, 0.4 * scale, 0);
  legR.castShadow = true;
  group.add(legR);

  return group;
}

// Sac à dos (Simplified)
function createBackpack(THREE: any, stats: BodyStats, liters: number) {
  const group = new THREE.Group();
  const scale = stats.height / 175;
  const packDepth = (0.12 + (liters / 100) * 0.1) * scale;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry((0.22 + (liters / 100) * 0.12) * scale, (0.32 + (liters / 100) * 0.28) * scale, packDepth),
    new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 })
  );
  body.position.set(0, 1.1 * scale, -0.15 * scale);
  body.castShadow = true;
  group.add(body);
  return group;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<BodyStats>(() => {
    const baseStats = MOCK_USER.stats;
    return {
      height: baseStats?.height || DEFAULT_STATS.height,
      weight: baseStats?.weight || DEFAULT_STATS.weight,
      torsoLength: baseStats?.torsoLength || DEFAULT_STATS.torsoLength,
      shoulderWidth: DEFAULT_STATS.shoulderWidth,
      hipWidth: DEFAULT_STATS.hipWidth,
      apparelSize: (baseStats?.apparelSize as BodyStats["apparelSize"]) || DEFAULT_STATS.apparelSize,
      gender: DEFAULT_STATS.gender,
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [backpackSize, setBackpackSize] = useState(45);

  const updateStat = <K extends keyof BodyStats>(key: K, value: BodyStats[K]) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const backpackSizeReco = stats.torsoLength < 44 ? "S" : stats.torsoLength < 48 ? "M" : "L";
  const maxLoad = (stats.weight * 0.20).toFixed(1);
  const isValid = stats.height >= 140 && stats.height <= 220;

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-300 pb-20 font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Icons.User className="w-6 h-6 text-accent-orange" />
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Profil & Mensurations</h1>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Ajustement matériel technique</p>
          </div>
        </div>
        
        <Link href="/basecamp" className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors flex items-center gap-2">
          <Icons.ArrowLeft className="w-4 h-4" /> Retour Basecamp
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-10 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="premium-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Icons.User className="w-4 h-4 text-text-muted" />
                Tes Mensurations
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isEditing 
                    ? "bg-emerald-500 text-bg-surface-1" 
                    : "bg-bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle"
                )}
              >
                {isEditing ? "✓ Terminé" : "Modifier"}
              </button>
            </div>

            <div className="space-y-8">
                {/* Gender Toggle */}
                <div className="grid grid-cols-2 gap-3">
                    {["male", "female"].map((g) => (
                        <button
                            key={g}
                            onClick={() => isEditing && updateStat("gender", g as any)}
                            disabled={!isEditing}
                            className={cn(
                                "py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                stats.gender === g 
                                    ? "bg-text-primary text-bg-base" 
                                    : "bg-bg-surface-3 text-text-faint hover:text-text-muted"
                            )}
                        >
                            {g === 'male' ? 'Homme' : 'Femme'}
                        </button>
                    ))}
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { key: 'height', label: 'Taille', unit: 'cm' },
                        { key: 'weight', label: 'Poids', unit: 'kg' },
                        { key: 'torsoLength', label: 'Torse', unit: 'cm' },
                    ].map((s) => (
                        <div key={s.key} className="space-y-2">
                            <label className="text-[10px] font-black text-text-faint uppercase tracking-widest">{s.label} ({s.unit})</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={(stats as any)[s.key]}
                                    onChange={(e) => updateStat(s.key as any, parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-lg font-black text-text-primary focus:ring-1 focus:ring-accent-orange/50 outline-none transition-all"
                                />
                            ) : (
                                <div className="text-2xl font-black text-text-primary">{(stats as any)[s.key]}<span className="text-xs text-text-faint ml-1 font-bold">{s.unit}</span></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border-subtle">
                     {[
                        { key: 'shoulderWidth', label: 'Épaules', unit: 'cm' },
                        { key: 'hipWidth', label: 'Hanches', unit: 'cm' },
                        { key: 'apparelSize', label: 'Gabarit', options: ["XS", "S", "M", "L", "XL", "XXL"] },
                    ].map((s) => (
                        <div key={s.key} className="space-y-2">
                            <label className="text-[10px] font-black text-text-faint uppercase tracking-widest">{s.label}</label>
                            {isEditing ? (
                                s.options ? (
                                    <select 
                                        value={stats.apparelSize}
                                        onChange={(e) => updateStat('apparelSize', e.target.value as any)}
                                        className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-sm font-black text-text-primary"
                                    >
                                        {s.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        value={(stats as any)[s.key]}
                                        onChange={(e) => updateStat(s.key as any, parseInt(e.target.value) || 0)}
                                        className="w-full bg-bg-surface-2 border border-border-subtle rounded-xl px-4 py-3 text-sm font-black text-text-primary"
                                    />
                                )
                            ) : (
                                <div className="text-xl font-black text-text-primary">{(stats as any)[s.key]}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="premium-card p-5 rounded-2xl bg-text-primary text-bg-base">
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Taille Sac Recommandée</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-black tracking-tighter">{backpackSizeReco}</span>
                    <span className="text-[10px] font-black opacity-60">Torse {stats.torsoLength}cm</span>
                </div>
            </div>
            
            <div className="premium-card p-5 rounded-2xl border-emerald-500/20">
                <p className="text-[10px] uppercase font-black text-text-faint tracking-widest mb-2">Charge Max Confort</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-emerald-500 tracking-tighter">{maxLoad}<span className="text-sm ml-1">kg</span></span>
                    <span className="text-[10px] font-black text-text-faint uppercase">20% du poids</span>
                </div>
            </div>
          </div>

          <div className="premium-card p-6 rounded-2xl bg-bg-surface-2/40">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Visualisation 3D</h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-1">Simuler un sac sur le mannequin</p>
                </div>
                <button
                    onClick={() => setShowBackpack(!showBackpack)}
                    className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        showBackpack ? "bg-accent-orange text-bg-surface-1 shadow-lg" : "bg-bg-surface-3 text-text-muted"
                    )}
                >
                    {showBackpack ? "Retirer" : "Ajouter"}
                </button>
            </div>
            {showBackpack && (
                <div className="space-y-6 pt-4 border-t border-border-subtle">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                        <span className="text-text-faint">Volume</span>
                        <span className="text-accent-orange">{backpackSize} Litres</span>
                    </div>
                    <input 
                        type="range" min={20} max={85} step={5} value={backpackSize}
                        onChange={(e) => setBackpackSize(parseInt(e.target.value))}
                        className="w-full accent-accent-orange"
                    />
                </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="premium-card rounded-2xl border-border-subtle overflow-hidden sticky top-6 bg-bg-surface-1 shadow-2xl">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface-2/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Aperçu temps réel</span>
              </div>
              <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Rotate: 360°</span>
            </div>

            <div className="h-[550px] relative bg-bg-surface-2/20">
                {isValid ? (
                    <Mannequin3D stats={stats} showBackpack={showBackpack} backpackSize={backpackSize} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <Icons.Warning className="w-12 h-12 text-text-faint mb-4" />
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Données Invalides</h3>
                        <p className="text-[10px] font-bold text-text-faint uppercase mt-2">Vérifie tes mensurations</p>
                    </div>
                )}
                {/* Labels overlay */}
                <div className="absolute top-4 right-4 space-y-2 pointer-events-none">
                    <div className="bg-bg-surface-1/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border-subtle shadow-sm flex flex-col items-end">
                        <span className="text-[8px] font-black text-text-faint uppercase">Dos</span>
                        <span className="text-xs font-black text-text-primary">{stats.torsoLength}cm</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
