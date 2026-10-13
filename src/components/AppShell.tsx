import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../i18n'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { socialLinks } from '../config/socialLinks'
import { Reveal } from './Reveal'
import { DataInfoModalPresence } from './DataInfoModal'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem('dbscan-theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [theme, setTheme] = useLocalStorage<Theme>('dbscan-theme', getInitialTheme())
  const [lightThemeWarningShown, setLightThemeWarningShown] = useState(false)
  const [warningCountdown, setWarningCountdown] = useState<number | null>(null)
  const [dataInfoOpen, setDataInfoOpen] = useState(false)
  const closeDataInfo = useCallback(() => setDataInfoOpen(false), [])
  const { language, setLanguage, t } = useLanguage()
  const { reduced, transition } = useMotionSettings()
  const location = useLocation()
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const dataInfoTriggerRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const warningOpen = warningCountdown !== null
  const [warningPrefix, warningSuffix] = t.themeWarningMessage.split('{count}')
  const warningSlotMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { height: 0, opacity: 0, y: -6 },
        animate: { height: 'auto', opacity: 1, y: 0 },
        exit: { height: 0, opacity: 0, y: -6 },
      }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (warningCountdown === null) {
      return
    }

    const timeout = window.setTimeout(() => {
      if (warningCountdown > 1) {
        setWarningCountdown(warningCountdown - 1)
        return
      }

      setTheme('light')
      setLightThemeWarningShown(true)
      setWarningCountdown(null)
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [setTheme, warningCountdown])

  useEffect(() => {
    if (warningOpen) {
      cancelButtonRef.current?.focus()
      return
    }

    returnFocusRef.current?.focus()
    returnFocusRef.current = null
  }, [warningOpen])

  const toggleTheme = (button: HTMLButtonElement) => {
    if (theme === 'dark' && !lightThemeWarningShown) {
      returnFocusRef.current = button
      setWarningCountdown(3)
      return
    }

    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const cancelThemeSwitch = () => {
    setWarningCountdown(null)
  }

  return (
    <div className="app-shell">
      <div className="header-area">
        <header className="app-header">
          <h1 className="app-logo">
            <svg className="app-logo-mark" aria-hidden="true" viewBox="0 0 128 128">
              <circle className="logo-mark-ring" cx="64" cy="64" r="60" />
              <circle className="logo-mark-center" cx="64" cy="64" r="32" />
            </svg>
            <span>{t.logo}</span>
          </h1>
          <div className="header-actions">
            <nav className="page-switcher" aria-label={t.pageSwitcherLabel}>
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'page-switcher-option active' : 'page-switcher-option'
                }
                to="/visualization"
              >
                {t.visualLabel}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'page-switcher-option active' : 'page-switcher-option'
                }
                to="/theory"
              >
                {t.theoryLabel}
              </NavLink>
            </nav>
            <div className="app-controls">
              <div className="language-switcher" role="group" aria-label={t.languageLabel}>
                <button
                  type="button"
                  className={language === 'ru' ? 'active' : undefined}
                  aria-pressed={language === 'ru'}
                  onClick={() => setLanguage('ru')}
                >
                  {t.languageRu}
                </button>
                <button
                  type="button"
                  className={language === 'en' ? 'active' : undefined}
                  aria-pressed={language === 'en'}
                  onClick={() => setLanguage('en')}
                >
                  {t.languageEn}
                </button>
              </div>
              <button
                className={theme === 'dark' ? 'theme-toggle active' : 'theme-toggle'}
                type="button"
                aria-label={t.themeToggleLabel}
                aria-pressed={theme === 'dark'}
                onClick={(event) => toggleTheme(event.currentTarget)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  {theme === 'light' ? (
                    <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.05 16.95l-1.42 1.42m12.73 0-1.42-1.42M7.05 7.05 5.63 5.63M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                  ) : (
                    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </header>
        <AnimatePresence>
          {warningCountdown !== null && (
            <motion.div
              className="theme-warning-slot"
              {...warningSlotMotion}
              transition={transition(0.25)}
            >
              <div className="theme-warning-inner">
                <div
                  className="theme-warning-popover"
                  role="status"
                  aria-live="polite"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      cancelThemeSwitch()
                    }
                  }}
                >
                  <div className="theme-warning-body">
                    <span className="theme-warning-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.05 16.95l-1.42 1.42m12.73 0-1.42-1.42M7.05 7.05 5.63 5.63M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                      </svg>
                    </span>
                    <p className="theme-warning-message">
                      {warningPrefix}
                      <span className="theme-warning-count" aria-live="off">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={warningCountdown}
                            initial={reduced ? false : { opacity: 0, y: '0.35em' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? { opacity: 0 } : { opacity: 0, y: '-0.35em' }}
                            transition={transition(0.16)}
                          >
                            {warningCountdown}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      {warningSuffix}
                    </p>
                  </div>
                  <button
                    className="theme-warning-cancel"
                    type="button"
                    ref={cancelButtonRef}
                    onClick={cancelThemeSwitch}
                  >
                    {t.themeWarningCancel}
                  </button>
                  <span
                    className="theme-warning-progress"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <main className="page-container">
        <div className="page-transition" key={location.pathname}>
          {children}
        </div>
      </main>
      <Reveal>
        <footer className="app-footer">
          <div className="footer-zones">
            <div className="footer-author">
              <span className="footer-author-name">{t.footerAuthor}</span>
              <a className="footer-author-link" href="https://t.me/qpikzz">
                {t.footerTelegram}
              </a>
              <a className="footer-author-link" href={socialLinks.vk}>
                {t.footerVk}
              </a>
              <a className="footer-author-link" href="https://github.com/qpikzz">
                {t.footerGithub}
              </a>
              <button
                className="footer-author-link footer-data-info-trigger"
                type="button"
                ref={dataInfoTriggerRef}
                onClick={() => setDataInfoOpen(true)}
              >
                {t.footerDataInfo}
              </button>
            </div>
            <div className="footer-mark" aria-hidden="true" />
            <p className="footer-love">{t.footerLove}</p>
          </div>
          <p className="footer-note">{t.footerNote}</p>
        </footer>
      </Reveal>
      <DataInfoModalPresence
        open={dataInfoOpen}
        onClose={closeDataInfo}
      />
    </div>
  )
}