import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed'
import { computeVerdict } from './verdict'

const TODAY = new Date('2026-10-05T10:00:00Z')
const db = buildSeed(TODAY)

/** Ce que fera l'API simulée à l'étape suivante : retrouver le dossier d'un QR, puis calculer le verdict. */
function verdictForQr(publicId: string) {
  const qr = db.qr_tokens.find((q) => q.public_id === publicId) ?? null
  const vehicle = qr ? (db.vehicles.find((v) => v.id === qr.vehicle_id) ?? null) : null
  return computeVerdict({
    qr,
    vehicle,
    documents: vehicle ? db.documents.filter((d) => d.vehicle_id === vehicle.id) : [],
    unpaidPenaltyCount: 0,
    today: '2026-10-05',
    graceDays: db.config.grace_days,
  })
}

const qrOf = (vehicleId: string) => {
  const v = db.vehicles.find((x) => x.id === vehicleId)
  if (!v) throw new Error(`véhicule introuvable : ${vehicleId}`)
  return v.public_id
}

describe('verdicts sur les données de démo', () => {
  it.each([
    ['v1', 'CONFORME'],
    ['v2', 'DOCUMENT_A_REGULARISER'],
    ['v3', 'DOCUMENT_A_REGULARISER'],
    ['v4', 'VEHICULE_SUSPENDU'],
    ['v5', 'CONFORME'],
    ['v6', 'CONFORME'],
    ['v7', 'CONFORME'],
    ['v8', 'REACTIVATION_REQUISE'],
    ['v9', 'CONFORME'],
    ['v10', 'CONFORME'],
  ])('%s → %s', (vehicleId, expected) => {
    expect(verdictForQr(qrOf(vehicleId)).code).toBe(expected)
  })

  it('v5 : l’ancien QR révoqué affiche « Code révoqué »', () => {
    const oldQr = db.qr_tokens.find((q) => q.id === 'q5a')
    expect(oldQr).toBeDefined()
    expect(verdictForQr(oldQr!.public_id).code).toBe('CODE_REVOQUE')
  })

  it('un QR inconnu donne « Vérification impossible »', () => {
    expect(verdictForQr('0000000000').code).toBe('VERIFICATION_IMPOSSIBLE')
  })

  it('v7 : période de grâce visible dans l’activation', () => {
    expect(verdictForQr(qrOf('v7')).activation?.status).toBe('GRACE')
  })
})