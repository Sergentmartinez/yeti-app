"use client";

import React, { useRef, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader, SRGBColorSpace, LinearSRGBColorSpace, Vector2 } from "three";
import * as THREE from "three";

interface GearObjectProps {
  texturePath: string;
  normalPath: string;
  position: [number, number, number];
  ratio: number;
  scale?: number;
  rotation?: number;
  item?: any;
}

export const GearObject = ({ 
  texturePath, 
  normalPath, 
  position, 
  ratio, 
  scale = 1,
  rotation = 0,
  item
}: GearObjectProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Utiliser les dimensions réelles si disponibles, sinon utiliser le scale standard
  const realScale = item?.realScale || { x: 1, y: 1, z: 1 };
  
  // Chargement des textures avec gestion d'erreur
  const [colorMap, normalMap] = useLoader(
    TextureLoader, 
    [texturePath, normalPath],
    (loader) => {
      // Success callback
    },
    (error) => {
      // Error callback - log mais ne crash pas
      console.warn(`⚠️ Texture loading failed for ${item?.name}:`, error);
    }
  );
  
  // Configuration des textures pour le rendu PBR correct
  useMemo(() => {
    // La couleur doit être en SRGB pour l'affichage écran
    colorMap.colorSpace = SRGBColorSpace;
    // La normale doit être en Linear pour les calculs mathématiques
    normalMap.colorSpace = LinearSRGBColorSpace;
    
    // Anisotropie pour garder la netteté en angle rasant
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;
  }, [colorMap, normalMap]);

  // Micro-animation au survol (optionnel) ou idle
  useFrame((state) => {
    if(mesh.current) {
        // Faire flotter très légèrement pour donner de la vie (optionnel)
        // mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh 
      ref={mesh} 
      position={position} 
      rotation={[-Math.PI / 2, 0, rotation]} // A plat sur le sol
      scale={[realScale.x * ratio, realScale.z, 1]} // Dimensions réelles : largeur (x), hauteur (z), épaisseur (1)
      castShadow
      receiveShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        normalScale={new Vector2(1.5, 1.5)} // Intensité du relief
        transparent={false} // Désactivé pour éviter les bugs de tri et les reflets sur les zones vides
        alphaTest={0.5} // Coupe net les bords transparents (détourage propre)
        roughness={0.4} // Légèrement brillant (plastique/métal)
        metalness={0.1} // Peu métallique par défaut
        side={THREE.DoubleSide}
      />

      {item && (
        <Html position={[0.4, 0.4, 0.05]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="flex flex-col items-end gap-1 pointer-events-none select-none">
            {item.essential && (
              <div className="bg-[#dc2626] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                Essential
              </div>
            )}
            {!item.owned && (
              <div className="bg-amber-500 text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                Wishlist
              </div>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
};
