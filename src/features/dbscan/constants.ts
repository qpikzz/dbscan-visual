export const POINT_LIMIT = 1024

export const R_RANGE = {
  min: 0.1,
  max: 20,
  step: 0.1,
} as const

export const MIN_PTS_RANGE = {
  min: 0,
  max: 100,
  step: 1,
} as const

export const ZOOM_RANGE = {
  min: 0.25,
  max: 4,
  step: 0.1,
} as const

export const DEFAULT_PARAMETERS = {
  r: 5,
  minPts: 3,
} as const