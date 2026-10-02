export type Point = {
  x: number
  y: number
}

export const NO_CLUSTER_ID = -1

export type DbscanParams = {
  r: number
  minPts: number
}

export type Seed = number

export type Prng = () => number

export type Assignment =
  | { kind: 'unassigned' }
  | { kind: 'cluster'; clusterId: number }
  | { kind: 'noise' }

export type RadiusCircle = {
  pointIndex: number
  radius: number
}

export type SelectSeedEvent = {
  type: 'select-seed'
  clusterId: number
  pointIndex: number
}

export type SelectNextEvent = {
  type: 'select-next'
  clusterId: number
  pointIndex: number
}

export type ExpandEvent = {
  type: 'expand'
  clusterId: number
  centerIndex: number
  addedIndices: number[]
}

export type RetractRadiusEvent = {
  type: 'retract-radius'
  pointIndex: number
}

export type CompleteGroupEvent = {
  type: 'complete-group'
  clusterId: number
  memberIndices: number[]
  isNoise: boolean
  keepCurrentPoint: boolean
  clusterCount: number
  noiseCount: number
}

export type FinalizeEvent = {
  type: 'finalize'
  clusterCount: number
  noiseCount: number
}

export type FrameEvent =
  | SelectSeedEvent
  | SelectNextEvent
  | ExpandEvent
  | RetractRadiusEvent
  | CompleteGroupEvent
  | FinalizeEvent

export type Frame = {
  step: number
  events: FrameEvent[]
  assignments: Assignment[]
  circle: RadiusCircle | null
  currentPointIndex: number | null
  clusterCount: number
  noiseCount: number
}

export type RunState = {
  points: readonly Point[]
  neighborsByPoint: number[][]
  r: number
  minPts: number
  prng: Prng
  assignments: Assignment[]
  expanded: boolean[]
  clusterSizes: number[]
  groups: number[][]
  remainingGroupIds: number[]
  currentClusterId: number
  currentGroupId: number | null
  focusIndex: number | null
  circle: RadiusCircle | null
  clusterCount: number
  noiseCount: number
}
