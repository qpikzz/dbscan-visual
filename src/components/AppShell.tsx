import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { scaffoldText } from '../i18n'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">{scaffoldText.logo}</span>
        <nav className="app-nav" aria-label="Основная навигация">
          <NavLink
            className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
            to="/visualization"
          >
            {scaffoldText.visualizationLabel}
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
            to="/theory"
          >
            {scaffoldText.theoryTitle}
          </NavLink>
        </nav>
        <span className="app-status">{scaffoldText.status}</span>
      </header>
      <main className="page-container">{children}</main>
    </div>
  )
}