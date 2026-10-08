import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'

type DataInfoModalProps = {
  onClose: () => void
}

export function DataInfoModal({ onClose }: DataInfoModalProps) {
  const { t } = useLanguage()
  const { reduced, transition } = useMotionSettings()
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const dialog = dialogRef.current
      if (!dialog) {
        return
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        dialog.focus()
        return
      }

      if (
        event.shiftKey &&
        (document.activeElement === firstElement || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  const overlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transition(0.24),
  }
  const cardMotion = {
    initial: {
      opacity: 0,
      scale: reduced ? 1 : 0.98,
      y: reduced ? 0 : 8,
    },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: {
      opacity: 0,
      scale: reduced ? 1 : 0.98,
      y: reduced ? 0 : 8,
    },
    transition: transition(0.24),
  }

  return createPortal(
    <motion.div
      className="data-info-overlay"
      {...overlayMotion}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.section
        ref={dialogRef}
        className="data-info-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-info-title"
        aria-describedby="data-info-intro"
        tabIndex={-1}
        {...cardMotion}
      >
        <button
          className="data-info-close"
          type="button"
          aria-label={t.dataInfoCloseLabel}
          ref={closeButtonRef}
          onClick={onClose}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="data-info-head">
          <span className="data-info-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3 19 6v5c0 4.4-2.8 8.2-7 10-4.2-1.8-7-5.6-7-10V6l7-3Z" />
              <path d="m8.8 12.1 2.1 2.1 4.4-4.5" />
            </svg>
          </span>
          <h2 className="data-info-title" id="data-info-title">
            {t.dataInfoTitle}
          </h2>
        </div>
        <p className="data-info-intro" id="data-info-intro">
          {t.dataInfoIntro}
        </p>
        <ul className="data-info-cards">
          <li className="data-info-card">
            <span className="data-info-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="10" cy="8" r="3" />
                <path d="M4.5 19c.5-3.1 2.4-5 5.5-5 1.1 0 2 .2 2.8.7" />
                <path d="m15 14 5 5m0-5-5 5" />
              </svg>
            </span>
            <div className="data-info-card-body">
              <h3 className="data-info-card-title">{t.dataInfoCard1Title}</h3>
              <p className="data-info-card-text">{t.dataInfoPoint1}</p>
            </div>
          </li>
          <li className="data-info-card">
            <span className="data-info-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 8h18M7 6h.01M10 6h.01M7 12h10M7 16h6" />
                <circle cx="9" cy="12" r=".7" />
                <circle cx="15" cy="16" r=".7" />
              </svg>
            </span>
            <div className="data-info-card-body">
              <h3 className="data-info-card-title">{t.dataInfoCard2Title}</h3>
              <p className="data-info-card-text">{t.dataInfoPoint2}</p>
            </div>
          </li>
          <li className="data-info-card">
            <span className="data-info-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4" y="3.5" width="16" height="7" rx="1.5" />
                <rect x="4" y="13.5" width="16" height="7" rx="1.5" />
                <path d="M8 7h.01M8 17h.01M11 7h5M11 17h5" />
                <circle cx="18" cy="7" r=".7" />
                <circle cx="18" cy="17" r=".7" />
              </svg>
            </span>
            <div className="data-info-card-body">
              <h3 className="data-info-card-title">{t.dataInfoCard3Title}</h3>
              <p className="data-info-card-text">{t.dataInfoPoint3}</p>
            </div>
          </li>
        </ul>
      </motion.section>
    </motion.div>,
    document.body,
  )
}

export function DataInfoModalPresence({ open, onClose }: DataInfoModalProps & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && <DataInfoModal onClose={onClose} />}
    </AnimatePresence>
  )
}
