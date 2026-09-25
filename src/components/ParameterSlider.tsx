import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'

type ParameterSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  help: string
  helpLabel: string
  format: (value: number) => string
  onChange: (value: number) => void
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  help,
  helpLabel,
  format,
  onChange,
}: ParameterSliderProps) {
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const { fadeSlide, transition } = useMotionSettings()
  const popoverId = `param-help-${label.replace(/\s+/g, '-').toLowerCase()}`

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
        value={value}
        aria-label={`${label}: ${format(value)}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="param-value">{format(value)}</span>
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