import type { Point } from './types'

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function areNeighbors(a: Point, b: Point, r: number): boolean {
  return distance(a, b) < r
}
