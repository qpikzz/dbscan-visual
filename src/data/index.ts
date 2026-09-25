export const preparedScenarioNames = ['circles', 'blobs', 'half-moons'] as const

export type PreparedScenario = (typeof preparedScenarioNames)[number]

export const scenarioIds = ['circles', 'blobs', 'half-moons', 'create'] as const

export type ScenarioId = (typeof scenarioIds)[number]