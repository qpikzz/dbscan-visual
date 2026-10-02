import {
  createRunState,
  expandMember,
  growCluster,
  pickUnexpandedMember,
  retractRadius,
  startCluster,
} from './cluster'
import type {
  DbscanParams,
  FinalizeEvent,
  Frame,
  FrameEvent,
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
    events,
    assignments: state.assignments.map((assignment) => ({ ...assignment })),
    circle: state.circle,
    currentPointIndex: state.focusIndex,
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
  frames.push(snapshot(state, 5, growCluster(state)))

  frames.push(snapshot(state, 6, toEvents(startCluster(state))))
  frames.push(snapshot(state, 7, toEvents(expandMember(state))))
  frames.push(snapshot(state, 8, growRemainingClusters(state)))
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
  frames.push(snapshot(state, 9, finalEvents))

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
