import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { ScenarioId } from '../data'
import { CanvasView } from '../features/canvas/CanvasView'
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
          min={0.1}
          max={20}
          step={0.1}
          format={(value) => value.toFixed(1)}
          help={t.paramRHelp}
          onChange={onRChange}
        />
        <ParameterSlider
          label={t.paramMinPts}
          value={minPts}
          min={0}
          max={100}
          step={1}
          format={(value) => String(Math.round(value))}
          help={t.paramMinPtsHelp}
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