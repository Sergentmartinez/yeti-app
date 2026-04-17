"use client";

import { useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { KnollingGearItem } from './KnollingFloor';

interface GearItem3DProps {
  item: KnollingGearItem;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * GearItem3D - Renders a single gear item in 3D with texture maps
 * 
 * Features:
 * - Color map (base texture)
 * - Normal map (surface detail & lighting)
 * - Displacement map (depth/volume from AI)
 * - Dynamic displacement scale based on item size
 * - Click interaction
 */
export const GearItem3D: React.FC<GearItem3DProps> = ({
  item,
  position,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate displacement scale based on physical size
  const realSizeCm = (item.realSize || item.scale || 0.5) * 100;
  const displacementScale = realSizeCm <= 10 ? 0.02 : realSizeCm <= 50 ? 0.1 : 0.25;
  
  // Calculate plane dimensions (in Three.js units)
  const width = realSizeCm / 100 * 2; // Scale to reasonable size
  const height = width; // Square for now, we'll adjust with aspect ratio if needed

  // Load textures - gracefully handle missing maps
  const imageName = item.image.split('/').pop() || '';
  
  // Only load color map for now (depth/normal maps may not exist yet)
  const colorMap = useTexture(item.image);
  
  // Configure texture settings
  colorMap.wrapS = colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.magFilter = THREE.LinearFilter;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[width, height, 64, 64]} />
      
      <meshStandardMaterial
        map={colorMap}
        transparent={true}
        alphaTest={0.1}
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.1}
        envMapIntensity={1.2}
        // Highlight when selected or hovered
        emissive={isSelected ? '#dc2626' : hovered ? '#ffffff' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
      />
      
      {/* Selection ring */}
      {isSelected && (
        <lineLoop position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width * 1.1, height * 1.1)]} />
          <lineBasicMaterial color="#dc2626" linewidth={2} />
        </lineLoop>
      )}
    </mesh>
  );
};
