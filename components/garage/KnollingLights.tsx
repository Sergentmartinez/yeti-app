"use client";

/**
 * KnollingLights - Studio Lighting Setup for Knolling View
 * 
 * Configuration:
 * - Ambient Light: Soft fill light (0.4 intensity)
 * - Directional Light: Main light source from Top-Left-Front
 *   Position: [-10, 10, 10] to match the 45° CSS shadow direction
 *   Creates realistic cast shadows on the floor
 */
export const KnollingLights = () => {
  return (
    <>
      {/* Lumière ambiante - RÉDUITE pour contraste élevé */}
      <ambientLight color="#ffffff" intensity={0.2} />
      
      {/* Lumière directionnelle principale - THE SUN (Dramatic Sunset Angle) */}
      <directionalLight
        position={[-20, 5, 10]}
        intensity={4.5}
        color="#fff0dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
      />
      
      {/* Lumière de remplissage subtile */}
      <hemisphereLight 
        args={['#b3d9ff', '#7a8b7a', 0.15]}
        position={[0, 5, 0]} 
      />
    </>
  );
};
