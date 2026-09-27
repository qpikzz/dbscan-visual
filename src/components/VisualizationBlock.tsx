import type { ScenarioId } from '../data'
import type { Assignment, RadiusCircle } from '../features/dbscan/types'
import { CanvasPanel } from './CanvasPanel'
import { StepsPanel } from './StepsPanel'

type VisualizationBlockProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  assignments?: readonly Assignment[]
  circle?: RadiusCircle | null
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
}

export function VisualizationBlock({
  scenario,
  r,
  minPts,
  assignments,
  circle,
  onRChange,
  onMinPtsChange,
}: VisualizationBlockProps) {
  return (
    <div className="viz-block">
      <CanvasPanel
        scenario={scenario}
        r={r}
        minPts={minPts}
        assignments={assignments}
        circle={circle}
        onRChange={onRChange}
        onMinPtsChange={onMinPtsChange}
      />
      <StepsPanel />
    </div>
  )
}