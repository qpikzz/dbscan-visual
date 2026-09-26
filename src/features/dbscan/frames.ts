import {
  createRunState,
  expandMember,
  growCluster,
  pickUnexpandedMember,
  startCluster,
} from './cluster'
import { markNoise } from './noise'
import type { DbscanParams, Frame, FrameEvent, Point, RunState, Seed } from './types'

function toEvents(event: FrameEvent | null): FrameEvent[] {
  return event === null ? [] : [event]
}

function snapshot(state: RunState, step: number, events: FrameEvent[]): Frame {
  return {
    step,
    events,
    assignments: state.assignments.map((assignment) => ({ ...assignment })),
    circle: state.circle,
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
  frames.push(snapshot(state, 3, toEvents(pickUnexpandedMember(state))))
  frames.push(snapshot(state, 4, toEvents(expandMember(state))))
  frames.push(snapshot(state, 5, growCluster(state)))

  frames.push(snapshot(state, 6, toEvents(startCluster(state))))
  frames.push(snapshot(state, 7, toEvents(expandMember(state))))
  frames.push(snapshot(state, 8, growRemainingClusters(state)))
  frames.push(snapshot(state, 9, [markNoise(state)]))

  return frames
}

function growRemainingClusters(state: RunState): FrameEvent[] {
  const events: FrameEvent[] = []
  for (;;) {
    events.push(...growCluster(state))
    const seeded = startCluster(state)
    if (seeded === null) {
      break
    }
    events.push(seeded)
    events.push(...toEvents(expandMember(state)))
  }
  return events
}
