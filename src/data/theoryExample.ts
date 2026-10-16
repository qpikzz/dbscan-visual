import { createRunState } from '../features/dbscan/cluster'
import type { Point } from '../features/dbscan/types'

export type TheoryExamplePoint = Point & { id: string }

export type TheoryExampleGroup = {
  pointIndices: number[]
  clusterNumber: number | null
  noiseNumber: number | null
}

export type TheoryExampleAnalysis = {
  groups: TheoryExampleGroup[]
  groupIndexByPoint: number[]
  neighborsByPoint: number[][]
}

export type TheoryExampleLabelOffset = {
  dx: number
  dy: number
  anchor: 'start' | 'middle' | 'end'
}

export const theoryExampleViewBox = { width: 420, height: 350 }
export const theoryExamplePlot = { left: 40, right: 376, top: 30, bottom: 310 }

export const theoryExampleLabelOffsets: Record<string, TheoryExampleLabelOffset> = {
  A: { dx: -8, dy: -12, anchor: 'end' },
  B: { dx: 0, dy: 32, anchor: 'middle' },
  C: { dx: 0, dy: -12, anchor: 'middle' },
  D: { dx: 8, dy: -12, anchor: 'start' },
  E: { dx: -8, dy: 32, anchor: 'end' },
  F: { dx: 8, dy: 32, anchor: 'start' },
  H: { dx: -9, dy: 32, anchor: 'end' },
  J: { dx: -8, dy: -12, anchor: 'end' },
  K: { dx: 0, dy: 32, anchor: 'middle' },
  L: { dx: 8, dy: -12, anchor: 'start' },
}

export function theoryExamplePosition(point: TheoryExamplePoint) {
  const xScale = (theoryExamplePlot.right - theoryExamplePlot.left) / 12
  const yScale = (theoryExamplePlot.bottom - theoryExamplePlot.top) / 10
  return {
    x: theoryExamplePlot.left + point.x * xScale,
    y: theoryExamplePlot.bottom - point.y * yScale,
  }
}

export function theoryExampleColorClass(
  group: TheoryExampleGroup,
  point?: TheoryExamplePoint,
  pointIndex?: number,
): string {
  if (group.clusterNumber !== null) {
    const index = ((group.clusterNumber - 1) % 6) + 1
    return `theory-example-color--cluster-${index}`
  }
  if (point !== undefined && pointIndex !== undefined) {
    // Match the deterministic noise shade used by CanvasView.
    const noiseIndex =
      Math.abs(
        Math.imul(Math.round(point.x * 1000), 31) ^
          Math.round(point.y * 1000) ^
          pointIndex,
      ) % 5
    return `theory-example-color--noise-${noiseIndex + 1}`
  }
  const index = (((group.noiseNumber ?? 1) - 1) % 5) + 1
  return `theory-example-color--noise-${index}`
}

export const theoryExamplePoints = [
  { id: 'A', x: 1, y: 1 },
  { id: 'B', x: 2, y: 1 },
  { id: 'C', x: 3, y: 2 },
  { id: 'D', x: 4, y: 2 },
  { id: 'E', x: 9, y: 9 },
  { id: 'F', x: 10, y: 9 },
  { id: 'H', x: 6, y: 5 },
  { id: 'J', x: 9, y: 3 },
  { id: 'K', x: 10, y: 3 },
  { id: 'L', x: 10.5, y: 4 },
] as const satisfies readonly TheoryExamplePoint[]

export const theoryExampleRadius = 1.5
export const theoryExampleMinPts = 3

export function analyzeTheoryExample(
  points: readonly TheoryExamplePoint[],
  radius: number,
  minPts: number,
): TheoryExampleAnalysis {
  const state = createRunState(points, { r: radius, minPts }, 0)
  let nextClusterNumber = 0
  let nextNoiseNumber = 0
  const groupIndexByPoint = points.map(() => -1)
  const groups = state.groups.map((pointIndices, groupIndex) => {
    const orderedPointIndices = [...pointIndices].sort((a, b) => a - b)
    const clusterNumber =
      orderedPointIndices.length >= minPts ? ++nextClusterNumber : null
    const noiseNumber = clusterNumber === null ? ++nextNoiseNumber : null
    for (const pointIndex of orderedPointIndices) {
      groupIndexByPoint[pointIndex] = groupIndex
    }
    return { pointIndices: orderedPointIndices, clusterNumber, noiseNumber }
  })

  return {
    groups,
    groupIndexByPoint,
    neighborsByPoint: state.neighborsByPoint,
  }
}
