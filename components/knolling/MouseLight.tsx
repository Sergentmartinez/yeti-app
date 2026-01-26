"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export const MouseLight = () => {
  const light = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();

  useFrame(({ mouse }) => {
    if (light.current) {
      // Conversion coordonnées souris (-1 à 1) vers coordonnées monde 3D
      const x = (mouse.x * viewport.width) / 2;
      // Inversion Y car Three.js Y+ est en haut, mais souvent en web Y+ est en bas
      // Ici en vue top-down, Z est la profondeur (hauteur du sol)
      // La souris bouge sur le plan X, Y (si caméra vue de face) ou X, Z (si vue top)
      // Vu que nos objets sont rotatés -PI/2, ils sont sur le plan XZ.
      // Donc on mappe mouse Y vers world Z.
      const z = -(mouse.y * viewport.height) / 2;
      
      // La lumière flotte à 2 unités au dessus du sol
      light.current.position.set(x, 4, z);
    }
  });

  return (
    <pointLight 
      ref={light} 
      intensity={2.5} 
      distance={15} 
      color="#ffffff" 
      decay={2}
    />
  );
};
