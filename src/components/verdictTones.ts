import type { ComponentType } from 'react'
import type { VerdictColor } from '../types/types'
import { FiCheckCircle, FiXCircle, IconAlert, IconInfo } from './icons'

/** La couleur ne porte jamais seule le sens : chaque verdict a aussi une icône et un texte. */
export const VERDICT_TONES: Record<VerdictColor, { tone: string; Icon: ComponentType<{ size?: number }> }> = {
  vert: { tone: 'bg-success-bg text-success', Icon: FiCheckCircle },
  orange: { tone: 'bg-warning-bg text-warning', Icon: IconAlert },
  rouge: { tone: 'bg-error-bg text-error', Icon: FiXCircle },
  gris: { tone: 'bg-surface text-foreground', Icon: IconInfo },
}