import type { ScenarioId } from '../data'
import type {
  Assignment,
  FrameEvent,
  Point,
  RadiusCircle,
  RunScenario,
} from '../features/dbscan/types'
import { CanvasPanel } from './CanvasPanel'
import { StepsPanel } from './StepsPanel'

type VisualizationBlockProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  recommendedR: number
  recommendedMinPts: number
  points: readonly Point[]
  assignments?: readonly Assignment[]
  circle?: RadiusCircle | null
  probeHighlights?: readonly number[]
  events: readonly FrameEvent[]
  frameStep: number
  currentPointIndex: number | null
  captureIntervals: readonly (readonly number[])[]
  captureFadeDurations: readonly (readonly number[])[]
  selectionDurations: readonly number[]
  radiusDurations: readonly number[]
  steps: readonly number[]
  finalStepIndex: number | null
  clusterCount: number
  noiseCount: number
  algorithmScenario: RunScenario
  disabled: boolean
  onPointAdd: (point: Point) => void
  onPointsErase: (points: readonly Point[]) => void
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
  onClearCanvas: () => void
  onStart: () => void
  onNext: () => void
  onSeekStep: (step: number) => void
}

export function VisualizationBlock({
  scenario,
  r,
  minPts,
  recommendedR,
  recommendedMinPts,
  points,
  assignments,
  circle,
  probeHighlights,
  events,
  frameStep,
  currentPointIndex,
  captureIntervals,
  captureFadeDurations,
  selectionDurations,
  radiusDurations,
  steps,
  finalStepIndex,
  clusterCount,
  noiseCount,
  algorithmScenario,
  disabled,
  onPointAdd,
  onPointsErase,
  onRChange,
  onMinPtsChange,
  onClearCanvas,
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
        recommendedR={recommendedR}
        recommendedMinPts={recommendedMinPts}
        points={points}
        assignments={assignments}
        circle={circle}
        probeHighlights={probeHighlights}
        events={events}
        frameStep={frameStep}
        currentPointIndex={currentPointIndex}
        captureIntervals={captureIntervals}
        captureFadeDurations={captureFadeDurations}
        selectionDurations={selectionDurations}
        radiusDurations={radiusDurations}
        onPointAdd={onPointAdd}
        onPointsErase={onPointsErase}
        onRChange={onRChange}
        onMinPtsChange={onMinPtsChange}
        onClearCanvas={onClearCanvas}
      />
      <StepsPanel
        steps={steps}
        finalStepIndex={finalStepIndex}
        clusterCount={clusterCount}
        noiseCount={noiseCount}
        scenario={algorithmScenario}
        disabled={disabled}
        onStart={onStart}
        onNext={onNext}
        onSeekStep={onSeekStep}
      />
    </div>
  )
}