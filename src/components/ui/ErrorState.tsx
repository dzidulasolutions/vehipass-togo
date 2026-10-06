import { toUserMessage } from '../../services/errors'
import { Button } from './Button'

export function ErrorState({
  error,
  onRetry,
  title = 'Impossible de charger les informations',
}: {
  error: unknown
  onRetry?: () => void
  title?: string
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-xs rounded-surface border border-error/30 bg-error-bg p-md"
    >
      <p className="font-semibold text-error">{title}</p>
      <p className="text-small text-foreground">{toUserMessage(error)}</p>
      {onRetry && <Button onClick={onRetry}>Réessayer</Button>}
    </div>
  )
}