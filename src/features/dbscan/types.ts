export type Point = {
  x: number
  y: number
}

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

export type MarkNoiseEvent = {
  type: 'mark-noise'
  clusterIds: number[]
  clusterCount: number
  noiseCount: number
}

export type FrameEvent = SelectSeedEvent | SelectNextEvent | ExpandEvent | MarkNoiseEvent

export type Frame = {
  step: number
  events: FrameEvent[]
  assignments: Assignment[]
  circle: RadiusCircle | null
  clusterCount: number
  noiseCount: number
}

export type RunState = {
  points: readonly Point[]
  r: number
  minPts: number
  prng: Prng
  assignments: Assignment[]
  expanded: boolean[]
  clusterSizes: number[]
  currentClusterId: number
  focusIndex: number | null
  circle: RadiusCircle | null
  clusterCount: number
  noiseCount: number
}
