import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { TheoryIcon } from '../components/TheoryIcons'
import { TheorySection } from '../components/TheorySection'
import {
  getTheorySectionAncestors,
  resolveTheorySectionId,
  theorySectionIds,
  theorySections,
} from '../data/theory'
import { useCollapsedSections } from '../hooks/useCollapsedSections'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import '../styles/visualization.css'
import '../styles/theory.css'

const ANCHOR_SCROLL_WAIT_MS = 340

export function TheoryPage() {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { reduced } = useMotionSettings()
  const controls = useCollapsedSections(theorySectionIds)
  const { expandSections } = controls
  const handledHashRef = useRef<string | null>(null)
  const scrollTimerRef = useRef<number | null>(null)

  const scrollToSection = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduced ? 'instant' : 'smooth',
        block: 'start',
      })
    },
    [reduced],
  )

  useEffect(() => {
    const rawId = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
    if (!rawId) {
      return
    }
    const targetId = resolveTheorySectionId(rawId)
    if (!theorySectionIds.includes(targetId)) {
      return
    }
    if (targetId !== rawId) {
      navigate(
        { pathname: location.pathname, hash: `#${targetId}` },
        { preventScrollReset: true, replace: true },
      )
      return
    }
    if (handledHashRef.current === rawId) {
      return
    }
    handledHashRef.current = rawId

    const ancestors = getTheorySectionAncestors(rawId).filter((id) =>
      controls.isCollapsed(id),
    )
    if (ancestors.length > 0) {
      expandSections(ancestors)
    }

    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = null
    }

    if (ancestors.length === 0 || reduced) {
      scrollToSection(rawId)
      return
    }

    scrollTimerRef.current = window.setTimeout(() => {
      scrollTimerRef.current = null
      scrollToSection(rawId)
    }, ANCHOR_SCROLL_WAIT_MS)
  }, [location.hash, location.pathname, navigate, reduced, expandSections, controls, scrollToSection])

  function goToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault()
    if (location.hash === `#${id}`) {
      scrollToSection(id)
      return
    }
    navigate(
      { pathname: location.pathname, hash: `#${id}` },
      { preventScrollReset: true },
    )
  }

  return (
    <section className="theory-page" aria-labelledby="theory-page-title">
      <nav className="theory-toc viz-card" aria-labelledby="theory-toc-title">
        <h2 id="theory-toc-title">{t.theoryTocTitle}</h2>
        <ol>
          {theorySections.map((section) => (
            <li key={section.id}>
              <Link
                to={{ pathname: location.pathname, hash: `#${section.id}` }}
                onClick={(event) => goToSection(event, section.id)}
              >
                {section.icon ? (
                  <span className="theory-toc-icon">
                    <TheoryIcon name={section.icon} />
                  </span>
                ) : null}
                <span>{t[section.titleKey]}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="theory-content">
        <Reveal>
          <header className="theory-intro">
            <p className="theory-eyebrow">{t.theoryLabel}</p>
            <h1 id="theory-page-title">{t.theoryPageTitle}</h1>
            <p>{t.theoryIntro}</p>
          </header>
        </Reveal>

        {theorySections.map((section) => (
          <Reveal key={section.id}>
            <TheorySection section={section} level={0} controls={controls} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
