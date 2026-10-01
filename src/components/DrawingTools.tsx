import { motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import type { ActiveTool } from './CanvasPanel'

type DrawingToolsProps = {
  activeTool: ActiveTool
  onChange: (tool: ActiveTool) => void
  onClear: () => void
}

export function DrawingTools({ activeTool, onChange, onClear }: DrawingToolsProps) {
  const { t } = useLanguage()
  const { fadeSlide, transition } = useMotionSettings()
  const toolsAnimation = fadeSlide(24)

  return (
    <motion.div
      className="drawing-tools"
      {...toolsAnimation}
      transition={transition(0.25)}
    >
        <button
          type="button"
          className={activeTool === 'draw' ? 'tool-btn active' : 'tool-btn'}
          aria-label={t.drawToolLabel}
          aria-pressed={activeTool === 'draw'}
          onClick={() => onChange(activeTool === 'draw' ? null : 'draw')}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h8" />
            <path d="M16.8 3.2a2.2 2.2 0 0 1 3.1 3.1L7.5 18.7 3 19.6l.9-4.5L16.8 3.2Z" />
          </svg>
        </button>
        <button
          type="button"
          className={activeTool === 'erase' ? 'tool-btn active' : 'tool-btn'}
          aria-label={t.eraseToolLabel}
          aria-pressed={activeTool === 'erase'}
          onClick={() => onChange(activeTool === 'erase' ? null : 'erase')}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 12.5 15.5 4l4 4L11 16.5h-6l-3 3M7 19.5h12" />
          </svg>
        </button>
        <button type="button" className="tool-clear" onClick={onClear}>
          {t.clearCanvasButton}
        </button>
      </motion.div>
  )
}