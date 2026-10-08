import { useState } from 'react'
import { IconlyActivity } from '../../components/icons'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SkeletonList, SkeletonRegion } from '../../components/ui/Skeleton'
import { useAsync } from '../../hooks/useAsync'
import { cx } from '../../lib/cx'
import { formatDayLabel } from '../../lib/format'
import { toIsoDate } from '../../rules/dates'
import { api } from '../../services/api'
import { now } from '../../services/clock'
import { ControlRow } from './ControlRow'
import { filterControls, groupByDay, type ControlFilter } from './stats'

const loadControls = () => api.listMyControls()

const FILTERS: Array<{ id: ControlFilter; label: string }> = [
  { id: 'all', label: 'Tous' },
  { id: 'compliant', label: 'Conformes' },
  { id: 'attention', label: 'À vérifier' },
]

export default function AgentHistoryPage() {
  const { state, retry } = useAsync(loadControls)
  const [filter, setFilter] = useState<ControlFilter>('all')

  return (
    <div className="flex flex-col gap-md">
      <header className="flex flex-col gap-3xs">
        <h1 className="font-title text-h1">Historique</h1>
        <p className="text-small text-muted">Vos contrôles, du plus récent au plus ancien.</p>
      </header>

      <div className="flex gap-2xs" role="group" aria-label="Filtrer par résultat">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cx(
              'min-h-11 rounded-control px-sm text-small font-semibold transition-colors',
              filter === item.id ? 'bg-primary text-background' : 'bg-surface text-foreground hover:bg-border',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {state.status === 'loading' && (
        <SkeletonRegion>
          <SkeletonList count={6} />
        </SkeletonRegion>
      )}
      {state.status === 'error' && <ErrorState error={state.error} onRetry={retry} />}
      {state.status === 'success' &&
        (() => {
          const groups = groupByDay(filterControls(state.data, filter))
          if (groups.length === 0) {
            return (
              <EmptyState
                icon={<IconlyActivity size={24} />}
                title="Aucun contrôle à afficher"
                description="Aucun contrôle ne correspond à ce filtre."
              />
            )
          }
          const today = toIsoDate(now())
          return (
            <div className="flex flex-col gap-md">
              {groups.map((group) => (
                <section key={group.day} className="flex flex-col gap-3xs">
                  <h2 className="text-caption font-semibold tracking-wide text-muted uppercase">
                    {formatDayLabel(group.day, today)}
                  </h2>
                  <ul className="flex flex-col divide-y divide-border">
                    {group.items.map((item) => (
                      <ControlRow key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )
        })()}
    </div>
  )
}