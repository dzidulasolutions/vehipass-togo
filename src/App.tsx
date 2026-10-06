import { Route, Routes } from 'react-router-dom'
import PrototypeBanner from './components/PrototypeBanner'
import { RequireRole } from './components/RequireRole'
import AgentLayout from './features/agent/AgentLayout'
import AgentLoginPage from './features/agent/AgentLoginPage'
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
        <Route path="/agent/connexion" element={<AgentLoginPage />} />
        <Route
          path="/agent"
          element={
            <RequireRole roles={['control_agent']} loginPath="/agent/connexion">
              <AgentLayout />
            </RequireRole>
          }
        >
          <Route index element={<AgentScanPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}