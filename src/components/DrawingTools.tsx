import { motion, useReducedMotion } from 'motion/react'
import { useLanguage } from '../i18n'
import type { ActiveTool } from './CanvasPanel'

type DrawingToolsProps = {
  activeTool: ActiveTool
  onChange: (tool: ActiveTool) => void
}

export function DrawingTools({ activeTool, onChange }: DrawingToolsProps) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="drawing-tools"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: reduce ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
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
      </motion.div>
  )
}