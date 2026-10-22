import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../i18n'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { usePageMeta } from '../hooks/usePageMeta'
import { socialLinks } from '../config/socialLinks'
import { Reveal } from './Reveal'
import { DataInfoModalPresence } from './DataInfoModal'
import { SupportModalPresence } from './SupportModal'
import { SegmentedControl } from './SegmentedControl'

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
  usePageMeta()
  const [theme, setTheme] = useLocalStorage<Theme>('dbscan-theme', getInitialTheme())
  const [lightThemeWarningShown, setLightThemeWarningShown] = useState(false)
  const [warningCountdown, setWarningCountdown] = useState<number | null>(null)
  const [dataInfoOpen, setDataInfoOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const closeDataInfo = useCallback(() => setDataInfoOpen(false), [])
  const closeSupport = useCallback(() => setSupportOpen(false), [])
  const openDataInfo = useCallback(() => {
    setSupportOpen(false)
    setDataInfoOpen(true)
  }, [])
  const openSupport = useCallback(() => {
    setDataInfoOpen(false)
    setSupportOpen(true)
  }, [])
  const { language, setLanguage, t } = useLanguage()
  const { reduced, transition } = useMotionSettings()
  const location = useLocation()
  const previousPathnameRef = useRef(location.pathname)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const dataInfoTriggerRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
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

  useLayoutEffect(() => {
    const previousPathname = previousPathnameRef.current
    previousPathnameRef.current = location.pathname

    if (previousPathname === '/theory' && location.pathname === '/visualization') {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

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

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuPanelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return
      }
      setMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!isMobile && menuOpen) {
      setMenuOpen(false)
    }
  }, [isMobile, menuOpen])

  const toggleTheme = (button: HTMLButtonElement) => {
    if (theme === 'dark' && !lightThemeWarningShown) {
      returnFocusRef.current = button
      // The countdown notification lives in-flow below the header, where the
      // open menu panel would cover it: close the menu so it stays visible.
      setMenuOpen(false)
      setWarningCountdown(3)
      return
    }

    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const cancelThemeSwitch = () => {
    setWarningCountdown(null)
  }

  const menuMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.98 },
      }

  const pageSwitcher = (
    <nav className="page-switcher" aria-label={t.pageSwitcherLabel}>
      <NavLink
        className={({ isActive }) =>
          isActive ? 'page-switcher-option active' : 'page-switcher-option'
        }
        to="/visualization"
        onClick={() => setMenuOpen(false)}
      >
        {t.visualLabel}
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          isActive ? 'page-switcher-option active' : 'page-switcher-option'
        }
        to="/theory"
        onClick={() => setMenuOpen(false)}
      >
        {t.theoryLabel}
      </NavLink>
    </nav>
  )

  const headerControls = (
    <div className="app-controls">
      <SegmentedControl
        ariaLabel={t.languageLabel}
        layoutId="language-switcher-highlight"
        value={language}
        onChange={setLanguage}
        options={[
          { value: 'ru', label: t.languageRu },
          { value: 'en', label: t.languageEn },
        ]}
      />
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
  )

  return (
    <div className="app-shell">
      <div className="header-area">
        <header className="app-header">
          <div className="app-logo" aria-label={t.logo}>
            <svg className="app-logo-mark" aria-hidden="true" viewBox="0 0 128 128">
              <circle className="logo-mark-ring" cx="64" cy="64" r="60" />
              <circle className="logo-mark-center" cx="64" cy="64" r="32" />
            </svg>
            <span>{t.logo}</span>
          </div>
          {isMobile ? (
            <>
              <button
                className="menu-toggle"
                type="button"
                ref={menuButtonRef}
                aria-expanded={menuOpen}
                aria-controls="header-menu"
                aria-label={t.headerMenuLabel}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="menu-icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    id="header-menu"
                    ref={menuPanelRef}
                    className="header-menu"
                    {...menuMotion}
                    transition={transition(0.25)}
                    style={{ transformOrigin: 'top center' }}
                  >
                    {pageSwitcher}
                    {headerControls}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="header-actions">
              {pageSwitcher}
              {headerControls}
            </div>
          )}
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
                <svg className="footer-author-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M21.5 4.5 2.8 11.9a.6.6 0 0 0 .06 1.13l4.28 1.34 1.6 5.03a.6.6 0 0 0 1.04.23l2.2-2.4 4.3 3.16a.6.6 0 0 0 .94-.36l3.1-14.6a.6.6 0 0 0-.81-.68Z" />
                  <path d="m7.14 14.37 10.2-7.5-7.6 8.06" />
                </svg>
                {t.footerTelegram}
              </a>
              <a className="footer-author-link" href={socialLinks.vk}>
                <svg className="footer-author-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4 5.5 8.2 18.5 12.4 5.5" />
                  <path d="M15.5 5.5v13" />
                  <path d="M21.5 5.5 15.5 12l6 7" />
                </svg>
                {t.footerVk}
              </a>
              <a className="footer-author-link" href="https://github.com/qpikzz">
                <svg className="footer-author-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                {t.footerGithub}
              </a>
              <button
                className="footer-author-link footer-data-info-trigger"
                type="button"
                ref={dataInfoTriggerRef}
                onClick={openDataInfo}
              >
                <svg className="footer-author-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 3 19 6v5c0 4.4-2.8 8.2-7 10-4.2-1.8-7-5.6-7-10V6l7-3Z" />
                  <path d="m8.8 12.1 2.1 2.1 4.4-4.5" />
                </svg>
                {t.footerDataInfo}
              </button>
              <button
                className="footer-author-link footer-support-trigger"
                type="button"
                onClick={openSupport}
              >
                <svg className="footer-author-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
                </svg>
                {t.footerSupport}
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
      <SupportModalPresence
        open={supportOpen}
        onClose={closeSupport}
      />
    </div>
  )
}