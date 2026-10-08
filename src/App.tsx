import { Route, Routes } from 'react-router-dom'
import PrototypeBanner from './components/PrototypeBanner'
import { RequireRole } from './components/RequireRole'
import AgentHistoryPage from './features/agent/AgentHistoryPage'
import AgentHomePage from './features/agent/AgentHomePage'
import AgentLayout from './features/agent/AgentLayout'
import AgentLoginPage from './features/agent/AgentLoginPage'
import AgentOnboardingPage from './features/agent/AgentOnboardingPage'
import AgentProfilePage from './features/agent/AgentProfilePage'
import AgentScanPage from './features/agent/AgentScanPage'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import Showcase from './pages/Showcase'

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PrototypeBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fondations" element={<Showcase />} />
        <Route path="/agent/bienvenue" element={<AgentOnboardingPage />} />
        <Route path="/agent/connexion" element={<AgentLoginPage />} />
        <Route
          path="/agent"
          element={
            <RequireRole roles={['control_agent']} loginPath="/agent/connexion">
              <AgentLayout />
            </RequireRole>
          }
        >
          <Route index element={<AgentHomePage />} />
          <Route path="scan" element={<AgentScanPage />} />
          <Route path="historique" element={<AgentHistoryPage />} />
          <Route path="profil" element={<AgentProfilePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}