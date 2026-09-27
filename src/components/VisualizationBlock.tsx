import type { ScenarioId } from '../data'
import type { Assignment, Point, RadiusCircle } from '../features/dbscan/types'
import { CanvasPanel } from './CanvasPanel'
import { StepsPanel } from './StepsPanel'

type VisualizationBlockProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  points: readonly Point[]
  assignments?: readonly Assignment[]
  circle?: RadiusCircle | null
  steps: readonly number[]
  clusterCount: number
  noiseCount: number
  disabled: boolean
  onPointAdd: (point: Point) => void
  onPointsErase: (points: readonly Point[]) => void
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
  onStart: () => void
  onNext: () => void
  onSeekStep: (step: number) => void
}

export function VisualizationBlock({
  scenario,
  r,
  minPts,
  points,
  assignments,
  circle,
  steps,
  clusterCount,
  noiseCount,
  disabled,
  onPointAdd,
  onPointsErase,
  onRChange,
  onMinPtsChange,
  onStart,
  onNext,
  onSeekStep,
}: VisualizationBlockProps) {
  return (
    <div className="viz-block">
      <CanvasPanel
        scenario={scenario}
        r={r}
        minPts={minPts}
        points={points}
        assignments={assignments}
        circle={circle}
        onPointAdd={onPointAdd}
        onPointsErase={onPointsErase}
        onRChange={onRChange}
        onMinPtsChange={onMinPtsChange}
      />
      <StepsPanel
        steps={steps}
        clusterCount={clusterCount}
        noiseCount={noiseCount}
        disabled={disabled}
        onStart={onStart}
        onNext={onNext}
        onSeekStep={onSeekStep}
      />
    </div>
  )
}