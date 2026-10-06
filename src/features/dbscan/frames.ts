import {
  createRunState,
  expandMember,
  growCluster,
  pickUnexpandedMember,
  retractRadius,
  startCluster,
} from './cluster'
import { pickRandom } from './prng'
import { NO_CLUSTER_ID } from './types'
import type {
  DbscanParams,
  FinalizeEvent,
  Frame,
  FrameEvent,
  NoiseProbeEvent,
  NoiseRecolorEvent,
  Point,
  RunState,
  Seed,
} from './types'

function toEvents(event: FrameEvent | null): FrameEvent[] {
  return event === null ? [] : [event]
}

function snapshot(state: RunState, step: number, events: FrameEvent[]): Frame {
  return {
    step,
    scenario: state.scenario,
    events,
    assignments: state.assignments.map((assignment) => ({ ...assignment })),
    circle: state.circle,
    currentPointIndex: state.focusIndex,
    probeHighlights: [...state.probeHighlights],
    clusterCount: state.clusterCount,
    noiseCount: state.noiseCount,
  }
}

export function runDbscan(
  points: readonly Point[],
  params: DbscanParams,
  seed: Seed,
): Frame[] {
  const state = createRunState(points, params, seed)
  if (state.scenario === 'no-clusters') {
    return createNoClusterFrames(state)
  }

  const frames: Frame[] = []

  frames.push(snapshot(state, 0, []))

  frames.push(snapshot(state, 1, toEvents(startCluster(state))))
  frames.push(snapshot(state, 2, toEvents(expandMember(state))))
  const stepThreeEvents: FrameEvent[] = []
  const retracted = retractRadius(state)
  if (retracted !== null) {
    stepThreeEvents.push(retracted)
  }
  stepThreeEvents.push(...toEvents(pickUnexpandedMember(state)))
  frames.push(snapshot(state, 3, stepThreeEvents))
  frames.push(snapshot(state, 4, toEvents(expandMember(state))))
  const stepFiveEvents = growCluster(state)
  stepFiveEvents.push(...markNoiseGroups(state))
  frames.push(snapshot(state, 5, stepFiveEvents))

  if (
    state.scenario === 'single-cluster-no-noise' ||
    state.scenario === 'single-cluster-with-noise'
  ) {
    appendFinalFrame(state, frames, 6)
    return frames
  }

  frames.push(snapshot(state, 6, toEvents(startCluster(state))))
  frames.push(snapshot(state, 7, toEvents(expandMember(state))))
  frames.push(snapshot(state, 8, growRemainingClusters(state)))
  appendFinalFrame(state, frames, 9)

  return frames
}

function appendFinalFrame(state: RunState, frames: Frame[], step: number): void {
  const finalEvents: FrameEvent[] = []
  const finalRetraction = retractRadius(state)
  if (finalRetraction !== null) {
    finalEvents.push(finalRetraction)
  }
  state.focusIndex = null
  const finalized: FinalizeEvent = {
    type: 'finalize',
    clusterCount: state.clusterCount,
    noiseCount: state.noiseCount,
  }
  finalEvents.push(finalized)
  frames.push(snapshot(state, step, finalEvents))
}

function markNoiseGroups(state: RunState): FrameEvent[] {
  const events: FrameEvent[] = []
  for (const groupId of state.noiseGroupIds) {
    const memberIndices = state.groups[groupId] ?? []
    for (const pointIndex of memberIndices) {
      state.assignments[pointIndex] = { kind: 'noise' }
    }
    state.noiseCount += memberIndices.length
    events.push({
      type: 'complete-group',
      clusterId: NO_CLUSTER_ID,
      memberIndices: [...memberIndices],
      isNoise: true,
      keepCurrentPoint: true,
      clusterCount: state.clusterCount,
      noiseCount: state.noiseCount,
    })
  }
  return events
}

function createNoClusterFrames(state: RunState): Frame[] {
  const frames = [snapshot(state, 0, [])]
  const pointIndices = state.points.map((_, index) => index)
  const picked: number[] = []
  const pickProbePoint = (): number | undefined => {
    const candidates = pointIndices.filter((index) => !picked.includes(index))
    const pointIndex = pickRandom(candidates.length > 0 ? candidates : pointIndices, state.prng)
    if (pointIndex !== undefined) {
      picked.push(pointIndex)
    }
    return pointIndex
  }
  const probe = (
    centerIndices: number[],
    highlightedIndices: number[],
    showCircle: boolean,
    duration: number,
  ): NoiseProbeEvent => ({
    type: 'noise-probe',
    centerIndices,
    highlightedIndices,
    showCircle,
    duration,
  })

  const firstPoint = pickProbePoint()
  state.probeHighlights = firstPoint === undefined ? [] : [firstPoint]
  frames.push(snapshot(
    state,
    1,
    firstPoint === undefined ? [] : [probe([firstPoint], [firstPoint], false, 600)],
  ))

  const firstNeighbors = firstPoint === undefined
    ? []
    : state.neighborsByPoint[firstPoint] ?? []
  state.probeHighlights = []
  state.circle = firstPoint === undefined ? null : { pointIndex: firstPoint, radius: state.r }
  frames.push(snapshot(
    state,
    2,
    firstPoint === undefined
      ? []
      : [probe([firstPoint], firstNeighbors, true, 900)],
  ))

  const secondPoint = pickProbePoint()
  state.probeHighlights = secondPoint === undefined ? [] : [secondPoint]
  state.circle = secondPoint === undefined ? state.circle : { pointIndex: secondPoint, radius: state.r }
  frames.push(snapshot(
    state,
    3,
    secondPoint === undefined ? [] : [probe([secondPoint], [secondPoint], true, 600)],
  ))

  const secondNeighbors = secondPoint === undefined
    ? []
    : state.neighborsByPoint[secondPoint] ?? []
  state.probeHighlights = []
  frames.push(snapshot(
    state,
    4,
    secondPoint === undefined
      ? []
      : [probe([secondPoint], secondNeighbors, true, 900)],
  ))

  const thirdPoint = pickProbePoint()
  const thirdNeighbors = thirdPoint === undefined
    ? []
    : state.neighborsByPoint[thirdPoint] ?? []
  state.probeHighlights = thirdPoint === undefined ? [] : [thirdPoint]
  state.circle = thirdPoint === undefined ? state.circle : { pointIndex: thirdPoint, radius: state.r }
  frames.push(snapshot(
    state,
    5,
    thirdPoint === undefined
      ? []
      : [probe([thirdPoint], thirdNeighbors, true, 700)],
  ))

  const remainingIndices = pointIndices.filter((index) => !picked.includes(index))
  const sweepDuration = Math.min(remainingIndices.length * 80, 8_000)
  state.probeHighlights = []
  const stepSixEvents = remainingIndices.length === 0
    ? []
    : [probe(remainingIndices, [], true, sweepDuration)]
  const lastRemainingPoint = remainingIndices.at(-1)
  state.circle = lastRemainingPoint === undefined
    ? state.circle
    : { pointIndex: lastRemainingPoint, radius: state.r }
  frames.push(snapshot(state, 6, stepSixEvents))

  state.circle = null
  frames.push(snapshot(state, 7, [
    probe([], [], false, 300),
  ]))

  const fastSweepDuration = Math.min(pointIndices.length * 25, 4_000)
  const stepEightEvents = pointIndices.length === 0
    ? []
    : [probe(pointIndices, [], true, fastSweepDuration)]
  const lastPoint = pointIndices.at(-1)
  state.circle = lastPoint === undefined ? null : { pointIndex: lastPoint, radius: state.r }
  frames.push(snapshot(state, 8, stepEightEvents))

  state.assignments = pointIndices.map(() => ({ kind: 'noise' }))
  state.noiseCount = pointIndices.length
  state.circle = null
  const recolor: NoiseRecolorEvent = {
    type: 'noise-recolor',
    pointIndices,
  }
  const finalized: FinalizeEvent = {
    type: 'finalize',
    clusterCount: 0,
    noiseCount: state.noiseCount,
  }
  frames.push(snapshot(state, 9, [recolor, finalized]))
  return frames
}

function growRemainingClusters(state: RunState): FrameEvent[] {
  const events: FrameEvent[] = []
  while (state.currentGroupId !== null) {
    const keepFinalCircle = state.remainingGroupIds.length === 0
    events.push(...growCluster(state, keepFinalCircle))
    if (keepFinalCircle) {
      break
    }

    const seeded = startCluster(state)
    if (seeded === null) {
      break
    }
    events.push(seeded)
    events.push(...toEvents(expandMember(state)))
  }
  return events
}
