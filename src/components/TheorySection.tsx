import { motion } from 'motion/react'
import type { TheoryBlock, TheorySectionNode } from '../data/theory'
import type { TheoryCollapseControls } from '../hooks/useCollapsedSections'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import { TheoryBlockContent } from './TheoryBlocks'
import { TheoryIcon } from './TheoryIcons'

type TheorySectionProps = {
  section: TheorySectionNode
  level: number
  controls: TheoryCollapseControls
}

type TheorySectionsGroupProps = {
  block: Extract<TheoryBlock, { type: 'sections' }>
  level: number
  controls: TheoryCollapseControls
}

function TheorySectionsGroup({ block, level, controls }: TheorySectionsGroupProps) {
  if (block.layout === 'ordered') {
    return (
      <ol className="theory-sections theory-sections--ordered">
        {block.items.map((item) => (
          <li key={item.id}>
            <TheorySection section={item} level={level} controls={controls} />
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div className={`theory-sections theory-sections--${block.layout}`}>
      {block.items.map((item) => (
        <TheorySection key={item.id} section={item} level={level} controls={controls} />
      ))}
    </div>
  )
}

export function TheorySection({ section, level, controls }: TheorySectionProps) {
  const { t } = useLanguage()
  const { reduced, transition } = useMotionSettings()
  const collapsed = controls.isCollapsed(section.id)
  const title = t[section.titleKey]
  const Heading = level === 0 ? 'h2' : level === 1 ? 'h3' : 'h4'
  const className = [
    'theory-section',
    level === 0 ? 'theory-section--top viz-card' : '',
    section.variant === 'accent' ? 'theory-section--accent' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function handleHeadClick() {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      return
    }
    controls.toggleSection(section.id)
  }

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className={className}>
      <div className="theory-section-head" onClick={handleHeadClick}>
        <button
          type="button"
          className="theory-section-toggle"
          aria-expanded={!collapsed}
          aria-controls={`${section.id}-panel`}
          aria-label={
            collapsed ? t.theoryExpandLabel(title) : t.theoryCollapseLabel(title)
          }
        >
          <svg className="theory-section-chevron" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </button>
        <Heading className="theory-section-title" id={`${section.id}-title`}>
          {section.icon ? (
            <span className="theory-section-icon">
              <TheoryIcon name={section.icon} />
            </span>
          ) : null}
          <span className="theory-section-title-text">{title}</span>
        </Heading>
      </div>
      <motion.div
        id={`${section.id}-panel`}
        className="theory-section-body"
        initial={false}
        animate={{
          height: collapsed ? 0 : 'auto',
          opacity: collapsed ? 0 : 1,
        }}
        transition={
          reduced
            ? { height: { duration: 0 }, opacity: { duration: 0.1 } }
            : transition(0.3)
        }
        inert={collapsed}
      >
        {section.blocks.map((block, index) =>
          block.type === 'sections' ? (
            <TheorySectionsGroup
              key={index}
              block={block}
              level={level + 1}
              controls={controls}
            />
          ) : (
            <TheoryBlockContent key={index} block={block} level={level} />
          ),
        )}
      </motion.div>
    </section>
  )
}
