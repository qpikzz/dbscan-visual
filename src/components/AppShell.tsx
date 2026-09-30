import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
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
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-logo">{t.logo}</h1>
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
            className="theme-toggle"
            type="button"
            aria-label={t.themeToggleLabel}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
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
      </header>
      <nav className="page-switcher" aria-label={t.pageSwitcherLabel}>
        <NavLink className="page-switcher-link" to="/visualization">
          <span>{t.visualLabel}</span>
          <span className="page-switcher-line" aria-hidden="true" />
        </NavLink>
        <NavLink className="page-switcher-link" to="/theory">
          <span>{t.theoryLabel}</span>
          <span className="page-switcher-line" aria-hidden="true" />
        </NavLink>
      </nav>
      <main className="page-container">
        {children}
      </main>
      <Reveal>
        <footer className="app-footer">
          <div className="footer-zones">
            <div className="footer-author">
              <span>{t.footerAuthor}</span>
              <a href="#" onClick={(event) => event.preventDefault()}>
                {t.footerTelegram}
              </a>
              <a href="#" onClick={(event) => event.preventDefault()}>
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