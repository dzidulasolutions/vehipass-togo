import { describe, expect, it } from 'vitest'
import type { VehicleDocument, VerdictCode, VerdictColor } from '../types/types'
import { computeVerdict, type VerdictInput } from './verdict'
import type { VehicleStatus } from '../types/types'

const TODAY = '2026-10-05'

const doc = (type: VehicleDocument['type'], overrides: Partial<VehicleDocument> = {}): VehicleDocument => ({
  id: `d_${type}`,
  vehicle_id: 'v1',
  type,
  status: 'VALIDE',
  issue_date: '2026-01-01',
  valid_until: '2027-06-01',
  issuer_org_id: 'org',
  reference: 'REF',
  ...overrides,
})

const validDocs = () => [doc('registration'), doc('insurance'), doc('technical_inspection')]

const base = (overrides: Partial<VerdictInput> = {}): VerdictInput => ({
  qr: { status: 'ACTIF' },
  vehicle: { admin_status: 'ACTIF', activated_until: '2027-01-01' },
  documents: validDocs(),
  unpaidPenaltyCount: 0,
  today: TODAY,
  graceDays: 15,
  ...overrides,
})

const vehicle = (admin_status: VehicleStatus, activated_until = '2027-01-01') => ({
  admin_status,
  activated_until,
})

describe('computeVerdict', () => {
  it('CONFORME quand tout est en règle', () => {
    const r = computeVerdict(base())
    expect(r.code).toBe('CONFORME')
    expect(r.color).toBe('vert')
    expect(r.documents.map((d) => d.status)).toEqual(['VALIDE', 'VALIDE', 'VALIDE'])
  })

  it('VERIFICATION_IMPOSSIBLE sans QR connu, et n’expose rien même si un véhicule est fourni', () => {
    const r = computeVerdict(base({ qr: null }))
    expect(r.code).toBe('VERIFICATION_IMPOSSIBLE')
    expect(r.color).toBe('gris')
    expect(r.vehicleStatus).toBeNull()
    expect(r.documents).toEqual([])
    expect(r.activation).toBeNull()
  })

  it.each(['REVOQUE', 'REMPLACE'] as const)('CODE_REVOQUE pour un QR %s, sans aucune donnée', (status) => {
    const r = computeVerdict(base({ qr: { status } }))
    expect(r.code).toBe('CODE_REVOQUE')
    expect(r.color).toBe('rouge')
    expect(r.vehicleStatus).toBeNull()
    expect(r.documents).toEqual([])
  })

  it('VERIFICATION_IMPOSSIBLE si le QR est actif mais le véhicule introuvable', () => {
    expect(computeVerdict(base({ vehicle: null })).code).toBe('VERIFICATION_IMPOSSIBLE')
  })

  it('VEHICULE_SUSPENDU : rouge, même si les documents sont expirés', () => {
    const r = computeVerdict(
      base({ vehicle: vehicle('SUSPENDU'), documents: [doc('insurance', { valid_until: '2026-01-01' })] }),
    )
    expect(r.code).toBe('VEHICULE_SUSPENDU')
    expect(r.color).toBe('rouge')
  })

  it.each(['A_VERIFIER', 'SIGNALE', 'INACTIF'] as const)('A_VERIFIER pour un véhicule %s', (status) => {
    const r = computeVerdict(base({ vehicle: vehicle(status) }))
    expect(r.code).toBe('A_VERIFIER')
    expect(r.color).toBe('orange')
  })

  it('A_VERIFIER quand un document attend sa validation', () => {
    const r = computeVerdict(
      base({ documents: [doc('registration'), doc('insurance', { status: 'EN_ATTENTE' }), doc('technical_inspection')] }),
    )
    expect(r.code).toBe('A_VERIFIER')
  })

  it('REACTIVATION_REQUISE après la période de grâce', () => {
    const r = computeVerdict(base({ vehicle: vehicle('ACTIF', '2026-08-25') }))
    expect(r.code).toBe('REACTIVATION_REQUISE')
    expect(r.color).toBe('orange')
    expect(r.activation?.status).toBe('REACTIVATION_REQUISE')
  })

  it('reste CONFORME pendant la période de grâce, avec les jours restants', () => {
    const r = computeVerdict(base({ vehicle: vehicle('ACTIF', '2026-09-30') }))
    expect(r.code).toBe('CONFORME')
    expect(r.activation).toMatchObject({ status: 'GRACE', graceDaysLeft: 10 })
  })

  it('DOCUMENT_A_REGULARISER pour une assurance expirée, véhicule toujours actif (statuts séparés)', () => {
    const r = computeVerdict(
      base({
        documents: [doc('registration'), doc('insurance', { valid_until: '2026-09-01' }), doc('technical_inspection')],
      }),
    )
    expect(r.code).toBe('DOCUMENT_A_REGULARISER')
    expect(r.color).toBe('orange')
    expect(r.vehicleStatus).toBe('ACTIF')
    expect(r.documents.map((d) => d.status)).toEqual(['VALIDE', 'EXPIRE', 'VALIDE'])
  })

  it.each(['REVOQUE', 'SUSPENDU'] as const)('DOCUMENT_A_REGULARISER pour un document %s', (status) => {
    const r = computeVerdict(
      base({ documents: [doc('registration'), doc('insurance', { status }), doc('technical_inspection')] }),
    )
    expect(r.code).toBe('DOCUMENT_A_REGULARISER')
  })

  it('DOCUMENT_A_REGULARISER quand un document est introuvable', () => {
    const r = computeVerdict(base({ documents: [doc('registration'), doc('insurance')] }))
    expect(r.code).toBe('DOCUMENT_A_REGULARISER')
    expect(r.documents.find((d) => d.type === 'technical_inspection')?.status).toBe('NON_TROUVE')
  })

  it('transmet le nombre de PV impayés', () => {
    expect(computeVerdict(base({ unpaidPenaltyCount: 2 })).unpaidPenaltyCount).toBe(2)
  })

  it('respecte l’ordre de priorité du cahier des charges', () => {
    const wrong = base({
      vehicle: vehicle('SUSPENDU', '2026-01-01'),
      documents: [doc('registration', { valid_until: '2026-01-01' })],
    })
    expect(computeVerdict({ ...wrong, qr: { status: 'REVOQUE' } }).code).toBe('CODE_REVOQUE')
    expect(computeVerdict(wrong).code).toBe('VEHICULE_SUSPENDU')
    expect(computeVerdict({ ...wrong, vehicle: vehicle('A_VERIFIER', '2026-01-01') }).code).toBe('A_VERIFIER')
    expect(computeVerdict({ ...wrong, vehicle: vehicle('ACTIF', '2026-01-01') }).code).toBe('REACTIVATION_REQUISE')
    expect(computeVerdict({ ...wrong, vehicle: vehicle('ACTIF') }).code).toBe('DOCUMENT_A_REGULARISER')
  })
})

// Un exemple par code : TypeScript refuse de compiler si un code de verdict est oublié.
const SAMPLES: Record<VerdictCode, { input: VerdictInput; color: VerdictColor }> = {
  VERIFICATION_IMPOSSIBLE: { input: base({ qr: null }), color: 'gris' },
  CODE_REVOQUE: { input: base({ qr: { status: 'REVOQUE' } }), color: 'rouge' },
  VEHICULE_SUSPENDU: { input: base({ vehicle: vehicle('SUSPENDU') }), color: 'rouge' },
  A_VERIFIER: { input: base({ vehicle: vehicle('A_VERIFIER') }), color: 'orange' },
  REACTIVATION_REQUISE: { input: base({ vehicle: vehicle('ACTIF', '2026-08-01') }), color: 'orange' },
  DOCUMENT_A_REGULARISER: {
    input: base({
      documents: [doc('registration'), doc('insurance', { valid_until: '2026-09-01' }), doc('technical_inspection')],
    }),
    color: 'orange',
  },
  CONFORME: { input: base(), color: 'vert' },
}

describe('textes des verdicts', () => {
  it.each(Object.entries(SAMPLES) as Array<[VerdictCode, (typeof SAMPLES)[VerdictCode]]>)(
    '%s : couleur attendue, textes présents, aucune formulation accusatrice',
    (code, { input, color }) => {
      const r = computeVerdict(input)
      expect(r.code).toBe(code)
      expect(r.color).toBe(color)
      expect(r.label.length).toBeGreaterThan(0)
      expect(r.suggestedAction.length).toBeGreaterThan(0)
      expect(`${r.label} ${r.suggestedAction}`).not.toMatch(/fraud|infraction|volé|illégal|coupable/i)
    },
  )
})