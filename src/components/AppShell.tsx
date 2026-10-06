import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Reveal } from './Reveal'

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
  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const warningOpen = warningCountdown !== null

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
      <header className="app-header">
        <h1 className="app-logo">
          <svg className="app-logo-mark" aria-hidden="true" viewBox="0 0 28 28">
            <path d="M14 2.8c6.5 0 11 4.7 11.1 11s-4.7 11.3-11 11.2S2.8 20.4 2.9 14 7.6 2.9 14 2.8Z" />
            <path className="logo-mark-inner" d="M14 7.3c4 .1 6.7 2.9 6.6 6.7s-2.9 6.8-6.7 6.7-6.7-3-6.6-6.8 2.9-6.7 6.7-6.6Z" />
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
            <div className="theme-toggle-anchor">
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
              {warningCountdown !== null && (
                <div
                  className="theme-warning-popover"
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby="theme-warning-message"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      cancelThemeSwitch()
                    }
                  }}
                >
                  <p
                    className="theme-warning-message"
                    id="theme-warning-message"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {t.themeWarningMessage.replace('{count}', String(warningCountdown))}
                  </p>
                  <button
                    className="theme-warning-cancel"
                    type="button"
                    ref={cancelButtonRef}
                    onClick={cancelThemeSwitch}
                  >
                    {t.themeWarningCancel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
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
              <a className="footer-author-link" href="#" onClick={(event) => event.preventDefault()}>
                {t.footerTelegram}
              </a>
              <a className="footer-author-link" href="#" onClick={(event) => event.preventDefault()}>
                {t.footerVk}
              </a>
              <a className="footer-author-link" href="#" onClick={(event) => event.preventDefault()}>
                {t.footerGithub}
              </a>
            </div>
            <div className="footer-mark" aria-hidden="true" />
            <p className="footer-love">{t.footerLove}</p>
          </div>
          <p className="footer-note">{t.footerNote}</p>
        </footer>
      </Reveal>
    </div>
  )
}