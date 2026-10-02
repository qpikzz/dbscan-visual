import { neighborsWithin } from './neighbors'
import { createPrng, pickRandom } from './prng'
import { completeGroup } from './noise'
import { NO_CLUSTER_ID } from './types'
import type {
  Assignment,
  DbscanParams,
  ExpandEvent,
  FrameEvent,
  Point,
  RetractRadiusEvent,
  RunState,
  SelectNextEvent,
  SelectSeedEvent,
  Seed,
} from './types'

const UNASSIGNED: Assignment = { kind: 'unassigned' }

function partitionGroups(neighborsByPoint: readonly number[][]): number[][] {
  const visited = neighborsByPoint.map(() => false)
  const groups: number[][] = []

  for (let pointIndex = 0; pointIndex < neighborsByPoint.length; pointIndex += 1) {
    if (visited[pointIndex] === true) {
      continue
    }

    const group: number[] = []
    const pending = [pointIndex]
    visited[pointIndex] = true

    while (pending.length > 0) {
      const currentIndex = pending.pop()
      if (currentIndex === undefined) {
        continue
      }
      group.push(currentIndex)

      for (const neighborIndex of neighborsByPoint[currentIndex] ?? []) {
        if (visited[neighborIndex] !== true) {
          visited[neighborIndex] = true
          pending.push(neighborIndex)
        }
      }
    }

    groups.push(group)
  }

  return groups
}

export function createRunState(
  points: readonly Point[],
  params: DbscanParams,
  seed: Seed,
): RunState {
  const neighborsByPoint = points.map((_, pointIndex) =>
    neighborsWithin(points, pointIndex, params.r),
  )
  const groups = partitionGroups(neighborsByPoint)
  return {
    points,
    neighborsByPoint,
    r: params.r,
    minPts: params.minPts,
    prng: createPrng(seed),
    assignments: points.map(() => UNASSIGNED),
    expanded: points.map(() => false),
    clusterSizes: [],
    groups,
    remainingGroupIds: groups.map((_, index) => index),
    currentClusterId: NO_CLUSTER_ID,
    currentGroupId: null,
    focusIndex: null,
    circle: null,
    clusterCount: 0,
    noiseCount: 0,
  }
}

export function unexpandedMembers(state: RunState): number[] {
  const clusterId = state.currentClusterId
  if (clusterId === NO_CLUSTER_ID) {
    return []
  }
  const members: number[] = []
  for (let i = 0; i < state.assignments.length; i += 1) {
    const assignment = state.assignments[i]
    if (assignment === undefined || assignment.kind !== 'cluster') {
      continue
    }
    if (assignment.clusterId === clusterId && state.expanded[i] !== true) {
      members.push(i)
    }
  }
  return members
}

function expandableMembers(
  state: RunState,
  candidates = unexpandedMembers(state),
): number[] {
  return candidates.filter((pointIndex) => {
    const hasUnassignedNeighbor = (state.neighborsByPoint[pointIndex] ?? []).some(
      (neighborIndex) => state.assignments[neighborIndex]?.kind === 'unassigned',
    )
    if (!hasUnassignedNeighbor) {
      state.expanded[pointIndex] = true
    }
    return hasUnassignedNeighbor
  })
}

export function startCluster(state: RunState): SelectSeedEvent | null {
  const groupId = pickRandom(state.remainingGroupIds, state.prng)
  if (groupId === undefined) {
    return null
  }
  const groupPosition = state.remainingGroupIds.indexOf(groupId)
  if (groupPosition < 0) {
    return null
  }
  state.remainingGroupIds.splice(groupPosition, 1)
  const pointIndex = pickRandom(state.groups[groupId] ?? [], state.prng)
  if (pointIndex === undefined) {
    return null
  }
  const clusterId = state.clusterSizes.length
  state.clusterSizes.push(1)
  state.assignments[pointIndex] = { kind: 'cluster', clusterId }
  state.currentClusterId = clusterId
  state.currentGroupId = groupId
  state.focusIndex = pointIndex
  state.circle = null
  return { type: 'select-seed', clusterId, pointIndex }
}

export function pickUnexpandedMember(
  state: RunState,
  candidates?: number[],
): SelectNextEvent | null {
  const clusterId = state.currentClusterId
  if (clusterId === NO_CLUSTER_ID) {
    return null
  }
  const eligibleCandidates = candidates ?? expandableMembers(state)
  const pointIndex = pickRandom(eligibleCandidates, state.prng)
  if (pointIndex === undefined) {
    state.focusIndex = null
    return null
  }
  state.focusIndex = pointIndex
  state.circle = { pointIndex, radius: state.r }
  return { type: 'select-next', clusterId, pointIndex }
}

export function expandMember(state: RunState): ExpandEvent | null {
  const clusterId = state.currentClusterId
  const centerIndex = state.focusIndex
  if (clusterId === NO_CLUSTER_ID || centerIndex === null) {
    return null
  }
  if (state.expanded[centerIndex] === true) {
    return null
  }
  state.expanded[centerIndex] = true
  state.circle = { pointIndex: centerIndex, radius: state.r }

  const addedIndices = (state.neighborsByPoint[centerIndex] ?? []).filter(
    (index) => state.assignments[index]?.kind === 'unassigned',
  )
  for (const index of addedIndices) {
    state.assignments[index] = { kind: 'cluster', clusterId }
  }
  state.clusterSizes[clusterId] = (state.clusterSizes[clusterId] ?? 0) + addedIndices.length

  return { type: 'expand', clusterId, centerIndex, addedIndices }
}

export function retractRadius(state: RunState): RetractRadiusEvent | null {
  const pointIndex = state.circle?.pointIndex
  state.circle = null
  return pointIndex === undefined ? null : { type: 'retract-radius', pointIndex }
}

export function growCluster(state: RunState, keepFinalCircle = false): FrameEvent[] {
  const events: FrameEvent[] = []
  for (;;) {
    const candidates = expandableMembers(state)
    if (candidates.length === 0) {
      if (!keepFinalCircle) {
        const retracted = retractRadius(state)
        if (retracted !== null) {
          events.push(retracted)
        }
        state.focusIndex = null
      }
      const completed = completeGroup(state, keepFinalCircle)
      if (completed !== null) {
        events.push(completed)
      }
      break
    }

    const retracted = retractRadius(state)
    if (retracted !== null) {
      events.push(retracted)
    }
    const picked = pickUnexpandedMember(state, candidates)
    if (picked === null) {
      throw new Error('Expected an unexpanded member after checking the group')
    }
    events.push(picked)
    const expanded = expandMember(state)
    if (expanded !== null) {
      events.push(expanded)
    }
  }
  return events
}
