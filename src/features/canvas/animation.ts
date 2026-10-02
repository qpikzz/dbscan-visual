import type { Frame, FrameEvent } from '../dbscan/types'

export const SELECTION_DURATION = 600
export const RADIUS_GROW_DURATION = 600
export const RADIUS_RETRACT_DURATION = 300
export const CAPTURE_FADE_DURATION = 200
export const NOISE_FADE_DURATION = 200
export const BASE_CAPTURE_INTERVAL = 120
export const MIN_CAPTURE_INTERVAL = 20
export const EXPONENTIAL_DECAY_FACTOR = 0.97
export const PULSE_CYCLE_DURATION = 900
export const MIN_STEP_DURATION = 300
export const MAX_STEP_ANIMATION_DURATION = 30_000
export const EXPONENTIAL_ACCELERATION_THRESHOLD = 5_000

export type FrameAnimationPlan = {
  captureIntervalsByEvent: readonly (readonly number[])[]
  captureFadeDurationsByEvent: readonly (readonly number[])[]
  selectionDurationsByEvent: readonly number[]
  radiusDurationsByEvent: readonly number[]
}

function countCaptures(events: readonly FrameEvent[]): number {
  let total = 0
  for (const event of events) {
    if (event.type === 'expand') {
      total += event.addedIndices.length
    }
  }
  return total
}

function getLinearInterval(captureIndex: number, totalCaptures: number): number {
  const progress = totalCaptures <= 1 ? 1 : captureIndex / (totalCaptures - 1)
  return BASE_CAPTURE_INTERVAL -
    (BASE_CAPTURE_INTERVAL - MIN_CAPTURE_INTERVAL) * Math.min(progress, 1)
}

function hasStepThreeCircle(frame: Frame, previousFrame: Frame | undefined, event: FrameEvent): boolean {
  return frame.step === 4 &&
    event.type === 'expand' &&
    previousFrame?.circle?.pointIndex === event.centerIndex &&
    previousFrame.circle.radius > 0
}

export function createFrameAnimationPlans(frames: readonly Frame[]): FrameAnimationPlan[] {
  const plans: FrameAnimationPlan[] = []

  frames.forEach((frame, frameIndex) => {
    const previousFrame = frames[frameIndex - 1]
    const totalCaptures = countCaptures(frame.events)
    let frameDuration = 0
    let captureIndex = 0
    let exponentialCaptureIndex = 0
    let radiusExponentialIndex = 0
    let isExponential = false
    let exponentialBaseInterval = BASE_CAPTURE_INTERVAL
    const beginExponentialMode = () => {
      exponentialBaseInterval = getLinearInterval(
        Math.max(captureIndex - 1, 0),
        totalCaptures,
      )
      isExponential = true
    }
    const getRadiusDuration = (baseDuration: number) => {
      if (!isExponential && frameDuration >= EXPONENTIAL_ACCELERATION_THRESHOLD) {
        beginExponentialMode()
      }
      if (!isExponential) {
        return baseDuration
      }
      radiusExponentialIndex += 1
      return baseDuration * EXPONENTIAL_DECAY_FACTOR ** radiusExponentialIndex
    }
    const captureFadeDurationsByEvent: number[][] = []
    const selectionDurationsByEvent: number[] = []
    const radiusDurationsByEvent: number[] = []
    const captureIntervalsByEvent = frame.events.map((event) => {
      const intervals: number[] = []
      const captureFadeDurations: number[] = []
      let radiusDuration = 0
      if (event.type === 'select-seed' || event.type === 'select-next') {
        const keepsSelectionRing = event.type === 'select-seed' &&
          (frame.step === 1 || frame.step === 6)
        const selectionDuration = isExponential && !keepsSelectionRing
          ? 0
          : SELECTION_DURATION
        frameDuration += selectionDuration
        selectionDurationsByEvent.push(selectionDuration)
        if (frame.step === 3 && event.type === 'select-next') {
          radiusDuration = getRadiusDuration(RADIUS_GROW_DURATION)
          frameDuration += radiusDuration
        }
      } else if (event.type === 'expand') {
        selectionDurationsByEvent.push(0)
        if (!hasStepThreeCircle(frame, previousFrame, event)) {
          radiusDuration = getRadiusDuration(RADIUS_GROW_DURATION)
          frameDuration += radiusDuration
        }

        let lastCaptureFadeEnd = frameDuration
        event.addedIndices.forEach((_, pointIndex) => {
          if (!isExponential && frameDuration >= EXPONENTIAL_ACCELERATION_THRESHOLD) {
            beginExponentialMode()
          }
          if (isExponential) {
            const decay = EXPONENTIAL_DECAY_FACTOR ** exponentialCaptureIndex
            intervals.push(pointIndex === 0 ? 0 : exponentialBaseInterval * decay)
            captureFadeDurations.push(CAPTURE_FADE_DURATION * decay)
            exponentialCaptureIndex += 1
          } else if (pointIndex === 0) {
            intervals.push(0)
            captureFadeDurations.push(CAPTURE_FADE_DURATION)
          } else {
            const interval = getLinearInterval(captureIndex - 1, totalCaptures)
            intervals.push(interval)
            frameDuration += interval
            captureFadeDurations.push(CAPTURE_FADE_DURATION)
          }
          if (!isExponential) {
            lastCaptureFadeEnd = frameDuration + CAPTURE_FADE_DURATION
          } else {
            lastCaptureFadeEnd = Math.max(
              lastCaptureFadeEnd,
              frameDuration + (captureFadeDurations.at(-1) ?? 0),
            )
          }
          captureIndex += 1
        })

        if (lastCaptureFadeEnd > frameDuration) {
          frameDuration = lastCaptureFadeEnd
        }
      } else if (event.type === 'retract-radius') {
        selectionDurationsByEvent.push(0)
        radiusDuration = getRadiusDuration(RADIUS_RETRACT_DURATION)
        frameDuration += radiusDuration
      } else if (event.type === 'complete-group' && event.isNoise) {
        selectionDurationsByEvent.push(0)
        frameDuration += NOISE_FADE_DURATION
      } else {
        selectionDurationsByEvent.push(0)
      }
      radiusDurationsByEvent.push(radiusDuration)
      captureFadeDurationsByEvent.push(captureFadeDurations)
      return intervals
    })

    plans.push({
      captureIntervalsByEvent,
      captureFadeDurationsByEvent,
      selectionDurationsByEvent,
      radiusDurationsByEvent,
    })
  })

  return plans
}
