import { useLayoutEffect, useState } from 'react'
import type { ScenarioId } from '../data'
import { VisualizationBlock } from '../components/VisualizationBlock'
import { CodeBlock } from '../components/CodeBlock'
import { ScenarioCards } from '../components/ScenarioCards'
import { Reveal } from '../components/Reveal'
import { POINT_LIMIT } from '../features/dbscan/constants'
import { createSeed, runDbscan } from '../features/dbscan'
import { SCENARIOS } from '../features/dbscan/scenarios'
import type { Assignment, Frame, Point } from '../features/dbscan/types'
import '../styles/visualization.css'

export function VisualizationPage() {
  const [scenario, setScenario] = useState<ScenarioId>('circles')
  const [r, setR] = useState<number>(SCENARIOS.circles.recommended.r)
  const [minPts, setMinPts] = useState<number>(SCENARIOS.circles.recommended.minPts)
  const [createPoints, setCreatePoints] = useState<Point[]>([])
  const [frames, setFrames] = useState<Frame[] | null>(null)
  const [steps, setSteps] = useState<number[]>([0])
  const [activeStep, setActiveStep] = useState(0)
  const points = scenario === 'create' ? createPoints : SCENARIOS[scenario].points
  const frame = frames?.[activeStep]
  const assignments: readonly Assignment[] = frame?.assignments ?? []

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

  const selectScenario = (nextScenario: ScenarioId) => {
    if (nextScenario === scenario) return
    if (nextScenario === 'create') {
      setCreatePoints([])
    }
    setScenario(nextScenario)
    setR(SCENARIOS[nextScenario].recommended.r)
    setMinPts(SCENARIOS[nextScenario].recommended.minPts)
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
    if (frames === null || nextStep > 9) return
    setActiveStep(nextStep)
    setSteps((current) => [...current, nextStep])
  }

  const seekStep = (step: number) => {
    setActiveStep(step)
    setSteps((current) => current.filter((shownStep) => shownStep <= step))
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
          steps={steps}
          clusterCount={frame?.clusterCount ?? 0}
          noiseCount={frame?.noiseCount ?? 0}
          disabled={points.length === 0 || (activeStep === 9 && frames !== null)}
          onPointAdd={addCreatePoint}
          onPointsErase={eraseCreatePoints}
          onRChange={setR}
          onMinPtsChange={setMinPts}
          onClearCanvas={clearCreatePoints}
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