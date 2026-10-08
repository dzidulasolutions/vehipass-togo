import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { IconlyLoader } from '../icons'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'ghost-inverse'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-background hover:opacity-90',
  secondary: 'border border-border bg-background text-foreground hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface',
  inverse: 'bg-background text-primary hover:opacity-90',
  'ghost-inverse': 'text-background hover:bg-background/10',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-2xs rounded-control px-sm text-body font-semibold',
        'transition-[opacity,background-color,transform] duration-150 motion-safe:active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <IconlyLoader size={18} /> : icon}
      {children}
    </button>
  )
}