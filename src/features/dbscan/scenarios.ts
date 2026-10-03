import { DEFAULT_PARAMETERS } from './constants'
import type { DbscanParams, Point } from './types'
import { PREPARED_SCENARIO_POINTS } from '../../data/preparedScenarios'

export const SCENARIO_IDS = ['circles', 'blobs', 'half-moons', 'create'] as const

export type ScenarioId = (typeof SCENARIO_IDS)[number]

// Scenario names are user-facing text, so they stay in i18n.
// These keys mirror src/i18n/dictionaries.ts; the module keeps no UI dependency.
export type ScenarioLabelKey =
  | 'scenarioCircles'
  | 'scenarioBlobs'
  | 'scenarioHalfMoons'
  | 'scenarioCreate'

export type ScenarioKind = 'prepared' | 'user-drawn'

export type Scenario = {
  id: ScenarioId
  labelKey: ScenarioLabelKey
  kind: ScenarioKind
  points: readonly Point[]
  recommended: DbscanParams
}

const NO_POINTS: readonly Point[] = []

export const DEFAULT_SCENARIO_ID: ScenarioId = 'circles'

export const INITIAL_STEP = 0

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  circles: {
    id: 'circles',
    labelKey: 'scenarioCircles',
    kind: 'prepared',
    points: PREPARED_SCENARIO_POINTS.circles,
    recommended: { r: 2, minPts: 4 },
  },
  blobs: {
    id: 'blobs',
    labelKey: 'scenarioBlobs',
    kind: 'prepared',
    points: PREPARED_SCENARIO_POINTS.blobs,
    recommended: { r: 1.8, minPts: 5 },
  },
  'half-moons': {
    id: 'half-moons',
    labelKey: 'scenarioHalfMoons',
    kind: 'prepared',
    points: PREPARED_SCENARIO_POINTS['half-moons'],
    recommended: { r: 1.5, minPts: 5 },
  },
  create: {
    id: 'create',
    labelKey: 'scenarioCreate',
    kind: 'user-drawn',
    points: NO_POINTS,
    recommended: { ...DEFAULT_PARAMETERS },
  },
}

export type ScenarioSelection = {
  scenarioId: ScenarioId
  points: readonly Point[]
  params: DbscanParams
  step: number
}

// Selecting a scenario replaces the point set with the scenario points, applies the
// scenario R/minPts, and returns the algorithm to step 0, as required by the reset
// rules. Points are copied so the UI never mutates a stored dataset.
export function selectScenario(id: ScenarioId): ScenarioSelection {
  const scenario = SCENARIOS[id]
  return {
    scenarioId: scenario.id,
    points: [...scenario.points],
    params: { ...scenario.recommended },
    step: INITIAL_STEP,
  }
}
