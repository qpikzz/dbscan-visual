import type { Point } from '../dbscan/types'

export type ScenarioTransitionRequest = {
  id: number
  fromPoints: readonly Point[]
}

export type ScenarioPointMatch = {
  sourceIndex: number | null
  destinationIndex: number | null
  staggerGroup: number
}

function distanceBetween(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

export function matchScenarioPoints(
  sourcePositions: readonly Point[],
  destinationPositions: readonly Point[],
): ScenarioPointMatch[] {
  if (destinationPositions.length === 0) {
    return sourcePositions.map((_, sourceIndex) => ({
      sourceIndex,
      destinationIndex: null,
      staggerGroup: sourceIndex,
    }))
  }

  if (sourcePositions.length === 0) {
    return destinationPositions.map((_, destinationIndex) => ({
      sourceIndex: null,
      destinationIndex,
      staggerGroup: destinationIndex,
    }))
  }

  if (destinationPositions.length < sourcePositions.length) {
    return sourcePositions.map((source, sourceIndex) => {
      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY
      destinationPositions.forEach((destination, destinationIndex) => {
        const distance = distanceBetween(source, destination)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = destinationIndex
        }
      })
      return {
        sourceIndex,
        destinationIndex: nearestIndex,
        staggerGroup: nearestIndex,
      }
    })
  }

  const sourceUseCounts = sourcePositions.map(() => 0)
  return destinationPositions.map((destination, destinationIndex) => {
    let nearestSourceIndex = -1
    let nearestDistance = Number.POSITIVE_INFINITY
    sourcePositions.forEach((source, sourceIndex) => {
      if ((sourceUseCounts[sourceIndex] ?? 0) >= 3) return
      const distance = distanceBetween(source, destination)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestSourceIndex = sourceIndex
      }
    })
    if (nearestSourceIndex < 0) {
      return {
        sourceIndex: null,
        destinationIndex,
        staggerGroup: destinationIndex,
      }
    }

    sourceUseCounts[nearestSourceIndex] =
      (sourceUseCounts[nearestSourceIndex] ?? 0) + 1
    return {
      sourceIndex: nearestSourceIndex,
      destinationIndex,
      staggerGroup: nearestSourceIndex,
    }
  })
}
