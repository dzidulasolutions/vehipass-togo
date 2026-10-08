import { Link } from 'react-router-dom'
import { IconScan, IconlyActivity } from '../../components/icons'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton, SkeletonList, SkeletonRegion } from '../../components/ui/Skeleton'
import { useAsync } from '../../hooks/useAsync'
import { useSession } from '../../hooks/useSession'
import { toIsoDate } from '../../rules/dates'
import { api } from '../../services/api'
import { now } from '../../services/clock'
import { ControlRow } from './ControlRow'
import { summarizeControls } from './stats'

const loadControls = () => api.listMyControls()

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse gap-3xs rounded-surface bg-surface p-sm">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="font-title text-display tabular-nums">{value}</dd>
    </div>
  )
}

export default function AgentHomePage() {
  const session = useSession()
  const { state, retry } = useAsync(loadControls)
  const name = session?.name ?? ''

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex items-center justify-between gap-sm">
        <div className="flex flex-col">
          <p className="text-small text-muted">Bonjour,</p>
          <h1 className="font-title text-h1">{name}</h1>
        </div>
        <Avatar name={name} size={44} />
      </header>

      <Link
        to="/agent/scan"
        className="group flex items-center justify-between gap-sm rounded-surface bg-primary p-md text-background"
      >
        <span className="flex flex-col gap-3xs">
          <span className="text-caption tracking-wide text-background/70 uppercase">Contrôle</span>
          <span className="font-title text-h1">Scanner un QR</span>
          <span className="text-small text-background/70">Vérifier le dossier d'un véhicule</span>
        </span>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background text-primary transition-transform duration-150 motion-safe:group-hover:scale-105">
          <IconScan size={24} />
        </span>
      </Link>

      {state.status === 'loading' && (
        <SkeletonRegion className="flex flex-col gap-lg">
          <div className="grid grid-cols-3 gap-xs" aria-hidden="true">
            <Skeleton shape="surface" className="h-20" />
            <Skeleton shape="surface" className="h-20" />
            <Skeleton shape="surface" className="h-20" />
          </div>
          <SkeletonList count={4} />
        </SkeletonRegion>
      )}

      {state.status === 'error' && <ErrorState error={state.error} onRetry={retry} />}

      {state.status === 'success' && (
        <>
          <section aria-label="Aujourd'hui">
            {(() => {
              const today = summarizeControls(state.data, toIsoDate(now()))
              return (
                <dl className="grid grid-cols-3 gap-xs">
                  <Stat label="Contrôles" value={today.total} />
                  <Stat label="Conformes" value={today.compliant} />
                  <Stat label="À vérifier" value={today.attention} />
                </dl>
              )
            })()}
          </section>

          <section className="flex flex-col gap-3xs">
            <div className="flex items-center justify-between">
              <h2 className="text-h2">Derniers contrôles</h2>
              {state.data.length > 0 && (
                <Link to="/agent/historique" className="text-small font-semibold underline">
                  Voir tout
                </Link>
              )}
            </div>
            {state.data.length === 0 ? (
              <EmptyState
                icon={<IconlyActivity size={24} />}
                title="Aucun contrôle pour l'instant"
                description="Vos contrôles apparaîtront ici dès que vous aurez scanné un QR."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {state.data.slice(0, 5).map((item) => (
                  <ControlRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}