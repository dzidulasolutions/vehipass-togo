import type { Penalty, PenaltyCatalogItem, PenaltyStatus } from '../types/types'
import { addDays } from './dates'

/** Transitions autorisées du cycle de vie d'un PV. PAYE et ANNULE sont définitifs. */
const TRANSITIONS: Record<PenaltyStatus, readonly PenaltyStatus[]> = {
  BROUILLON: ['VALIDE', 'ANNULE'],
  VALIDE: ['NOTIFIE', 'PAYE', 'ANNULE'],
  NOTIFIE: ['PAYE', 'CONTESTE', 'ANNULE'],
  CONTESTE: ['VALIDE', 'ANNULE'], // décision : maintenu (retour à VALIDE) ou annulé
  PAYE: [],
  ANNULE: [],
}

export function canTransition(from: PenaltyStatus, to: PenaltyStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

/** Impayé : validé, notifié ou contesté. Un brouillon n'est pas une sanction. */
const UNPAID: ReadonlySet<PenaltyStatus> = new Set(['VALIDE', 'NOTIFIE', 'CONTESTE'])

/** Payable : un PV contesté ne se paie pas tant qu'il n'est pas tranché. */
const PAYABLE: ReadonlySet<PenaltyStatus> = new Set(['VALIDE', 'NOTIFIE'])

export const isUnpaid = (p: Pick<Penalty, 'status'>): boolean => UNPAID.has(p.status)
export const isPayable = (p: Pick<Penalty, 'status'>): boolean => PAYABLE.has(p.status)

export function countUnpaid(penalties: Array<Pick<Penalty, 'status'>>): number {
  return penalties.filter(isUnpaid).length
}

/** PV à régler lors d'une réactivation : impayés non contestés. */
export function penaltiesToSettle<T extends Pick<Penalty, 'status'>>(penalties: T[]): T[] {
  return penalties.filter(isPayable)
}

/** Dernier jour pour contester : date de notification + délai (jour inclus). */
export function contestDeadline(p: Pick<Penalty, 'notified_at'>, contestDays: number): string | null {
  if (p.notified_at === null) return null
  return addDays(p.notified_at.slice(0, 10), contestDays)
}

export function canContest(
  p: Pick<Penalty, 'status' | 'contest' | 'notified_at'>,
  today: string,
  contestDays: number,
): boolean {
  if (p.status !== 'NOTIFIE' || p.contest !== null) return false
  const deadline = contestDeadline(p, contestDays)
  return deadline !== null && today <= deadline
}

export type ReactivationQuote = {
  penaltyIds: string[]
  penaltiesTotal: number
  registrationFee: number
  total: number
}

/** Facture de réactivation : PV impayés non contestés + frais. */
export function reactivationQuote(
  penalties: Array<Pick<Penalty, 'id' | 'status' | 'amount_xof'>>,
  registrationFeeXof: number,
): ReactivationQuote {
  const due = penaltiesToSettle(penalties)
  const penaltiesTotal = due.reduce((sum, p) => sum + p.amount_xof, 0)
  return {
    penaltyIds: due.map((p) => p.id),
    penaltiesTotal,
    registrationFee: registrationFeeXof,
    total: penaltiesTotal + registrationFeeXof,
  }
}

/** Le montant vient toujours du barème : l'agent ne saisit jamais de montant. */
export function priceFromCatalog(catalog: PenaltyCatalogItem[], code: string): number | null {
  return catalog.find((item) => item.code === code)?.amount_xof ?? null
}