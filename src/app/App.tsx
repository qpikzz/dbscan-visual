import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { LanguageProvider } from '../i18n'
import { VisualizationPage } from '../pages/VisualizationPage'

const TheoryPage = lazy(() =>
  import('../pages/TheoryPage').then((module) => ({ default: module.TheoryPage })),
)

export function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/visualization" replace />} />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route
              path="/theory"
              element={
                <Suspense fallback={null}>
                  <TheoryPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/visualization" replace />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </LanguageProvider>
  )
}