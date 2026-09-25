import { useState } from 'react'
import type { ScenarioId } from '../data'
import { VisualizationBlock } from '../components/VisualizationBlock'
import { CodeBlock } from '../components/CodeBlock'
import { ScenarioCards } from '../components/ScenarioCards'
import { Reveal } from '../components/Reveal'
import { DEFAULT_PARAMETERS } from '../features/dbscan/constants'
import '../styles/visualization.css'

export function VisualizationPage() {
  const [scenario, setScenario] = useState<ScenarioId>('circles')
  const [r, setR] = useState<number>(DEFAULT_PARAMETERS.r)
  const [minPts, setMinPts] = useState<number>(DEFAULT_PARAMETERS.minPts)

  return (
    <div className="viz-sections">
      <Reveal>
        <VisualizationBlock
          scenario={scenario}
          r={r}
          minPts={minPts}
          onRChange={setR}
          onMinPtsChange={setMinPts}
        />
      </Reveal>
      <Reveal>
        <CodeBlock />
      </Reveal>
      <Reveal>
        <ScenarioCards value={scenario} onChange={setScenario} />
      </Reveal>
    </div>
  )
}