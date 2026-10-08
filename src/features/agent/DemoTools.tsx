import { useState, useSyncExternalStore } from 'react'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/format'
import { toIsoDate } from '../../rules/dates'
import { advanceDays, now, resetClock } from '../../services/clock'
import { resetDemo } from '../../services/demo'
import { getNetwork, setNetwork, subscribeNetwork } from '../../services/network'

export function DemoTools() {
  const network = useSyncExternalStore(subscribeNetwork, getNetwork)
  const [, refresh] = useState(0)

  return (
    <section className="flex flex-col gap-xs rounded-surface bg-surface p-md">
      <div className="flex flex-col gap-3xs">
        <h2 className="text-h2">Outils de démonstration</h2>
        <p className="text-small text-muted">Pour tester les cas limites sans attendre.</p>
      </div>

      <label className="flex min-h-11 items-center justify-between gap-sm text-body">
        Simuler un réseau coupé
        <input
          type="checkbox"
          className="size-5"
          checked={network === 'offline'}
          onChange={(event) => setNetwork(event.target.checked ? 'offline' : 'online')}
        />
      </label>

      <div className="flex flex-col gap-2xs">
        <p className="text-small text-muted">
          Date simulée : <span className="font-semibold tabular-nums text-foreground">{formatDate(toIsoDate(now()))}</span>
        </p>
        <div className="flex gap-2xs">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              advanceDays(30)
              refresh((n) => n + 1)
            }}
          >
            +30 jours
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              resetClock()
              refresh((n) => n + 1)
            }}
          >
            Aujourd'hui
          </Button>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          resetDemo()
          window.location.reload()
        }}
      >
        Réinitialiser les données
      </Button>
    </section>
  )
}