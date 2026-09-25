import { motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import { scenarioIds } from '../data'
import type { ScenarioId } from '../data'
import { ScenarioPreview } from './ScenarioPreview'

type ScenarioLabelKey =
  | 'scenarioCircles'
  | 'scenarioBlobs'
  | 'scenarioHalfMoons'
  | 'scenarioCreate'

const scenarioLabels: Record<ScenarioId, ScenarioLabelKey> = {
  circles: 'scenarioCircles',
  blobs: 'scenarioBlobs',
  'half-moons': 'scenarioHalfMoons',
  create: 'scenarioCreate',
}

type ScenarioCardsProps = {
  value: ScenarioId
  onChange: (scenario: ScenarioId) => void
}

export function ScenarioCards({ value, onChange }: ScenarioCardsProps) {
  const { t } = useLanguage()
  const { reduced, transition } = useMotionSettings()

  return (
    <section className="viz-card" aria-labelledby="plots-title">
      <div className="plots-head">
        <h2 className="plots-title" id="plots-title">
          {t.plotsTitle}
        </h2>
      </div>
      <div className="plots-grid">
        {scenarioIds.map((id, i) => (
          <motion.button
            key={id}
            type="button"
            className="scenario-card"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            initial={{ opacity: 0, ...(reduced ? {} : { y: 24 }) }}
            whileInView={{ opacity: 1, ...(reduced ? {} : { y: 0 }) }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              ...transition(0.6, i * 0.06),
            }}
          >
            <ScenarioPreview scenario={id} />
            <span className="scenario-label">{t[scenarioLabels[id]]}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}