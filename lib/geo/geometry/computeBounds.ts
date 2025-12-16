export function computeBounds(positions: Float32Array) {
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  
    for (let i = 0; i < positions.length; i += 3) {
      minX = Math.min(minX, positions[i])
      minY = Math.min(minY, positions[i + 1])
      minZ = Math.min(minZ, positions[i + 2])
      maxX = Math.max(maxX, positions[i])
      maxY = Math.max(maxY, positions[i + 1])
      maxZ = Math.max(maxZ, positions[i + 2])
    }
  
    return { minX, minY, minZ, maxX, maxY, maxZ }
  }
  