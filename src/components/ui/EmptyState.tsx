import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-xs rounded-surface bg-surface px-md py-lg text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted">{icon}</span>
      <p className="font-semibold">{title}</p>
      <p className="max-w-xs text-small text-muted">{description}</p>
      {action}
    </div>
  )
}