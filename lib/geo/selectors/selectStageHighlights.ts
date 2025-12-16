import { GPXPoint } from '../gpx/parseGPX'

export function selectStageHighlights(points: GPXPoint[]) {
  let max = points[0]
  let min = points[0]

  for (const p of points) {
    if (p.ele > max.ele) max = p
    if (p.ele < min.ele) min = p
  }

  return {
    highest: max,
    lowest: min,
    hasWater: false,
    hasRefuge: false,
  }
}
