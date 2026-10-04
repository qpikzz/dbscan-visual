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

export type RunScenario =
  | 'standard'
  | 'no-clusters'
  | 'single-cluster-no-noise'
  | 'single-cluster-with-noise'

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

export type NoiseProbeEvent = {
  type: 'noise-probe'
  centerIndices: number[]
  highlightedIndices: number[]
  showCircle: boolean
  duration: number
}

export type NoiseRecolorEvent = {
  type: 'noise-recolor'
  pointIndices: number[]
}

export type FrameEvent =
  | SelectSeedEvent
  | SelectNextEvent
  | ExpandEvent
  | RetractRadiusEvent
  | CompleteGroupEvent
  | NoiseProbeEvent
  | NoiseRecolorEvent
  | FinalizeEvent

export type Frame = {
  step: number
  scenario: RunScenario
  events: FrameEvent[]
  assignments: Assignment[]
  circle: RadiusCircle | null
  currentPointIndex: number | null
  probeHighlights: number[]
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
  noiseGroupIds: number[]
  remainingGroupIds: number[]
  scenario: RunScenario
  currentClusterId: number
  currentGroupId: number | null
  focusIndex: number | null
  circle: RadiusCircle | null
  probeHighlights: number[]
  clusterCount: number
  noiseCount: number
}
