import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { easeStepProgress, PARAMETER_VISUAL_DURATION } from '../features/canvas/animation'

type ParameterSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  help: string
  helpLabel: string
  resetText: string
  resetLabel: string
  format: (value: number) => string
  onChange: (value: number) => void
  onReset: () => void
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  help,
  helpLabel,
  resetText,
  resetLabel,
  format,
  onChange,
  onReset,
}: ParameterSliderProps) {
  const [open, setOpen] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  const controlRef = useRef<HTMLDivElement>(null)
  const displayRef = useRef(value)
  const userValueRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const { fadeSlide, transition, reduced } = useMotionSettings()
  const popoverId = `param-help-${label.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    if (userValueRef.current === value) {
      userValueRef.current = null
      return
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    const from = displayRef.current
    if (from === value || reduced) {
      setDisplayValue(value)
      displayRef.current = value
      return
    }
    const startedAt = performance.now()
    const animate = () => {
      const progress = Math.min(
        (performance.now() - startedAt) / PARAMETER_VISUAL_DURATION,
        1,
      )
      const next = from + (value - from) * easeStepProgress(progress)
      setDisplayValue(next)
      displayRef.current = next
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        displayRef.current = value
        animationFrameRef.current = null
      }
    }
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [reduced, value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    userValueRef.current = nextValue
    setDisplayValue(nextValue)
    displayRef.current = nextValue
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    onChange(nextValue)
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (controlRef.current && !controlRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div className="param-control" ref={controlRef}>
      <span className="param-label">{label}</span>
      <input
        className="param-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        aria-label={`${label}: ${format(displayValue)}`}
        onChange={handleChange}
      />
      <span className="param-value">{format(displayValue)}</span>
      <button
        type="button"
        className="help-btn"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={helpLabel}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        ?
      </button>
      <button type="button" className="reset-btn" aria-label={resetLabel} onClick={onReset}>
        {resetText}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            className="popover"
            role="tooltip"
            {...fadeSlide(-8)}
            transition={transition(0.25)}
          >
            {help}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}