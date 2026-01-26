"use client";

import { useRef, useEffect } from "react";
import { useSpring, animated, config } from "@react-spring/three";
import { Group } from "three";

interface AnimatedGearGroupProps {
  targetPosition: [number, number, number];
  targetRotation: number;
  children: React.ReactNode;
  onAnimationEnd?: () => void;
}

export const AnimatedGearGroup: React.FC<AnimatedGearGroupProps> = ({
  targetPosition,
  targetRotation,
  children,
  onAnimationEnd
}) => {
  const groupRef = useRef<Group>(null);
  
  // Animation fluide avec spring physics
  const { position, rotation } = useSpring({
    position: targetPosition,
    rotation: [0, targetRotation, 0] as [number, number, number],
    config: { ...config.gentle, tension: 120, friction: 26 },
    onRest: onAnimationEnd
  });

  return (
    <animated.group
      ref={groupRef}
      // @ts-ignore - react-spring types
      position={position}
      // @ts-ignore - react-spring types  
      rotation={rotation}
    >
      {children}
    </animated.group>
  );
};