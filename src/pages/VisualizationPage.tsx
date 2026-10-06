import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ScenarioId } from '../data'
import { VisualizationBlock } from '../components/VisualizationBlock'
import { CodeBlock } from '../components/CodeBlock'
import { ScenarioCards } from '../components/ScenarioCards'
import { Reveal } from '../components/Reveal'
import { POINT_LIMIT } from '../features/dbscan/constants'
import { createSeed, runDbscan } from '../features/dbscan'
import { SCENARIOS } from '../features/dbscan/scenarios'
import { createFrameAnimationPlans } from '../features/canvas/animation'
import type { ScenarioTransitionRequest } from '../features/canvas/scenarioTransition'
import type { Assignment, Frame, FrameEvent, Point } from '../features/dbscan/types'
import { useMotionSettings } from '../hooks/useMotionSettings'
import '../styles/visualization.css'

function scrollToCanvasPanel(
  panel: HTMLElement,
  reducedMotion: boolean,
): Promise<void> {
  const scrollMarginTop = Number.parseFloat(getComputedStyle(panel).scrollMarginTop) || 0
  if (Math.abs(panel.getBoundingClientRect().top - scrollMarginTop) < 1) {
    return Promise.resolve()
  }

  if (reducedMotion) {
    panel.scrollIntoView({ behavior: 'instant', block: 'start' })
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let settled = false
    let settleTimer: number | null = null
    let fallbackTimer: number | null = null
    let animationFrame: number | null = null
    let lastTop = panel.getBoundingClientRect().top
    let stableFrames = 0

    const finish = () => {
      if (settled) return
      settled = true
      if (settleTimer !== null) window.clearTimeout(settleTimer)
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scrollend', finish)
      resolve()
    }

    const onScroll = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(finish, 100)
    }

    const waitUntilStable = () => {
      const top = panel.getBoundingClientRect().top
      stableFrames = Math.abs(top - lastTop) < 0.5 ? stableFrames + 1 : 0
      lastTop = top
      if (stableFrames >= 5) {
        finish()
      } else {
        animationFrame = window.requestAnimationFrame(waitUntilStable)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scrollend', finish, { once: true })
    fallbackTimer = window.setTimeout(finish, 2500)
    animationFrame = window.requestAnimationFrame(waitUntilStable)
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

export function VisualizationPage() {
  const [scenario, setScenario] = useState<ScenarioId>('circles')
  const [r, setR] = useState<number>(SCENARIOS.circles.recommended.r)
  const [minPts, setMinPts] = useState<number>(SCENARIOS.circles.recommended.minPts)
  const [createPoints, setCreatePoints] = useState<Point[]>([])
  const [frames, setFrames] = useState<Frame[] | null>(null)
  const [steps, setSteps] = useState<number[]>([0])
  const [activeStep, setActiveStep] = useState(0)
  const [scenarioTransition, setScenarioTransition] =
    useState<ScenarioTransitionRequest | null>(null)
  const canvasPanelRef = useRef<HTMLElement | null>(null)
  const scenarioTransitionIdRef = useRef(0)
  const scenarioSelectionRequestRef = useRef(0)
  const { reduced } = useMotionSettings()
  const points = scenario === 'create' ? createPoints : SCENARIOS[scenario].points
  const frame = frames?.[activeStep]
  const finalStepIndex = frames === null ? null : frames.length - 1
  const assignments: readonly Assignment[] = frame?.assignments ?? []
  const events: readonly FrameEvent[] = frame?.events ?? []
  const currentPointIndex = frame?.currentPointIndex ?? null
  const animationPlans = useMemo(
    () => frames === null ? [] : createFrameAnimationPlans(frames),
    [frames],
  )

  useLayoutEffect(() => {
    setFrames(null)
    setSteps([0])
    setActiveStep(0)
  }, [r, minPts, scenario, points])

  const addCreatePoint = (point: Point) => {
    setCreatePoints((current) =>
      current.length >= POINT_LIMIT ? current : [...current, point],
    )
  }

  const eraseCreatePoints = (erasedPoints: readonly Point[]) => {
    const erased = new Set(erasedPoints)
    setCreatePoints((current) => {
      const next = current.filter((point) => !erased.has(point))
      return next.length === current.length ? current : next
    })
  }

  const selectScenario = async (nextScenario: ScenarioId) => {
    if (nextScenario === scenario) return
    const requestId = scenarioSelectionRequestRef.current + 1
    scenarioSelectionRequestRef.current = requestId
    const canvasPanel = canvasPanelRef.current
    if (canvasPanel === null) {
      throw new Error('Canvas panel is unavailable during scenario selection')
    }
    await scrollToCanvasPanel(canvasPanel, reduced)
    if (requestId !== scenarioSelectionRequestRef.current) return

    const transitionId = scenarioTransitionIdRef.current + 1
    scenarioTransitionIdRef.current = transitionId
    setScenarioTransition({ id: transitionId, fromPoints: points })
    if (nextScenario === 'create') {
      setCreatePoints([])
    }
    setScenario(nextScenario)
    setR(SCENARIOS[nextScenario].recommended.r)
    setMinPts(SCENARIOS[nextScenario].recommended.minPts)
  }

  const completeScenarioTransition = (id: number) => {
    setScenarioTransition((current) => current?.id === id ? null : current)
  }

  const clearCreatePoints = () => {
    setCreatePoints([])
  }

  const startRun = () => {
    if (points.length === 0) return
    setFrames(runDbscan(points, { r, minPts }, createSeed()))
    setSteps([0, 1])
    setActiveStep(1)
  }

  const advanceStep = () => {
    const nextStep = activeStep + 1
    if (frames === null || nextStep >= frames.length) return
    setActiveStep(nextStep)
    setSteps((current) => [...current, nextStep])
  }

  const seekStep = (step: number) => {
    if (frames === null) return
    const targetStep = Math.max(0, Math.min(step, frames.length - 1))
    setActiveStep(targetStep)
    setSteps((current) => current.filter((shownStep) => shownStep <= targetStep))
  }

  return (
    <div className="viz-sections">
      <Reveal>
        <VisualizationBlock
          scenario={scenario}
          r={r}
          minPts={minPts}
          recommendedR={SCENARIOS[scenario].recommended.r}
          recommendedMinPts={SCENARIOS[scenario].recommended.minPts}
          points={points}
          assignments={assignments}
          circle={frame?.circle ?? null}
          probeHighlights={frame?.probeHighlights ?? []}
          events={events}
          frameStep={activeStep}
          currentPointIndex={currentPointIndex}
          captureIntervals={animationPlans[activeStep]?.captureIntervalsByEvent ?? []}
          captureFadeDurations={animationPlans[activeStep]?.captureFadeDurationsByEvent ?? []}
          selectionDurations={animationPlans[activeStep]?.selectionDurationsByEvent ?? []}
          radiusDurations={animationPlans[activeStep]?.radiusDurationsByEvent ?? []}
          scenarioTransition={scenarioTransition}
          canvasPanelRef={canvasPanelRef}
          steps={steps}
          finalStepIndex={finalStepIndex}
          clusterCount={frame?.clusterCount ?? 0}
          noiseCount={frame?.noiseCount ?? 0}
          algorithmScenario={frame?.scenario ?? 'standard'}
          disabled={points.length === 0 || (finalStepIndex !== null && activeStep >= finalStepIndex)}
          onPointAdd={addCreatePoint}
          onPointsErase={eraseCreatePoints}
          onRChange={setR}
          onMinPtsChange={setMinPts}
          onClearCanvas={clearCreatePoints}
          onScenarioTransitionComplete={completeScenarioTransition}
          onStart={startRun}
          onNext={advanceStep}
          onSeekStep={seekStep}
        />
      </Reveal>
      <Reveal>
        <CodeBlock />
      </Reveal>
      <Reveal>
        <ScenarioCards value={scenario} onChange={selectScenario} />
      </Reveal>
    </div>
  )
}