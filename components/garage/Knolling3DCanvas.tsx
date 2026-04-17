"use client";

import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, MapControls, useTexture } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { KnollingLights } from './KnollingLights';
import { GearItem3D } from './GearItem3D';
import { KnollingGearItem } from './KnollingFloor';

interface ItemPosition {
  id: string;
  x: number;
  y: number;
}

interface Knolling3DCanvasProps {
  items: KnollingGearItem[];
  positions: ItemPosition[];
  selectedItem: KnollingGearItem | null;
  onSelectItem: (item: KnollingGearItem | null) => void;
}

const TexturedFloor = () => {
  const texture = useTexture('/images/yeti_background_hd.png');
  
  // Configurer la répétition pour éviter l'effet pixelisé (car on zoome beaucoup)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 30);
  
  return (
    <mesh receiveShadow position={[0, 0, -0.1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

/**
 * Knolling3DCanvas - WebGL Scene for photorealistic gear rendering
 * 
 * Features:
 * - Orthographic camera (flat-lay knolling style)
 * - Dynamic lighting with shadows
 * - Texture-mapped 3D items
 * - Converts 2D pixel positions to 3D world coordinates
 */
export const Knolling3DCanvas: React.FC<Knolling3DCanvasProps> = ({
  items,
  positions,
  selectedItem,
  onSelectItem,
}) => {
  
  /**
   * Convert 2D screen coordinates (pixels) to 3D world coordinates
   * Centers the origin and scales appropriately
   */
  const convert2Dto3D = (x: number, y: number): [number, number, number] => {
    // Assuming a canvas size of ~1000x700 pixels
    // Center the coordinate system
    const centerX = 500;
    const centerY = 350;
    
    // Scale: 100 pixels = 1 Three.js unit
    const scale = 50;
    
    return [
      (x - centerX) / scale,
      -(y - centerY) / scale, // Invert Y (screen Y increases downward, 3D Y increases upward)
      0
    ];
  };

  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        // Cinematic Color Grading
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace
      }}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'transparent'
      }}
      onClick={() => onSelectItem(null)}
    >
      {/* Orthographic Camera - Closer initial zoom */}
      <OrthographicCamera
        makeDefault
        position={[0, 0, 100]}
        zoom={45}
        near={0.1}
        far={1000}
      />

      {/* MapControls - Google Maps-style navigation (Pan + Zoom, no rotation) */}
      <MapControls
        enableRotate={false}
        screenSpacePanning
        minZoom={10}
        maxZoom={100}
        panSpeed={0.8}
        zoomSpeed={1.2}
      />

      {/* Lighting Setup */}
      <KnollingLights />

      {/* BACKGROUND FLOOR - Textured Plane that receives shadows */}
      <Suspense fallback={null}>
        <TexturedFloor />
      </Suspense>

      {/* Render all gear items in 3D */}
      <Suspense fallback={null}>
        {items.filter(item => {
          // Only render items that have valid images (filter out 404s)
          return !item.image.includes('sea_to_summit_almohada');
        }).map((item) => {
          const pos = positions.find((p) => p.id === item.id);
          if (!pos) return null;

          const position3D = convert2Dto3D(pos.x, pos.y);

          return (
            <GearItem3D
              key={item.id}
              item={item}
              position={position3D}
              isSelected={selectedItem?.id === item.id}
              onSelect={() => onSelectItem(item)}
            />
          );
        })}
      </Suspense>

      {/* Ambient fog for depth (optional) */}
      <fog attach="fog" args={['#7a8b7a', 50, 200]} />
    </Canvas>
  );
};
