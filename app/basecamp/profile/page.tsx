"use client";

import { useState, useRef, useEffect } from "react";
import { MOCK_USER } from "@/lib/data";
import { Icons } from "@/components/icons";

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

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xfafaf9);
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
      const renderer = new THREE.WebGLRenderer({ antialias: true });
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
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);

      // Ground
      const groundGeometry = new THREE.CircleGeometry(2, 32);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe7e5e4,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid
      const gridHelper = new THREE.GridHelper(4, 20, 0xd6d3d1, 0xd6d3d1);
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
      mannequinRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Nouveau mannequin
    const newMannequin = createMannequin(THREE, stats);
    mannequinRef.current = newMannequin;
    sceneRef.current.add(newMannequin);

    // Sac à dos
    if (backpackRef.current) {
      sceneRef.current.remove(backpackRef.current);
      backpackRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      backpackRef.current = null;
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

  // Matériaux
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.7,
    metalness: 0.1,
  });

  const clothingMaterial = new THREE.MeshStandardMaterial({
    color: 0x44403c,
    roughness: 0.8,
  });

  const shirtMaterial = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.9,
  });

  // === TÊTE ===
  const headRadius = 0.11 * scale;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(headRadius, 32, 32),
    skinMaterial
  );
  head.position.y = 1.58 * scale;
  head.castShadow = true;
  group.add(head);

  // Cou
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04 * scale, 0.045 * scale, 0.08 * scale, 16),
    skinMaterial
  );
  neck.position.y = 1.44 * scale;
  neck.castShadow = true;
  group.add(neck);

  // === TORSE ===
  const torsoHeight = 0.5 * torsoScale * scale;
  const chestWidth = isFemale ? 0.16 : 0.19;
  const waistWidth = isFemale ? 0.12 : 0.15;
  
  const torsoGeometry = new THREE.CylinderGeometry(
    waistWidth * shoulderScale * scale,
    chestWidth * shoulderScale * scale,
    torsoHeight,
    16
  );
  const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
  torso.position.y = 1.15 * scale;
  torso.castShadow = true;
  group.add(torso);

  // Poitrine (pour femme)
  if (isFemale) {
    const bustGeom = new THREE.SphereGeometry(0.06 * scale, 16, 16);
    const bustL = new THREE.Mesh(bustGeom, shirtMaterial);
    bustL.position.set(-0.06 * scale, 1.22 * scale, 0.08 * scale);
    bustL.scale.set(1, 0.8, 0.6);
    bustL.castShadow = true;
    group.add(bustL);

    const bustR = new THREE.Mesh(bustGeom, shirtMaterial);
    bustR.position.set(0.06 * scale, 1.22 * scale, 0.08 * scale);
    bustR.scale.set(1, 0.8, 0.6);
    bustR.castShadow = true;
    group.add(bustR);
  }

  // === BASSIN ===
  const pelvisWidth = isFemale ? 0.17 : 0.14;
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(
      pelvisWidth * hipScale * scale,
      pelvisWidth * hipScale * scale * 0.95,
      0.12 * scale,
      16
    ),
    clothingMaterial
  );
  pelvis.position.y = 0.84 * scale;
  pelvis.castShadow = true;
  group.add(pelvis);

  // === ÉPAULES ===
  const shoulderGeom = new THREE.SphereGeometry(0.055 * scale, 16, 16);
  
  const shoulderL = new THREE.Mesh(shoulderGeom, shirtMaterial);
  shoulderL.position.set(-0.2 * shoulderScale * scale, 1.36 * scale, 0);
  shoulderL.castShadow = true;
  group.add(shoulderL);

  const shoulderR = new THREE.Mesh(shoulderGeom, shirtMaterial);
  shoulderR.position.set(0.2 * shoulderScale * scale, 1.36 * scale, 0);
  shoulderR.castShadow = true;
  group.add(shoulderR);

  // === BRAS ===
  const armLength = 0.26 * scale;
  const armGeom = new THREE.CylinderGeometry(0.032 * scale, 0.028 * scale, armLength, 12);
  
  // Bras gauche
  const upperArmL = new THREE.Mesh(armGeom, shirtMaterial);
  upperArmL.position.set(-0.24 * shoulderScale * scale, 1.2 * scale, 0);
  upperArmL.rotation.z = 0.12;
  upperArmL.castShadow = true;
  group.add(upperArmL);

  // Bras droit
  const upperArmR = new THREE.Mesh(armGeom, shirtMaterial);
  upperArmR.position.set(0.24 * shoulderScale * scale, 1.2 * scale, 0);
  upperArmR.rotation.z = -0.12;
  upperArmR.castShadow = true;
  group.add(upperArmR);

  // Avant-bras
  const forearmGeom = new THREE.CylinderGeometry(0.028 * scale, 0.022 * scale, armLength * 0.9, 12);
  
  const forearmL = new THREE.Mesh(forearmGeom, skinMaterial);
  forearmL.position.set(-0.27 * shoulderScale * scale, 0.95 * scale, 0);
  forearmL.rotation.z = 0.12;
  forearmL.castShadow = true;
  group.add(forearmL);

  const forearmR = new THREE.Mesh(forearmGeom, skinMaterial);
  forearmR.position.set(0.27 * shoulderScale * scale, 0.95 * scale, 0);
  forearmR.rotation.z = -0.12;
  forearmR.castShadow = true;
  group.add(forearmR);

  // Mains
  const handGeom = new THREE.SphereGeometry(0.028 * scale, 12, 12);
  
  const handL = new THREE.Mesh(handGeom, skinMaterial);
  handL.position.set(-0.29 * shoulderScale * scale, 0.72 * scale, 0);
  handL.scale.set(0.8, 1, 0.6);
  handL.castShadow = true;
  group.add(handL);

  const handR = new THREE.Mesh(handGeom, skinMaterial);
  handR.position.set(0.29 * shoulderScale * scale, 0.72 * scale, 0);
  handR.scale.set(0.8, 1, 0.6);
  handR.castShadow = true;
  group.add(handR);

  // === JAMBES ===
  const thighLength = 0.38 * scale;
  const thighGeom = new THREE.CylinderGeometry(0.055 * scale, 0.045 * scale, thighLength, 12);
  
  const thighL = new THREE.Mesh(thighGeom, clothingMaterial);
  thighL.position.set(-0.075 * hipScale * scale, 0.58 * scale, 0);
  thighL.castShadow = true;
  group.add(thighL);

  const thighR = new THREE.Mesh(thighGeom, clothingMaterial);
  thighR.position.set(0.075 * hipScale * scale, 0.58 * scale, 0);
  thighR.castShadow = true;
  group.add(thighR);

  // Mollets
  const calfLength = 0.36 * scale;
  const calfGeom = new THREE.CylinderGeometry(0.042 * scale, 0.032 * scale, calfLength, 12);
  
  const calfL = new THREE.Mesh(calfGeom, clothingMaterial);
  calfL.position.set(-0.075 * hipScale * scale, 0.2 * scale, 0);
  calfL.castShadow = true;
  group.add(calfL);

  const calfR = new THREE.Mesh(calfGeom, clothingMaterial);
  calfR.position.set(0.075 * hipScale * scale, 0.2 * scale, 0);
  calfR.castShadow = true;
  group.add(calfR);

  // Pieds
  const footGeom = new THREE.BoxGeometry(0.055 * scale, 0.035 * scale, 0.11 * scale);
  const footMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
  
  const footL = new THREE.Mesh(footGeom, footMat);
  footL.position.set(-0.075 * hipScale * scale, 0.018, 0.025);
  footL.castShadow = true;
  group.add(footL);

  const footR = new THREE.Mesh(footGeom, footMat);
  footR.position.set(0.075 * hipScale * scale, 0.018, 0.025);
  footR.castShadow = true;
  group.add(footR);

  return group;
}

// Créer le sac à dos
function createBackpack(THREE: any, stats: BodyStats, liters: number) {
  const group = new THREE.Group();
  
  const scale = stats.height / 175;
  const torsoScale = stats.torsoLength / 48;
  
  // Dimensions basées sur litrage
  const packHeight = (0.32 + (liters / 100) * 0.28) * torsoScale * scale;
  const packWidth = (0.22 + (liters / 100) * 0.12) * scale;
  const packDepth = (0.12 + (liters / 100) * 0.1) * scale;

  // Matériaux
  const packMaterial = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.6,
    metalness: 0.1,
  });

  const pocketMaterial = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.7,
  });

  const strapMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.8,
  });

  // Corps du sac avec coins arrondis
  const bodyShape = new THREE.Shape();
  const w = packWidth / 2;
  const h = packHeight / 2;
  const r = 0.02;
  
  bodyShape.moveTo(-w + r, -h);
  bodyShape.lineTo(w - r, -h);
  bodyShape.quadraticCurveTo(w, -h, w, -h + r);
  bodyShape.lineTo(w, h - r);
  bodyShape.quadraticCurveTo(w, h, w - r, h);
  bodyShape.lineTo(-w + r, h);
  bodyShape.quadraticCurveTo(-w, h, -w, h - r);
  bodyShape.lineTo(-w, -h + r);
  bodyShape.quadraticCurveTo(-w, -h, -w + r, -h);

  const extrudeSettings = {
    depth: packDepth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.center();
  const body = new THREE.Mesh(bodyGeometry, packMaterial);
  body.position.set(0, 1.08 * scale, -0.12 * scale - packDepth / 2);
  body.rotation.y = Math.PI;
  body.castShadow = true;
  group.add(body);

  // Poche frontale
  const pocketGeom = new THREE.BoxGeometry(packWidth * 0.7, packHeight * 0.35, 0.035);
  const pocket = new THREE.Mesh(pocketGeom, pocketMaterial);
  pocket.position.set(0, 0.95 * scale, -0.12 * scale - packDepth - 0.02);
  pocket.castShadow = true;
  group.add(pocket);

  // Bretelles
  const strapWidth = 0.035;
  const strapThickness = 0.015;
  
  // Bretelle gauche
  const strapLGeom = new THREE.BoxGeometry(strapWidth, packHeight * 0.7, strapThickness);
  const strapL = new THREE.Mesh(strapLGeom, strapMaterial);
  strapL.position.set(-0.08 * scale, 1.12 * scale, -0.04 * scale);
  strapL.rotation.x = 0.15;
  strapL.castShadow = true;
  group.add(strapL);

  // Bretelle droite
  const strapR = new THREE.Mesh(strapLGeom, strapMaterial);
  strapR.position.set(0.08 * scale, 1.12 * scale, -0.04 * scale);
  strapR.rotation.x = 0.15;
  strapR.castShadow = true;
  group.add(strapR);

  // Ceinture ventrale
  const beltGeom = new THREE.TorusGeometry(0.13 * scale, 0.012, 8, 24, Math.PI * 0.8);
  const belt = new THREE.Mesh(beltGeom, strapMaterial);
  belt.position.set(0, 0.82 * scale, 0.06);
  belt.rotation.x = Math.PI / 2;
  belt.rotation.z = Math.PI * 0.1;
  belt.castShadow = true;
  group.add(belt);

  // Rabat supérieur
  const topFlapGeom = new THREE.BoxGeometry(packWidth * 0.9, 0.06, packDepth * 0.8);
  const topFlap = new THREE.Mesh(topFlapGeom, pocketMaterial);
  topFlap.position.set(0, 1.08 * scale + packHeight / 2 + 0.03, -0.12 * scale - packDepth / 2);
  topFlap.rotation.x = -0.1;
  topFlap.castShadow = true;
  group.add(topFlap);

  // Label YETI (simple rectangle)
  const labelGeom = new THREE.PlaneGeometry(0.04, 0.015);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const label = new THREE.Mesh(labelGeom, labelMat);
  label.position.set(0, 1.15 * scale, -0.12 * scale - packDepth - 0.036);
  group.add(label);

  return group;
}

// === COMPOSANT PRINCIPAL ===
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

  // Calculs
  const backpackSizeReco = stats.torsoLength < 44 ? "S" : stats.torsoLength < 48 ? "M" : "L";
  const maxLoad = (stats.weight * 0.20).toFixed(1);
  const isValid = stats.height >= 140 && stats.height <= 220 &&
                  stats.weight >= 35 && stats.weight <= 150 &&
                  stats.torsoLength >= 35 && stats.torsoLength <= 60;

  return (
    <main className="min-h-screen bg-stone-50 p-6 lg:p-10 ml-64 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-8 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center text-sm">
              {MOCK_USER.username?.[0] || "U"}
            </span>
            Profil Aventurier
          </h1>
          <p className="text-sm text-stone-500 mt-1 ml-11">
            Configure tes mensurations pour un ajustement matériel optimal.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
          <Icons.Star className="w-3 h-3 text-orange-600" />
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Premium</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Carte Mensurations */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Icons.User className="w-4 h-4 text-stone-400" />
                Tes Mensurations
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isEditing 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {isEditing ? "✓ Terminé" : "Modifier"}
              </button>
            </div>

            {/* Genre */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Morphologie
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => isEditing && updateStat("gender", "male")}
                  disabled={!isEditing}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    stats.gender === "male"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  } ${!isEditing && "opacity-60 cursor-not-allowed"}`}
                >
                  Homme
                </button>
                <button
                  onClick={() => isEditing && updateStat("gender", "female")}
                  disabled={!isEditing}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    stats.gender === "female"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  } ${!isEditing && "opacity-60 cursor-not-allowed"}`}
                >
                  Femme
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              
              {/* Taille */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Taille <span className="text-stone-300">(cm)</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={stats.height}
                    onChange={(e) => updateStat("height", parseInt(e.target.value) || 0)}
                    min={140}
                    max={220}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">{stats.height}</div>
                )}
              </div>

              {/* Poids */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Poids <span className="text-stone-300">(kg)</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={stats.weight}
                    onChange={(e) => updateStat("weight", parseInt(e.target.value) || 0)}
                    min={35}
                    max={150}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">{stats.weight}</div>
                )}
              </div>

              {/* Torse */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  Dos (Torse)
                  <span title="De la vertèbre C7 à la crête iliaque" className="cursor-help">
                    <Icons.Info className="w-3 h-3 text-stone-300" />
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={stats.torsoLength}
                    onChange={(e) => updateStat("torsoLength", parseInt(e.target.value) || 0)}
                    min={35}
                    max={60}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">
                    {stats.torsoLength} <span className="text-sm text-stone-400">cm</span>
                  </div>
                )}
              </div>

              {/* Épaules */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Épaules <span className="text-stone-300">(cm)</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={stats.shoulderWidth}
                    onChange={(e) => updateStat("shoulderWidth", parseInt(e.target.value) || 0)}
                    min={35}
                    max={60}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">{stats.shoulderWidth}</div>
                )}
              </div>

              {/* Hanches */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Hanches <span className="text-stone-300">(cm)</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={stats.hipWidth}
                    onChange={(e) => updateStat("hipWidth", parseInt(e.target.value) || 0)}
                    min={25}
                    max={55}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">{stats.hipWidth}</div>
                )}
              </div>

              {/* Gabarit */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Gabarit
                </label>
                {isEditing ? (
                  <select
                    value={stats.apparelSize}
                    onChange={(e) => updateStat("apparelSize", e.target.value as BodyStats["apparelSize"])}
                    className="w-full px-3 py-2 text-xl font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-2xl font-mono font-bold text-stone-900">{stats.apparelSize}</div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs text-orange-800">
                  <strong>💡 Astuce :</strong> Pour mesurer ton torse, localise la vertèbre C7 
                  (la plus proéminente en bas de la nuque) et mesure jusqu&apos;à la crête iliaque (haut du bassin).
                </p>
              </div>
            )}
          </div>

          {/* Recommandations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-stone-900 text-white p-5 rounded-xl border border-stone-800 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Taille Sac Recommandée</p>
                  <p className="text-xs text-stone-500">Torse: {stats.torsoLength}cm</p>
                </div>
                <div className="text-3xl font-black text-orange-500 font-mono">{backpackSizeReco}</div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Charge Max Confort</p>
                  <p className="text-xs text-stone-500">20% du poids</p>
                </div>
                <div className="text-3xl font-black text-green-600 font-mono">
                  {maxLoad} <span className="text-sm text-stone-400 font-normal">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contrôle Sac */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-stone-900">Visualiser un sac à dos</h3>
                <p className="text-xs text-stone-500">Affiche un sac sur le mannequin 3D</p>
              </div>
              <button
                onClick={() => setShowBackpack(!showBackpack)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  showBackpack
                    ? "bg-orange-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {showBackpack ? "Retirer le sac" : "Ajouter un sac"}
              </button>
            </div>
            
            {showBackpack && (
              <div className="pt-4 border-t border-stone-100">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Volume : <span className="text-orange-600">{backpackSize}L</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={backpackSize}
                  onChange={(e) => setBackpackSize(parseInt(e.target.value))}
                  className="w-full accent-orange-600"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>20L Daypack</span>
                  <span>50L Multi-jour</span>
                  <span>80L Expédition</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : 3D */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-6">
            
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Aperçu 3D temps réel
                </span>
              </div>
              <span className="text-[10px] text-stone-400">
                Clic + glisser pour tourner
              </span>
            </div>

            <div className="h-[500px] bg-stone-50">
              {isValid ? (
                <Mannequin3D 
                  stats={stats} 
                  showBackpack={showBackpack}
                  backpackSize={backpackSize}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-stone-600 font-medium">Mensurations invalides</p>
                    <p className="text-sm text-stone-400 mt-1">
                      Vérifie que tes valeurs sont réalistes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-mono font-bold text-stone-900">{stats.height}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Taille</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-stone-900">{stats.torsoLength}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Torse</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-orange-600">{backpackSizeReco}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Taille sac</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-stone-900">{showBackpack ? `${backpackSize}L` : "—"}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Volume</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
