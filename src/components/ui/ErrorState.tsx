import { toUserMessage } from '../../services/errors'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-xs rounded-surface border border-error/30 bg-error-bg p-md"
    >
      <p className="font-semibold text-error">Impossible de charger les informations</p>
      <p className="text-small text-foreground">{toUserMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-control bg-primary px-sm text-small font-semibold text-background transition-opacity hover:opacity-90"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}