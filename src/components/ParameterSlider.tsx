import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type ParameterSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  help: string
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
  format,
  onChange,
}: ParameterSliderProps) {
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

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
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        ?
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="popover"
            role="tooltip"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {help}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}