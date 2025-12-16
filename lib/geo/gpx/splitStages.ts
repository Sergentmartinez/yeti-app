import { GPXPoint } from './parseGPX'

export function splitStages(
  points: GPXPoint[],
  maxKm = 14
): GPXPoint[][] {
  const stages: GPXPoint[][] = []
  let current: GPXPoint[] = []
  let distance = 0

  const R = 6371e3

  const dist = (a: GPXPoint, b: GPXPoint) => {
    const φ1 = a.lat * Math.PI / 180
    const φ2 = b.lat * Math.PI / 180
    const Δφ = (b.lat - a.lat) * Math.PI / 180
    const Δλ = (b.lon - a.lon) * Math.PI / 180

    const x =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2

    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  }

  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      distance += dist(points[i - 1], points[i])
    }

    current.push(points[i])

    if (distance / 1000 >= maxKm) {
      stages.push(current)
      current = []
      distance = 0
    }
  }

  if (current.length) stages.push(current)
  return stages
}
