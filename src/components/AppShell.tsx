import type { ReactNode } from 'react'
import { scaffoldText } from '../i18n'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">{scaffoldText.logo}</span>
        <span className="app-status">{scaffoldText.status}</span>
      </header>
      <main className="page-container">{children}</main>
    </div>
  )
}