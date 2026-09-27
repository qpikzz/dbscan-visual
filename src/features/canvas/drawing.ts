import type { Point } from '../dbscan/types'

export type PathSamples = {
  points: Point[]
  remainder: number
}

export function samplePathSegment(
  start: Point,
  end: Point,
  spacing: number,
  remainder: number,
): PathSamples {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.hypot(dx, dy)
  if (distance === 0) {
    return { points: [], remainder }
  }

  const points: Point[] = []
  for (let offset = spacing - remainder; offset <= distance; offset += spacing) {
    const progress = offset / distance
    points.push({ x: start.x + dx * progress, y: start.y + dy * progress })
  }

  return { points, remainder: (remainder + distance) % spacing }
}