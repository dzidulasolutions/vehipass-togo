import type { ActivationStatus } from '../types/types'
import { addDays, addMonths, daysBetween } from './dates'

/** Même durée que le premier rappel SMS (J-30). */
export const RENEWAL_WINDOW_DAYS = 30

export type ActivationInfo = {
  status: ActivationStatus
  /** Jours écoulés depuis l'échéance (0 tant que le dossier est actif). */
  daysSinceExpiry: number
  /** Jours de grâce restants (uniquement en période de grâce). */
  graceDaysLeft: number | null
}

/**
 * Activité du dossier : ACTIVE jusqu'à l'échéance incluse, puis GRACE pendant `graceDays` jours
 * (le dernier jour de grâce compte encore), puis REACTIVATION_REQUISE.
 */
export function getActivation(activatedUntil: string, today: string, graceDays: number): ActivationInfo {
  const daysSinceExpiry = daysBetween(activatedUntil, today)
  if (daysSinceExpiry <= 0) return { status: 'ACTIVE', daysSinceExpiry: 0, graceDaysLeft: null }
  if (daysSinceExpiry <= graceDays) {
    return { status: 'GRACE', daysSinceExpiry, graceDaysLeft: graceDays - daysSinceExpiry }
  }
  return { status: 'REACTIVATION_REQUISE', daysSinceExpiry, graceDaysLeft: null }
}

/** Réactivation possible dès 30 jours avant l'échéance, puis à tout moment. */
export function canReactivate(activatedUntil: string, today: string): boolean {
  return today >= addDays(activatedUntil, -RENEWAL_WINDOW_DAYS)
}

/**
 * Nouvelle échéance : `months` mois à partir de la plus tardive entre l'ancienne échéance et aujourd'hui.
 * Renouveler en avance ne fait donc rien perdre ; réactiver en retard repart de la date du jour.
 */
export function nextActivationUntil(activatedUntil: string, today: string, months: number): string {
  const base = activatedUntil > today ? activatedUntil : today
  return addMonths(base, months)
}