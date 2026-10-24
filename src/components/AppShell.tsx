import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../i18n'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { usePageMeta } from '../hooks/usePageMeta'
import { socialLinks } from '../config/socialLinks'
import { FOOTER_COPYRIGHT_YEAR } from '../config/footer'
import { theorySections } from '../data/theory'
import cat from '../assets/cat.svg'
import { Reveal } from './Reveal'
import { FooterIcon } from './FooterIcon'
import { LogoMark } from './LogoMark'
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

function getRequiredTheorySection(id: string) {
  const section = theorySections.find((item) => item.id === id)
  if (!section) {
    throw new Error(`Footer link references missing theory section: ${id}`)
  }
  return section
}

const theoryWalkthrough = getRequiredTheorySection('theory-walkthrough')
const theorySummary = getRequiredTheorySection('theory-summary')

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
              <LogoMark />
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
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-brand-name">
                <LogoMark />
                <span>{t.footerBrandName}</span>
              </div>
              <p className="footer-brand-note">{t.footerLove}</p>
              <img className="footer-cat" src={cat} alt="" aria-hidden="true" />
            </div>
            <nav className="footer-group" aria-labelledby="footer-site-title">
              <p className="footer-group-title" id="footer-site-title">
                {t.footerSiteTitle}
              </p>
              <div className="footer-link-list">
                <Link className="footer-link" to="/visualization">
                  <span className="footer-link-icon"><FooterIcon name="visualization" /></span>
                  <span>{t.visualLabel}</span>
                </Link>
                <Link className="footer-link" to="/theory">
                  <span className="footer-link-icon"><FooterIcon name="theory" /></span>
                  <span>{t.theoryLabel}</span>
                </Link>
                <Link
                  className="footer-link"
                  to={{ pathname: '/theory', hash: `#${theoryWalkthrough.id}` }}
                >
                  <span className="footer-link-icon"><FooterIcon name="steps" /></span>
                  <span>{t[theoryWalkthrough.titleKey]}</span>
                </Link>
                <Link
                  className="footer-link"
                  to={{ pathname: '/theory', hash: `#${theorySummary.id}` }}
                >
                  <span className="footer-link-icon"><FooterIcon name="summary" /></span>
                  <span>{t[theorySummary.titleKey]}</span>
                </Link>
              </div>
            </nav>
            <section className="footer-group" aria-labelledby="footer-author-title">
              <p className="footer-group-title" id="footer-author-title">
                {t.footerAuthorTitle}
              </p>
              <div className="footer-link-list">
                <a
                  className="footer-link"
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.footerTelegram} ${t.footerExternalNewTab}`}
                >
                  <span className="footer-link-icon"><FooterIcon name="telegram" /></span>
                  <span>{t.footerTelegram}</span>
                </a>
                <a
                  className="footer-link"
                  href={socialLinks.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.footerVk} ${t.footerExternalNewTab}`}
                >
                  <span className="footer-link-icon"><FooterIcon name="vk" /></span>
                  <span>{t.footerVk}</span>
                </a>
                <a
                  className="footer-link"
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.footerGithub} ${t.footerExternalNewTab}`}
                >
                  <span className="footer-link-icon"><FooterIcon name="github" /></span>
                  <span>{t.footerGithub}</span>
                </a>
              </div>
              <p className="footer-availability">{t.footerAvailability}</p>
            </section>
            <section className="footer-group" aria-labelledby="footer-more-title">
              <p className="footer-group-title" id="footer-more-title">
                {t.footerMoreTitle}
              </p>
              <div className="footer-link-list">
                <button className="footer-link" type="button" onClick={openSupport}>
                  <span className="footer-link-icon"><FooterIcon name="heart" /></span>
                  <span>{t.footerSupport}</span>
                </button>
                <button
                  className="footer-link"
                  type="button"
                  ref={dataInfoTriggerRef}
                  onClick={openDataInfo}
                >
                  <span className="footer-link-icon"><FooterIcon name="shield" /></span>
                  <span>{t.footerDataInfo}</span>
                </button>
              </div>
            </section>
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom">
            <p className="footer-copyright">
              {t.footerCopyright(FOOTER_COPYRIGHT_YEAR, t.footerCopyrightAuthor)}
            </p>
            <p className="footer-note">{t.footerNote}</p>
          </div>
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