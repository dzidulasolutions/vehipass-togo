import { describe, expect, it } from 'vitest'
import type { Penalty, PenaltyStatus } from '../types/types'
import {
  canContest,
  canTransition,
  contestDeadline,
  countUnpaid,
  isPayable,
  penaltiesToSettle,
  priceFromCatalog,
  reactivationQuote,
} from './penalties'

const ALL_STATUSES: PenaltyStatus[] = ['BROUILLON', 'VALIDE', 'NOTIFIE', 'CONTESTE', 'PAYE', 'ANNULE']

const penalty = (overrides: Partial<Penalty> = {}): Penalty => ({
  id: 'pv',
  vehicle_id: 'v1',
  catalog_code: 'CASQUE',
  amount_xof: 5000,
  agent_id: 'u_agent1',
  status: 'NOTIFIE',
  created_at: '2026-10-01T10:00:00Z',
  notified_at: '2026-10-01T10:05:00Z',
  origin: 'online',
  contest: null,
  payment_id: null,
  ...overrides,
})

describe('canTransition', () => {
  it.each([
    ['BROUILLON', 'VALIDE', true],
    ['BROUILLON', 'NOTIFIE', false],
    ['BROUILLON', 'PAYE', false],
    ['VALIDE', 'NOTIFIE', true],
    ['VALIDE', 'PAYE', true],
    ['NOTIFIE', 'PAYE', true],
    ['NOTIFIE', 'CONTESTE', true],
    ['NOTIFIE', 'BROUILLON', false],
    ['CONTESTE', 'ANNULE', true],
    ['CONTESTE', 'VALIDE', true],
    ['CONTESTE', 'PAYE', false],
  ] as const)('%s → %s : %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected)
  })

  it('un PV payé ou annulé est définitif', () => {
    for (const to of ALL_STATUSES) {
      expect(canTransition('PAYE', to)).toBe(false)
      expect(canTransition('ANNULE', to)).toBe(false)
    }
  })
})

describe('impayés', () => {
  const all = ALL_STATUSES.map((status) => penalty({ id: status, status }))

  it('compte validés, notifiés et contestés, jamais les brouillons', () => {
    expect(countUnpaid(all)).toBe(3)
  })

  it('ne retient pour la réactivation que les impayés non contestés', () => {
    expect(penaltiesToSettle(all).map((p) => p.status).sort()).toEqual(['NOTIFIE', 'VALIDE'])
  })

  it('un PV contesté n’est pas payable', () => {
    expect(isPayable(penalty({ status: 'CONTESTE' }))).toBe(false)
    expect(isPayable(penalty({ status: 'NOTIFIE' }))).toBe(true)
  })
})

describe('contestation', () => {
  // Notifié le 2026-10-01 : avec 30 jours, dernier jour = 2026-10-31.
  it('calcule le dernier jour de contestation', () => {
    expect(contestDeadline(penalty(), 30)).toBe('2026-10-31')
    expect(contestDeadline(penalty({ notified_at: null }), 30)).toBeNull()
  })

  it('est possible dans le délai, y compris le dernier jour', () => {
    expect(canContest(penalty(), '2026-10-05', 30)).toBe(true)
    expect(canContest(penalty(), '2026-10-31', 30)).toBe(true)
  })

  it('est impossible après le délai', () => {
    expect(canContest(penalty(), '2026-11-01', 30)).toBe(false)
  })

  it('est impossible si le PV est déjà contesté, payé ou jamais notifié', () => {
    const contest = { reason: 'motif', created_at: '2026-10-02T10:00:00Z', decision: null }
    expect(canContest(penalty({ contest }), '2026-10-05', 30)).toBe(false)
    expect(canContest(penalty({ status: 'CONTESTE', contest }), '2026-10-05', 30)).toBe(false)
    expect(canContest(penalty({ status: 'PAYE' }), '2026-10-05', 30)).toBe(false)
    expect(canContest(penalty({ notified_at: null }), '2026-10-05', 30)).toBe(false)
  })
})

describe('reactivationQuote', () => {
  it('additionne les PV à régler et les frais, sans les PV contestés', () => {
    const quote = reactivationQuote(
      [
        penalty({ id: 'a', status: 'NOTIFIE', amount_xof: 5000 }),
        penalty({ id: 'b', status: 'VALIDE', amount_xof: 10000 }),
        penalty({ id: 'c', status: 'CONTESTE', amount_xof: 15000 }),
        penalty({ id: 'd', status: 'PAYE', amount_xof: 5000 }),
        penalty({ id: 'e', status: 'BROUILLON', amount_xof: 5000 }),
      ],
      1000,
    )
    expect(quote).toEqual({
      penaltyIds: ['a', 'b'],
      penaltiesTotal: 15000,
      registrationFee: 1000,
      total: 16000,
    })
  })

  it('se limite aux frais quand il n’y a aucun impayé', () => {
    expect(reactivationQuote([], 1000)).toMatchObject({ penaltiesTotal: 0, total: 1000 })
  })
})

describe('priceFromCatalog', () => {
  const catalog = [{ code: 'CASQUE', label: 'Casque', amount_xof: 5000, legal_ref: 'Texte fictif' }]

  it('retourne le montant du barème', () => {
    expect(priceFromCatalog(catalog, 'CASQUE')).toBe(5000)
  })

  it('retourne null pour un code inconnu (jamais de montant libre)', () => {
    expect(priceFromCatalog(catalog, 'INCONNU')).toBeNull()
  })
})