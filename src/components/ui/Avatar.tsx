import { getInitials } from '../../lib/format'

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-background"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {getInitials(name)}
    </span>
  )
}