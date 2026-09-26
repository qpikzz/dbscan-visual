import { areNeighbors } from './distance'
import type { Point } from './types'

export function neighborsWithin(
  points: readonly Point[],
  pointIndex: number,
  r: number,
): number[] {
  const center = points[pointIndex]
  if (center === undefined) {
    return []
  }
  const result: number[] = []
  for (let i = 0; i < points.length; i += 1) {
    if (i === pointIndex) {
      continue
    }
    const candidate = points[i]
    if (candidate !== undefined && areNeighbors(center, candidate, r)) {
      result.push(i)
    }
  }
  return result
}
