import * as THREE from "three";
import { GPXPoint } from "../gpx/parseGPX";

export function buildElevationCurtainGeometry(
  points: GPXPoint[],
  lengthScale = 3,
  heightScale = 0.015,
  depth = 4
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const positions: number[] = [];
  const indices: number[] = [];

  let x = 0;

  for (let i = 0; i < points.length; i++) {
    const h = points[i].ele * heightScale;

    positions.push(x, 0, 0);
    positions.push(x, h, 0);
    positions.push(x, 0, depth);
    positions.push(x, h, depth);

    if (i < points.length - 1) {
      const base = i * 4;

      indices.push(
        base,
        base + 4,
        base + 1,
        base + 1,
        base + 4,
        base + 5,

        base + 2,
        base + 3,
        base + 6,
        base + 3,
        base + 7,
        base + 6
      );
    }

    x += lengthScale;
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
