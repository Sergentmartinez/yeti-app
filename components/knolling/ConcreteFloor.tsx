"use client";

import React, { useMemo } from "react";
import { useTexture, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

export const ConcreteFloor = () => {
  // Chargement des textures PBR 8K
  const [
    colorMap,
    normalMap,
    roughnessMap,
    aoMap,
    displacementMap
  ] = useTexture([
    '/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_BaseColor.jpg',
    '/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Normal.jpg',
    '/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Roughness.jpg',
    '/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_AO.jpg',
    '/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Displacement.jpg',
  ]);

  // Configuration des textures (wrapping et répétition)
  useMemo(() => {
    const textures = [colorMap, normalMap, roughnessMap, aoMap, displacementMap];
    
    textures.forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(16, 16); // Répétition augmentée pour une échelle réaliste du béton (grains fins)
    });
  }, [colorMap, normalMap, roughnessMap, aoMap, displacementMap]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.05, 0]} 
      receiveShadow
    >
      {/* Segments 128x128 nécessaires pour displacement */}
      <planeGeometry args={[50, 50, 128, 128]} />
      
      <MeshReflectorMaterial
        // Textures PBR
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        displacementMap={displacementMap}
        
        // Configuration relief
        normalScale={[1, 1]}
        displacementScale={0.05} // Augmenté pour effet de profondeur visible
        
        // Matériau béton
        roughness={1}
        color="#ffffff" // Blanc pour ne pas assombrir la texture
        envMapIntensity={3} // Augmente la luminosité globale via l'environnement
        metalness={0.5}
        
        // Reflets augmentés
        mixBlur={1}
        mixStrength={20} // Plus de reflets du ciel/lumière ambiante
        resolution={1024}
        mirror={0.5}
        
        // Profondeur reflets
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        blur={[300, 100]}
      />
    </mesh>
  );
};
