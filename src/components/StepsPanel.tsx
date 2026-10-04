import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../i18n'
import { useMotionSettings } from '../hooks/useMotionSettings'
import type { RunScenario } from '../features/dbscan/types'

type StepItemProps = {
  index: number
  isActive: boolean
  isLast: boolean
  clusterCount: number
  noiseCount: number
  scenario: RunScenario
  onClick?: () => void
}

function StepItem({
  index,
  isActive,
  isLast,
  clusterCount,
  noiseCount,
  scenario,
  onClick,
}: StepItemProps) {
  const { t } = useLanguage()
  const { reduced, fadeSlide, transition } = useMotionSettings()
  const passed = !isActive

  const isSingleCluster = scenario === 'single-cluster-no-noise' ||
    scenario === 'single-cluster-with-noise'
  const description = scenario === 'no-clusters'
    ? (t.noClusterSteps[index] ?? t.steps[index] ?? '')
        .replace('{countNoise}', String(noiseCount))
    : isSingleCluster && index >= 6 && index <= 8
      ? t.singleClusterAcknowledgements[index - 6] ?? t.steps[index]
      : index === 9 && t.steps[9]?.includes('{count}')
        ? t.steps[9]
            .replace('{count}', String(clusterCount))
            .replace('{noise}', String(noiseCount))
        : t.steps[index]

  return (
    <motion.li
      className="step-item"
      {...fadeSlide(10)}
      transition={transition(0.3)}
    >
      <div className="step-track">
        <span className={isActive ? 'step-dot active' : 'step-dot'} />
        {!isLast && <span className="step-line" />}
      </div>
      <div className="step-body">
        <button
          type="button"
          className="step-title-btn"
          disabled={isActive}
          onClick={onClick}
        >
          <span className={passed ? 'step-title passed' : 'step-title'}>
            {t.stepTitle(index)}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              key={`step-description-${index}`}
              className="step-desc"
              initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={transition(0.3)}
            >
              {description}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}

type StepsPanelProps = {
  steps?: readonly number[]
  clusterCount?: number
  noiseCount?: number
  scenario?: RunScenario
  disabled?: boolean
  onStart?: () => void
  onNext?: () => void
  onSeekStep?: (step: number) => void
}

export function StepsPanel({
  steps = [0],
  clusterCount = 0,
  noiseCount = 0,
  scenario = 'standard',
  disabled = false,
  onStart,
  onNext,
  onSeekStep,
}: StepsPanelProps) {
  const { t } = useLanguage()
  const { reduced } = useMotionSettings()
  const listRef = useRef<HTMLOListElement>(null)
  const isFirstRun = steps.length === 1

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ top: list.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [steps.length, reduced])

  return (
    <aside className="viz-card steps-panel">
      <button
        type="button"
        className="btn btn-primary steps-start"
        disabled={disabled}
        onClick={isFirstRun ? onStart : onNext}
      >
        {isFirstRun ? t.startButton : t.nextButton}
      </button>
      <ol className="steps-list" ref={listRef}>
        <AnimatePresence initial={false}>
          {steps.map((index, i) => (
            <StepItem
              key={index}
              index={index}
              isActive={i === steps.length - 1}
              isLast={i === steps.length - 1}
              clusterCount={clusterCount}
              noiseCount={noiseCount}
              scenario={scenario}
              onClick={i < steps.length - 1 ? () => onSeekStep?.(index) : undefined}
            />
          ))}
        </AnimatePresence>
      </ol>
    </aside>
  )
}