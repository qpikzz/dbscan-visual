import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ScenarioId } from '../data'
import type { Assignment, Point, RadiusCircle } from '../features/dbscan/types'
import { CanvasView } from '../features/canvas/CanvasView'
import { MIN_PTS_RANGE, R_RANGE } from '../features/dbscan/constants'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import { DrawingTools } from './DrawingTools'
import { ParameterSlider } from './ParameterSlider'

export type ActiveTool = 'draw' | 'erase' | null

type CanvasPanelProps = {
  scenario: ScenarioId
  r: number
  minPts: number
  recommendedR: number
  recommendedMinPts: number
  points: readonly Point[]
  assignments?: readonly Assignment[]
  circle?: RadiusCircle | null
  onPointAdd: (point: Point) => void
  onPointsErase: (points: readonly Point[]) => void
  onRChange: (value: number) => void
  onMinPtsChange: (value: number) => void
  onClearCanvas: () => void
}

export function CanvasPanel({
  scenario,
  r,
  minPts,
  recommendedR,
  recommendedMinPts,
  points,
  assignments = [],
  circle = null,
  onPointAdd,
  onPointsErase,
  onRChange,
  onMinPtsChange,
  onClearCanvas,
}: CanvasPanelProps) {
  const { t } = useLanguage()
  const { fadeSlide, transition } = useMotionSettings()
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [toastVersion, setToastVersion] = useState(0)
  const canvasTool = scenario === 'create' ? activeTool : null

  useEffect(() => {
    if (scenario !== 'create') {
      setActiveTool(null)
    }
  }, [scenario])

  useEffect(() => {
    if (toastVersion === 0) {
      return
    }
    const timeout = window.setTimeout(() => setToastVersion(0), 3000)
    return () => window.clearTimeout(timeout)
  }, [toastVersion])

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
          resetText={t.resetButton}
          resetLabel={t.resetParamLabel(t.paramR)}
          onChange={onRChange}
          onReset={() => onRChange(recommendedR)}
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
          resetText={t.resetButton}
          resetLabel={t.resetParamLabel(t.paramMinPts)}
          onChange={onMinPtsChange}
          onReset={() => onMinPtsChange(recommendedMinPts)}
        />
      </div>
      <div className="canvas-wrap">
        <CanvasView
          scenario={scenario}
          points={points}
          assignments={assignments}
          circle={circle}
          activeTool={canvasTool}
          onPointAdd={onPointAdd}
          onPointsErase={onPointsErase}
          onPointLimitReached={() => setToastVersion((version) => version + 1)}
        />
        <AnimatePresence>
          {toastVersion > 0 && (
            <motion.div
              key={toastVersion}
              className="canvas-toast"
              role="alert"
              aria-live="assertive"
              {...fadeSlide(-8)}
              transition={transition(0.25)}
            >
              {t.pointLimitReached}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {scenario === 'create' && (
            <DrawingTools activeTool={activeTool} onChange={setActiveTool} onClear={onClearCanvas} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}