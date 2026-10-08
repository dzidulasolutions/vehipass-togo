import { VerdictBadge } from '../../components/VerdictBadge'
import { formatDateTime } from '../../lib/format'
import type { ControlListItem } from '../../types/api'

export function ControlRow({ item }: { item: ControlListItem }) {
  return (
    <li className="flex items-center justify-between gap-sm py-xs">
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold tabular-nums">{item.plate ?? 'Code non reconnu'}</span>
        <span className="text-small text-muted">
          {formatDateTime(item.timestamp)}
          {item.mode === 'offline' ? ' · hors ligne' : ''}
        </span>
      </div>
      <VerdictBadge code={item.verdict} />
    </li>
  )
}