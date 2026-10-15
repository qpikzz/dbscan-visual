import { motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  layoutId: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  layoutId,
}: SegmentedControlProps<T>) {
  const { transition } = useMotionSettings()

  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={active ? 'segmented-option active' : 'segmented-option'}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="segmented-highlight"
                transition={transition(0.25)}
              />
            )}
            <span className="segmented-label">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
