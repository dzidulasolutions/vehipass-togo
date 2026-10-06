import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed'
import { canReactivate } from './activation'
import { canContest, countUnpaid, reactivationQuote } from './penalties'

const TODAY = '2026-10-05'
const db = buildSeed(new Date('2026-10-05T10:00:00Z'))

const penaltiesOf = (vehicleId: string) => db.penalties.filter((p) => p.vehicle_id === vehicleId)
const penalty = (id: string) => {
  const found = db.penalties.find((p) => p.id === id)
  if (!found) throw new Error(`PV introuvable : ${id}`)
  return found
}
const activatedUntil = (vehicleId: string) => {
  const found = db.vehicles.find((v) => v.id === vehicleId)
  if (!found) throw new Error(`véhicule introuvable : ${vehicleId}`)
  return found.activated_until
}

describe('PV et réactivation sur les données de démo', () => {
  it('v8 : deux impayés à régler, plus les frais', () => {
    const quote = reactivationQuote(penaltiesOf('v8'), db.config.registration_fee_xof)
    expect([...quote.penaltyIds].sort()).toEqual(['pv1', 'pv2'])
    expect(quote.penaltiesTotal).toBe(15000)
    expect(quote.total).toBe(16000)
  })

  it('v8 peut être réactivé, v7 (grâce) aussi, v1 pas encore', () => {
    expect(canReactivate(activatedUntil('v8'), TODAY)).toBe(true)
    expect(canReactivate(activatedUntil('v7'), TODAY)).toBe(true)
    expect(canReactivate(activatedUntil('v1'), TODAY)).toBe(false)
  })

  it('v9 : le PV contesté est impayé mais ne bloque pas la réactivation', () => {
    expect(countUnpaid(penaltiesOf('v9'))).toBe(1)
    expect(reactivationQuote(penaltiesOf('v9'), db.config.registration_fee_xof).penaltyIds).toEqual([])
  })

  it('v2 (PV payé) et v3 (brouillon hors ligne) n’ont aucun impayé', () => {
    expect(countUnpaid(penaltiesOf('v2'))).toBe(0)
    expect(countUnpaid(penaltiesOf('v3'))).toBe(0)
  })

  it('pv1 (60 jours) n’est plus contestable, pv2 (10 jours) l’est encore', () => {
    expect(canContest(penalty('pv1'), TODAY, db.config.contest_days)).toBe(false)
    expect(canContest(penalty('pv2'), TODAY, db.config.contest_days)).toBe(true)
  })
})