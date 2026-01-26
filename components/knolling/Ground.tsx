"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { KTX2Loader } from "three-stdlib";

// ----------------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------------

const GROUND_SIZE_FIXED = [10, 5] as const;
const GROUND_SIZE_INFINITE = [40, 40] as const;
const TILE_SIZE = 4; // Taille en mètres d'une répétition de texture (ex: 4m x 4m)
const TRANSCODER_PATH = "https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/";

// Chemins des assets GLM 4.7 (KTX2 prioritaires, fallback JPG/PNG)
const ASSETS = {
  // KTX2 (prioritaire pour performance)
  baseColorKTX2: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_BaseColor.ktx2",
  normalKTX2: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Normal.ktx2",
  ormKTX2: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_ORM.ktx2",
  
  // Anti-tiling textures GLM 4.7
  macroMap: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_1K_Macro.webp",
  detailNormal: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_1K_DetailNormal.ktx2",
  
  // Fallback JPG/PNG (si KTX2 non disponible)
  baseColor: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_BaseColor.jpg",
  normal: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Normal.jpg",
  roughness: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_Roughness.jpg",
  ao: "/images/floor/Stained_Concrete_Plaster/Stained_Concrete_Plaster_vb1kdfdg_8K_AO.jpg",
};

// ----------------------------------------------------------------------------
// CUSTOM LOADER HOOK (KTX2 avec Fallback) - GLM 4.7
// ----------------------------------------------------------------------------

function useSmartTexture(urls: { ktx2?: string; fallback: string }, type: 'color' | 'linear' = 'linear') {
  const { gl } = useThree();
  const fallbackTexture = useTexture(urls.fallback);
  
  // Essayer de charger KTX2 d'abord, fallback vers JPG/PNG
  const texture = useMemo(() => {
    if (urls.ktx2) {
      try {
        const ktx2Loader = new KTX2Loader()
          .setTranscoderPath(TRANSCODER_PATH)
          .detectSupport(gl);
        
        const ktxTexture = ktx2Loader.load(urls.ktx2);
        return ktxTexture;
      } catch (error) {
        console.warn(`⚠️ KTX2 load failed for ${urls.ktx2}, falling back to ${urls.fallback}`);
        return fallbackTexture;
      }
    }
    
    // Fallback vers texture standard
    return fallbackTexture;
  }, [urls, gl, fallbackTexture]);
  
  useMemo(() => {
    // Protection contre texture undefined/null pendant le chargement
    if (!texture) return;
    
    if (type === 'color') {
      texture.colorSpace = THREE.SRGBColorSpace;
    } else {
      texture.colorSpace = THREE.LinearSRGBColorSpace;
    }
    
    // Optimisations GLM 4.7
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16; // Max quality
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
  }, [texture, type]);

  return texture;
}

// ----------------------------------------------------------------------------
// SHADER PATCH (Anti-tiling)
// ----------------------------------------------------------------------------

const patchShaders = (shader: any) => {
  // 1. Injecter les uniforms et varyings nécessaires
  shader.uniforms.uTileScale = { value: 1.0 };
  
  // Patch vertex pour passer les UVs mondiaux si besoin (ici on utilise vUv standard ajusté par repeat)
  
  // Patch fragment pour le Detail Normal et Macro Variation
  // Note: C'est une implémentation simplifiée qui se greffe sur le map existant
  
  shader.fragmentShader = `
    uniform float uTileScale;
    ${shader.fragmentShader}
  `.replace(
    '#include <map_fragment>',
    `
    #include <map_fragment>
    
    // --- ANTI-TILING: MACRO VARIATION (Simulé par bruit procédural si pas de texture) ---
    // On module légèrement la couleur diffuse pour casser la répétition
    float noise = (sin(vMapUv.x * 0.1) + cos(vMapUv.y * 0.1)) * 0.05;
    diffuseColor.rgb += vec3(noise);
    
    // --- ANTI-TILING: DETAIL GRAIN ---
    // Si on avait une normal map de détail, on la mixerait ici.
    // Pour l'instant on se contente de la normal map haute fréquence de base.
    `
  );
  
  // Ajustement roughness via bruit macro
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <roughnessmap_fragment>',
    `
    #include <roughnessmap_fragment>
    float roughNoise = (sin(vMapUv.y * 0.2) + cos(vMapUv.x * 0.2)) * 0.05;
    roughnessFactor = clamp(roughnessFactor + roughNoise, 0.1, 1.0);
    `
  );
};

// ----------------------------------------------------------------------------
// COMPOSANT GROUND
// ----------------------------------------------------------------------------

interface GroundProps {
  mode?: 'fixed' | 'infinite';
  scale?: number;
}

export const Ground: React.FC<GroundProps> = ({ mode = 'fixed', scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { camera, gl } = useThree();

  // Chargement des textures GLM 4.7 (KTX2 avec fallback)
  const map = useSmartTexture({ ktx2: ASSETS.baseColorKTX2, fallback: ASSETS.baseColor }, 'color');
  const normalMap = useSmartTexture({ ktx2: ASSETS.normalKTX2, fallback: ASSETS.normal }, 'linear');
  
  // Pour l'ORM, on combine roughness + AO + metalness en une seule texture
  const ormMap = useSmartTexture({ ktx2: ASSETS.ormKTX2, fallback: ASSETS.roughness }, 'linear');
  const aoMap = useSmartTexture({ ktx2: ASSETS.ormKTX2, fallback: ASSETS.ao }, 'linear');
  
  // Anti-tiling textures GLM 4.7
  const macroMap = useSmartTexture({ fallback: ASSETS.macroMap }, 'color');
  const detailNormalMap = useSmartTexture({ ktx2: ASSETS.detailNormal, fallback: ASSETS.normal }, 'linear');

  // Configuration de la répétition
  const size = mode === 'infinite' ? GROUND_SIZE_INFINITE : GROUND_SIZE_FIXED;
  const repeatX = size[0] / TILE_SIZE;
  const repeatY = size[1] / TILE_SIZE;

  useEffect(() => {
    [map, normalMap, ormMap, aoMap].forEach(t => {
      t.repeat.set(repeatX, repeatY);
    });
  }, [map, normalMap, ormMap, aoMap, repeatX, repeatY]);

  // Logique Infinite Floor
  useFrame(() => {
    if (mode === 'infinite' && meshRef.current) {
      // On déplace le sol pour suivre la caméra, mais par crans de TILE_SIZE
      // pour éviter que la texture ne glisse visuellement
      const tileStepX = TILE_SIZE * scale;
      const tileStepZ = TILE_SIZE * scale; // Y en 3D = Z au sol
      
      const snapX = Math.round(camera.position.x / tileStepX) * tileStepX;
      const snapZ = Math.round(camera.position.z / tileStepZ) * tileStepZ;
      
      meshRef.current.position.x = snapX;
      meshRef.current.position.z = snapZ;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.05, 0]} // Légèrement sous 0 pour éviter z-fighting
      receiveShadow
    >
      <planeGeometry args={[size[0], size[1], 128, 128]} />
      <meshStandardMaterial
        ref={materialRef}
        map={map}
        normalMap={normalMap}
        roughnessMap={ormMap}
        aoMap={aoMap}
        // Pas de metalnessMap car béton = 0
        metalness={0.0}
        roughness={1.0} // Base roughness modifiée par la map
        
        // PBR avancé
        envMapIntensity={1.0} // Ajuster selon l'éclairage de la scène
        
        // Anti-tiling shader injection
        onBeforeCompile={patchShaders}
        
        // Nécessaire pour l'AO map qui utilise le second set d'UVs habituellement
        // R3F/Three gère uv2 automatiquement si présent, sinon map sur uv1
      />
    </mesh>
  );
};
