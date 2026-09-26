import type { MarkNoiseEvent, RunState } from './types'

export function findNoiseClusters(state: RunState): number[] {
  const noiseClusterIds: number[] = []
  for (let clusterId = 0; clusterId < state.clusterSizes.length; clusterId += 1) {
    const size = state.clusterSizes[clusterId] ?? 0
    if (size < state.minPts) {
      noiseClusterIds.push(clusterId)
    }
  }
  return noiseClusterIds
}

export function markNoise(state: RunState): MarkNoiseEvent {
  const clusterIds = findNoiseClusters(state)
  const noise = new Set(clusterIds)
  let noiseCount = 0

  for (let i = 0; i < state.assignments.length; i += 1) {
    const assignment = state.assignments[i]
    if (assignment === undefined || assignment.kind !== 'cluster') {
      continue
    }
    if (noise.has(assignment.clusterId)) {
      state.assignments[i] = { kind: 'noise' }
      noiseCount += 1
    }
  }

  state.noiseCount = noiseCount
  state.clusterCount = state.clusterSizes.length - clusterIds.length

  return { type: 'mark-noise', clusterIds, clusterCount: state.clusterCount, noiseCount }
}
