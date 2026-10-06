import { describe, expect, it } from 'vitest'
import type { VehicleDocument } from '../types/types'
import { effectiveDocumentStatus, evaluateDocuments } from './documents'

const TODAY = '2026-10-05'

const doc = (overrides: Partial<VehicleDocument> = {}): VehicleDocument => ({
  id: 'd1',
  vehicle_id: 'v1',
  type: 'insurance',
  status: 'VALIDE',
  issue_date: '2026-01-01',
  valid_until: '2027-01-01',
  issuer_org_id: 'org_assur',
  reference: 'AS-1',
  ...overrides,
})

describe('effectiveDocumentStatus', () => {
  it('reste VALIDE avant l’échéance', () => {
    expect(effectiveDocumentStatus(doc({ valid_until: '2026-12-01' }), TODAY)).toBe('VALIDE')
  })

  it('reste VALIDE le jour même de l’échéance', () => {
    expect(effectiveDocumentStatus(doc({ valid_until: TODAY }), TODAY)).toBe('VALIDE')
  })

  it('devient EXPIRE le lendemain de l’échéance', () => {
    expect(effectiveDocumentStatus(doc({ valid_until: '2026-10-04' }), TODAY)).toBe('EXPIRE')
  })

  it('ne transforme pas les autres statuts, même après l’échéance', () => {
    for (const status of ['SUSPENDU', 'REVOQUE', 'EN_ATTENTE'] as const) {
      expect(effectiveDocumentStatus(doc({ status, valid_until: '2026-01-01' }), TODAY)).toBe(status)
    }
  })
})

describe('evaluateDocuments', () => {
  it('retourne toujours les trois types obligatoires', () => {
    const report = evaluateDocuments([], TODAY)
    expect(report.map((r) => r.type)).toEqual(['registration', 'insurance', 'technical_inspection'])
    expect(report.every((r) => r.status === 'NON_TROUVE')).toBe(true)
  })

  it('calcule les jours restants, négatifs si expiré', () => {
    const report = evaluateDocuments(
      [
        doc({ id: 'a', type: 'registration', valid_until: '2026-10-15' }),
        doc({ id: 'b', type: 'insurance', valid_until: '2026-10-01' }),
      ],
      TODAY,
    )
    expect(report.find((r) => r.type === 'registration')?.daysLeft).toBe(10)
    expect(report.find((r) => r.type === 'insurance')?.daysLeft).toBe(-4)
    expect(report.find((r) => r.type === 'insurance')?.status).toBe('EXPIRE')
  })

  it('retient le document qui expire le plus tard en cas de renouvellement', () => {
    const report = evaluateDocuments(
      [
        doc({ id: 'old', valid_until: '2026-01-01' }),
        doc({ id: 'new', valid_until: '2027-06-01' }),
      ],
      TODAY,
    )
    const insurance = report.find((r) => r.type === 'insurance')
    expect(insurance?.id).toBe('new')
    expect(insurance?.status).toBe('VALIDE')
  })
})