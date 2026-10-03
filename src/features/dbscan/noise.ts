import { NO_CLUSTER_ID } from './types'
import type { CompleteGroupEvent, RunState } from './types'

export function completeGroup(
  state: RunState,
  keepCurrentPoint: boolean,
): CompleteGroupEvent | null {
  const clusterId = state.currentClusterId
  const groupId = state.currentGroupId
  if (clusterId === NO_CLUSTER_ID || groupId === null) {
    return null
  }

  const memberIndices = state.groups[groupId] ?? []
  const isNoise = (state.clusterSizes[clusterId] ?? 0) < state.minPts
  if (isNoise) {
    for (const pointIndex of memberIndices) {
      state.assignments[pointIndex] = { kind: 'noise' }
    }
    state.noiseCount += memberIndices.length
  } else {
    state.clusterCount += 1
  }

  state.currentClusterId = NO_CLUSTER_ID
  state.currentGroupId = null

  return {
    type: 'complete-group',
    clusterId,
    memberIndices: [...memberIndices],
    isNoise,
    keepCurrentPoint,
    clusterCount: state.clusterCount,
    noiseCount: state.noiseCount,
  }
}
