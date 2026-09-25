import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { ScenarioId } from '../data'
import { CanvasView } from '../features/canvas/CanvasView'
import { MIN_PTS_RANGE, R_RANGE } from '../features/dbscan/constants'
import { useLanguage } from '../i18n'
import { DrawingTools } from './DrawingTools'
import { ParameterSlider } from './ParameterSlider'

export type ActiveTool = 'draw' | 'erase' | null

type CanvasPanelProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
}

export function CanvasPanel({
  scenario,
  r,
  minPts,
  onRChange,
  onMinPtsChange,
}: CanvasPanelProps) {
  const { t } = useLanguage()
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)

  return (
    <section className="viz-card canvas-panel" aria-label={t.canvasAria}>
      <div className="canvas-controls">
        <ParameterSlider
          label={t.paramR}
          value={r}
          min={R_RANGE.min}
          max={R_RANGE.max}
          step={R_RANGE.step}
          format={(value) => value.toFixed(1)}
          help={t.paramRHelp}
          helpLabel={t.paramHelpLabel(t.paramR)}
          onChange={onRChange}
        />
        <ParameterSlider
          label={t.paramMinPts}
          value={minPts}
          min={MIN_PTS_RANGE.min}
          max={MIN_PTS_RANGE.max}
          step={MIN_PTS_RANGE.step}
          format={(value) => String(Math.round(value))}
          help={t.paramMinPtsHelp}
          helpLabel={t.paramHelpLabel(t.paramMinPts)}
          onChange={onMinPtsChange}
        />
      </div>
      <div className="canvas-wrap">
        <CanvasView />
        <AnimatePresence>
          {scenario === 'create' && (
            <DrawingTools activeTool={activeTool} onChange={setActiveTool} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}