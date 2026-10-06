import { describe, expect, it } from 'vitest'
import { canReactivate, getActivation, nextActivationUntil } from './activation'

const TODAY = '2026-10-05'
const GRACE = 15

describe('getActivation', () => {
  it('est ACTIVE avant l’échéance et le jour même', () => {
    expect(getActivation('2026-12-01', TODAY, GRACE).status).toBe('ACTIVE')
    expect(getActivation(TODAY, TODAY, GRACE).status).toBe('ACTIVE')
  })

  it('passe en GRACE le lendemain de l’échéance', () => {
    expect(getActivation('2026-10-04', TODAY, GRACE)).toEqual({
      status: 'GRACE',
      daysSinceExpiry: 1,
      graceDaysLeft: 14,
    })
  })

  it('compte encore le 15e jour comme grâce', () => {
    expect(getActivation('2026-09-20', TODAY, GRACE)).toEqual({
      status: 'GRACE',
      daysSinceExpiry: 15,
      graceDaysLeft: 0,
    })
  })

  it('exige la réactivation à partir du 16e jour', () => {
    const info = getActivation('2026-09-19', TODAY, GRACE)
    expect(info.status).toBe('REACTIVATION_REQUISE')
    expect(info.daysSinceExpiry).toBe(16)
    expect(info.graceDaysLeft).toBeNull()
  })

  it('respecte une durée de grâce paramétrable', () => {
    expect(getActivation('2026-09-30', TODAY, 3).status).toBe('REACTIVATION_REQUISE')
    expect(getActivation('2026-09-30', TODAY, 5).status).toBe('GRACE')
  })
})

describe('canReactivate', () => {
  it('est impossible tant que l’échéance est à plus de 30 jours', () => {
    expect(canReactivate('2026-11-05', TODAY)).toBe(false)
  })

  it('devient possible 30 jours avant l’échéance', () => {
    expect(canReactivate('2026-11-04', TODAY)).toBe(true)
  })

  it('reste possible après l’échéance', () => {
    expect(canReactivate('2026-09-01', TODAY)).toBe(true)
  })
})

describe('nextActivationUntil', () => {
  it('repart de la date du jour quand le dossier est expiré', () => {
    expect(nextActivationUntil('2026-08-25', TODAY, 6)).toBe('2027-04-05')
  })

  it('repart de l’ancienne échéance en cas de renouvellement anticipé', () => {
    expect(nextActivationUntil('2026-10-20', TODAY, 6)).toBe('2027-04-20')
  })

  it('gère le cas où l’échéance tombe aujourd’hui', () => {
    expect(nextActivationUntil(TODAY, TODAY, 6)).toBe('2027-04-05')
  })
})