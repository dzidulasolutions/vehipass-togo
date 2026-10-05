import { useSyncExternalStore } from 'react'
import {
  FiCheckCircle,
  FiXCircle,
  IconlyActivity,
  IconlyAddUser,
  IconlyChart,
  IconlyDocument,
  IconlyHome,
  IconlyLoader,
  IconlySearch,
  IconlyUser,
  IconlyWallet,
} from '../components/icons'
import { ErrorState } from '../components/ui/ErrorState'
import {
  SkeletonCard,
  SkeletonList,
  SkeletonProfile,
  SkeletonRegion,
} from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { api } from '../services/api'
import { getNetwork, setNetwork, subscribeNetwork } from '../services/network'

const ICONS = [
  IconlyHome, IconlySearch, IconlyUser, IconlyAddUser, IconlyDocument, IconlyWallet,
  IconlyActivity, IconlyChart, FiCheckCircle, FiXCircle, IconlyLoader,
]

const loadAppInfo = () => api.getAppInfo()

function ApiSection() {
  const { state, retry } = useAsync(loadAppInfo)
  const network = useSyncExternalStore(subscribeNetwork, getNetwork)

  return (
    <section className="flex flex-col gap-sm">
      <h2 className="text-h2">Données (API)</h2>

      <div className="flex flex-wrap items-center gap-sm">
        <label className="flex min-h-11 items-center gap-xs text-small">
          <input
            type="checkbox"
            checked={network === 'offline'}
            onChange={(event) => setNetwork(event.target.checked ? 'offline' : 'online')}
          />
          Simuler un réseau coupé
        </label>
        <button
          type="button"
          onClick={retry}
          className="min-h-11 rounded-control border border-border px-sm text-small font-semibold hover:bg-surface"
        >
          Relancer l'appel
        </button>
      </div>

      {state.status === 'loading' && (
        <SkeletonRegion>
          <SkeletonCard lines={2} />
        </SkeletonRegion>
      )}
      {state.status === 'error' && <ErrorState error={state.error} onRetry={retry} />}
      {state.status === 'success' && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-md gap-y-3xs rounded-surface border border-border bg-surface p-md text-small">
          <dt className="text-muted">Mode</dt>
          <dd className="font-semibold">{state.data.mode}</dd>
          <dt className="text-muted">Version</dt>
          <dd>{state.data.version}</dd>
          <dt className="text-muted">Heure du serveur</dt>
          <dd className="tabular-nums">{state.data.serverTime}</dd>
        </dl>
      )}
    </section>
  )
}

export default function Showcase() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-lg p-md">
      <header className="flex flex-col gap-3xs">
        <p className="font-righteous text-display">VéhiPass</p>
        <p className="text-muted">Fondations : styles, polices, icônes, squelettes et API.</p>
      </header>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Typographie</h2>
        <p className="font-title text-h1">Titre h1 (24 px)</p>
        <p className="text-body">Texte courant (15 px), lisible en plein soleil.</p>
        <p className="text-small text-muted">Texte secondaire (13 px)</p>
        <p className="text-caption text-muted">Métadonnée (11 px)</p>
        <p className="text-numeric tabular-nums">5 000 F — 10 000 F — 15 000 F</p>
      </section>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Couleurs</h2>
        <div className="flex flex-wrap gap-xs text-small">
          <span className="rounded-control bg-primary px-xs py-2xs text-background">Primaire</span>
          <span className="rounded-control border border-border bg-surface px-xs py-2xs">Surface</span>
          <span className="rounded-control bg-success-bg px-xs py-2xs text-success">Succès</span>
          <span className="rounded-control bg-warning-bg px-xs py-2xs text-warning">Alerte</span>
          <span className="rounded-control bg-error-bg px-xs py-2xs text-error">Erreur</span>
        </div>
      </section>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Icônes</h2>
        <div className="flex flex-wrap gap-sm text-foreground">
          {ICONS.map((Icon, i) => (
            <Icon key={i} size={24} />
          ))}
        </div>
      </section>

      <ApiSection />

      <section className="flex flex-col gap-sm">
        <h2 className="text-h2">Chargement</h2>
        <SkeletonRegion className="flex flex-col gap-md">
          <SkeletonProfile />
          <SkeletonCard />
          <SkeletonList count={3} />
        </SkeletonRegion>
      </section>
    </main>
  )
}