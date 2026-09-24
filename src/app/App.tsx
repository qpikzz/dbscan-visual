import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { TheoryPage } from '../pages/TheoryPage'
import { VisualizationPage } from '../pages/VisualizationPage'

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/visualization" replace />} />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="*" element={<Navigate to="/visualization" replace />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}