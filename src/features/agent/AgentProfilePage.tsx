import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconlyLogout } from '../../components/icons'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { env } from '../../config/env'
import { useSession } from '../../hooks/useSession'
import { api } from '../../services/api'
import { clearSession } from '../../services/session'
import { DemoTools } from './DemoTools'

export default function AgentProfilePage() {
  const session = useSession()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const name = session?.name ?? ''

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
    <div className="flex flex-col gap-lg">
      <header className="flex flex-col items-center gap-xs pt-md text-center">
        <Avatar name={name} size={72} />
        <div className="flex flex-col gap-3xs">
          <h1 className="font-title text-h1">{name}</h1>
          <p className="text-small text-muted">Agent de contrôle</p>
        </div>
      </header>

      <dl className="flex flex-col divide-y divide-border rounded-surface bg-surface px-md">
        <div className="flex items-center justify-between py-sm">
          <dt className="text-small text-muted">Données</dt>
          <dd className="font-semibold">{env.VITE_API_MODE === 'mock' ? 'Simulées (démo)' : 'Serveur'}</dd>
        </div>
      </dl>

      {env.VITE_API_MODE === 'mock' && <DemoTools />}

      <Button
        variant="secondary"
        fullWidth
        loading={loggingOut}
        icon={<IconlyLogout size={20} />}
        onClick={handleLogout}
      >
        Se déconnecter
      </Button>
    </div>
  )
}