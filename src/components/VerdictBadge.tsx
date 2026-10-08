import { cx } from '../lib/cx'
import { VERDICT_META } from '../rules/verdict'
import type { VerdictCode } from '../types/types'
import { VERDICT_TONES } from './verdictTones'

export function VerdictBadge({ code }: { code: VerdictCode }) {
  const { color, label } = VERDICT_META[code]
  const { tone, Icon } = VERDICT_TONES[color]
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-3xs rounded-control px-2xs py-3xs text-caption font-semibold',
        tone,
      )}
    >
      <Icon size={14} />
      {label}
    </span>
  )
}