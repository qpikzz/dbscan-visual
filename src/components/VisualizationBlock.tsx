import type { ScenarioId } from '../data'
import { CanvasPanel } from './CanvasPanel'
import { StepsPanel } from './StepsPanel'

type VisualizationBlockProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
}

export function VisualizationBlock({
  scenario,
  r,
  minPts,
  onRChange,
  onMinPtsChange,
}: VisualizationBlockProps) {
  return (
    <div className="viz-block">
      <CanvasPanel
        scenario={scenario}
        r={r}
        minPts={minPts}
        onRChange={onRChange}
        onMinPtsChange={onMinPtsChange}
      />
      <StepsPanel />
    </div>
  )
}