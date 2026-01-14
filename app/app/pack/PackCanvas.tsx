// app/app/pack/PackCanvas.tsx
// Composant 3D avec React Three Fiber pour le Pack Builder

"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface PackCanvasProps {
    modelUrl: string;
    rotation: number;
}

// === BACKPACK MODEL COMPONENT ===

function BackpackModel({ url, externalRotation }: { url: string; externalRotation: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(url);

    // Apply external rotation
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = externalRotation;
        }
    }, [externalRotation]);

    // Gentle floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <primitive
                    object={scene.clone()}
                    scale={8}
                />
            </Center>
        </group>
    );
}

// === FALLBACK BOX ===

function FallbackBox() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 3, 1]} />
            <meshStandardMaterial color="#f97316" />
        </mesh>
    );
}

// === LOADING SPINNER ===

function LoadingSpinner() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z = state.clock.elapsedTime * 2;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI * 1.5]} />
            <meshStandardMaterial color="#f97316" />
        </mesh>
    );
}

// === SCENE SETUP ===

function Scene({ modelUrl, rotation }: { modelUrl: string; rotation: number }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <directionalLight
                position={[10, 12, 8]}
                intensity={0.9}
                castShadow
            />
            <directionalLight
                position={[-10, 5, -8]}
                intensity={0.4}
            />

            {/* Environment for reflections */}
            <Environment preset="city" />

            {/* Model */}
            <Suspense fallback={<LoadingSpinner />}>
                <BackpackModel url={modelUrl} externalRotation={rotation} />
            </Suspense>

            {/* Ground shadow */}
            <ContactShadows
                position={[0, -2, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
            />

            {/* Controls */}
            <OrbitControls
                enablePan={false}
                minDistance={5}
                maxDistance={20}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
            />
        </>
    );
}

// === MAIN CANVAS COMPONENT ===

export default function PackCanvas({ modelUrl, rotation }: PackCanvasProps) {
    return (
        <Canvas
            camera={{
                position: [0, 2, 12],
                fov: 50,
                near: 0.1,
                far: 1000
            }}
            gl={{
                antialias: true,
                powerPreference: "high-performance"
            }}
            style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '24px'
            }}
        >
            <Scene modelUrl={modelUrl} rotation={rotation} />
        </Canvas>
    );
}
