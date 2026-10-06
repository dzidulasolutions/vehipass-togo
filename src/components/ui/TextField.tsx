import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  error?: string
  hint?: string
  /** Élément placé à droite du champ (par exemple « afficher le mot de passe »). */
  trailing?: ReactNode
}

export function TextField({ label, error, hint, trailing, className, ...rest }: TextFieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-3xs">
      <label htmlFor={id} className="text-small font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'min-h-11 w-full rounded-control border bg-background px-xs text-body placeholder:text-muted',
            error ? 'border-error' : 'border-border',
            trailing ? 'pr-12' : undefined,
            className,
          )}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-small text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}