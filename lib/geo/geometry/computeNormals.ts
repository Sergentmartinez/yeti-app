export function computeNormals(
    positions: Float32Array,
    indices: Uint32Array
  ): Float32Array {
    const normals = new Float32Array(positions.length)
  
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3
      const b = indices[i + 1] * 3
      const c = indices[i + 2] * 3
  
      const ax = positions[a], ay = positions[a + 1], az = positions[a + 2]
      const bx = positions[b], by = positions[b + 1], bz = positions[b + 2]
      const cx = positions[c], cy = positions[c + 1], cz = positions[c + 2]
  
      const abx = bx - ax
      const aby = by - ay
      const abz = bz - az
      const acx = cx - ax
      const acy = cy - ay
      const acz = cz - az
  
      const nx = aby * acz - abz * acy
      const ny = abz * acx - abx * acz
      const nz = abx * acy - aby * acx
  
      normals[a] += nx; normals[a + 1] += ny; normals[a + 2] += nz
      normals[b] += nx; normals[b + 1] += ny; normals[b + 2] += nz
      normals[c] += nx; normals[c + 1] += ny; normals[c + 2] += nz
    }
  
    return normals
  }
  