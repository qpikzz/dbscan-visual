import { neighborsWithin } from './neighbors'
import { createPrng, pickRandom } from './prng'
import type {
  Assignment,
  DbscanParams,
  ExpandEvent,
  FrameEvent,
  Point,
  RunState,
  SelectNextEvent,
  SelectSeedEvent,
  Seed,
} from './types'

const NO_CLUSTER = -1

const UNASSIGNED: Assignment = { kind: 'unassigned' }

export function createRunState(
  points: readonly Point[],
  params: DbscanParams,
  seed: Seed,
): RunState {
  return {
    points,
    r: params.r,
    minPts: params.minPts,
    prng: createPrng(seed),
    assignments: points.map(() => UNASSIGNED),
    expanded: points.map(() => false),
    clusterSizes: [],
    currentClusterId: NO_CLUSTER,
    focusIndex: null,
    circle: null,
    clusterCount: 0,
    noiseCount: 0,
  }
}

export function unassignedIndices(state: RunState): number[] {
  const result: number[] = []
  for (let i = 0; i < state.assignments.length; i += 1) {
    if (state.assignments[i]?.kind === 'unassigned') {
      result.push(i)
    }
  }
  return result
}

export function unexpandedMembers(state: RunState): number[] {
  const clusterId = state.currentClusterId
  if (clusterId === NO_CLUSTER) {
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

export function startCluster(state: RunState): SelectSeedEvent | null {
  const pointIndex = pickRandom(unassignedIndices(state), state.prng)
  if (pointIndex === undefined) {
    return null
  }
  const clusterId = state.clusterSizes.length
  state.clusterSizes.push(1)
  state.assignments[pointIndex] = { kind: 'cluster', clusterId }
  state.currentClusterId = clusterId
  state.focusIndex = pointIndex
  state.circle = null
  state.clusterCount += 1
  return { type: 'select-seed', clusterId, pointIndex }
}

export function pickUnexpandedMember(state: RunState): SelectNextEvent | null {
  const clusterId = state.currentClusterId
  if (clusterId === NO_CLUSTER) {
    return null
  }
  const pointIndex = pickRandom(unexpandedMembers(state), state.prng)
  if (pointIndex === undefined) {
    return null
  }
  state.focusIndex = pointIndex
  state.circle = { pointIndex, radius: state.r }
  return { type: 'select-next', clusterId, pointIndex }
}

export function expandMember(state: RunState): ExpandEvent | null {
  const clusterId = state.currentClusterId
  const centerIndex = state.focusIndex
  if (clusterId === NO_CLUSTER || centerIndex === null) {
    return null
  }
  if (state.expanded[centerIndex] === true) {
    return null
  }
  state.expanded[centerIndex] = true
  state.circle = { pointIndex: centerIndex, radius: state.r }

  const addedIndices = neighborsWithin(state.points, centerIndex, state.r).filter(
    (index) => state.assignments[index]?.kind === 'unassigned',
  )
  for (const index of addedIndices) {
    state.assignments[index] = { kind: 'cluster', clusterId }
  }
  state.clusterSizes[clusterId] = (state.clusterSizes[clusterId] ?? 0) + addedIndices.length

  return { type: 'expand', clusterId, centerIndex, addedIndices }
}

export function growCluster(state: RunState): FrameEvent[] {
  const events: FrameEvent[] = []
  for (;;) {
    const picked = pickUnexpandedMember(state)
    if (picked === null) {
      break
    }
    events.push(picked)
    const expanded = expandMember(state)
    if (expanded !== null) {
      events.push(expanded)
    }
  }
  return events
}
