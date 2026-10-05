import type { HTMLAttributes, ReactNode } from 'react'

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const RADIUS = {
  control: 'rounded-control',
  surface: 'rounded-surface',
  full: 'rounded-full',
} as const

type SkeletonProps = HTMLAttributes<HTMLDivElement> & { shape?: keyof typeof RADIUS }

/** Brique de base : un bloc gris qui pulse. L'animation est coupée si l'utilisateur réduit les animations. */
export function Skeleton({ shape = 'control', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx('bg-border motion-safe:animate-pulse', RADIUS[shape], className)}
      {...rest}
    />
  )
}

/** Zone de chargement annoncée une seule fois aux lecteurs d'écran. */
export function SkeletonRegion({
  label = 'Chargement en cours',
  className,
  children,
}: {
  label?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/** Paragraphe : la dernière ligne est plus courte, comme un vrai texte. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-2xs', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cx('h-3', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton shape="full" className="shrink-0" style={{ width: size, height: size }} />
}

/** Profil : avatar + nom + sous-titre. */
export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-xs', className)} aria-hidden="true">
      <SkeletonAvatar />
      <div className="flex flex-1 flex-col gap-2xs">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/** Carte : titre + texte. */
export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('flex flex-col gap-sm rounded-surface border border-border bg-surface p-md', className)}
    >
      <Skeleton className="h-4 w-1/2" />
      <SkeletonText lines={lines} />
    </div>
  )
}

/** Ligne de liste : avatar + deux lignes + valeur à droite. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-xs py-xs" aria-hidden="true">
      <SkeletonAvatar size={36} />
      <div className="flex flex-1 flex-col gap-2xs">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-3.5 w-12" />
    </div>
  )
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}