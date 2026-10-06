import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { IconlyLogout } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { useSession } from '../../hooks/useSession'
import { api } from '../../services/api'
import { clearSession } from '../../services/session'

export default function AgentLayout() {
  const session = useSession()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.logout()
    } catch {
      clearSession() // réseau coupé : on ferme au moins la session locale
    }
    navigate('/agent/connexion', { replace: true })
  }

  return (
    <>
      <header className="flex items-center justify-between px-sm py-2xs">
        <span className="font-righteous text-h2">VéhiPass</span>
        <div className="flex items-center gap-2xs">
          <span className="text-small text-muted">{session?.name}</span>
          <Button
            variant="ghost"
            aria-label="Se déconnecter"
            title="Se déconnecter"
            onClick={handleLogout}
            loading={loggingOut}
            icon={<IconlyLogout size={20} />}
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 p-sm">
        <Outlet />
      </main>
    </>
  )
}