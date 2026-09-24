export const preparedScenarioNames = ['circles', 'blobs', 'half-moons'] as const

export type PreparedScenario = (typeof preparedScenarioNames)[number]