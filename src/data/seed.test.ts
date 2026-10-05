import { describe, expect, it } from 'vitest'
import { checkIntegrity } from './integrity'
import { dbSchema } from './schemas'
import { buildSeed } from './seed'

const TODAY = new Date('2026-10-05T10:00:00Z')
const TODAY_ISO = '2026-10-05'
const db = buildSeed(TODAY)

const vehicle = (id: string) => {
  const found = db.vehicles.find((v) => v.id === id)
  if (!found) throw new Error(`véhicule introuvable : ${id}`)
  return found
}
const docs = (id: string) => db.documents.filter((x) => x.vehicle_id === id)
const daysSince = (isoDate: string) =>
  Math.round((TODAY.getTime() - new Date(`${isoDate}T00:00:00Z`).getTime()) / 86_400_000)

describe('buildSeed', () => {
  it('respecte le schéma Zod', () => {
    const result = dbSchema.safeParse(db)
    expect(result.success ? [] : result.error.issues).toEqual([])
  })

  it('est cohérent (références, double validation, QR actifs)', () => {
    expect(checkIntegrity(db)).toEqual([])
  })

  it('contient au moins 10 motos et 6 propriétaires', () => {
    expect(db.vehicles.length).toBeGreaterThanOrEqual(10)
    expect(db.persons).toHaveLength(6)
  })

  it('calcule les dates à partir de la date fournie', () => {
    const later = buildSeed(new Date('2026-11-04T10:00:00Z'))
    expect(db.vehicles[0].activated_until).toBe('2027-03-04')
    expect(later.vehicles[0].activated_until).toBe('2027-04-03')
  })

  it('v1 : tout conforme', () => {
    expect(vehicle('v1').admin_status).toBe('ACTIF')
    expect(vehicle('v1').activated_until > TODAY_ISO).toBe(true)
    expect(docs('v1').every((x) => x.valid_until > TODAY_ISO)).toBe(true)
  })

  it('v2 : assurance expirée, véhicule toujours actif', () => {
    const insurance = docs('v2').find((x) => x.type === 'insurance')
    expect(insurance !== undefined && insurance.valid_until < TODAY_ISO).toBe(true)
    expect(vehicle('v2').admin_status).toBe('ACTIF')
  })

  it('v3 : contrôle technique expiré', () => {
    const inspection = docs('v3').find((x) => x.type === 'technical_inspection')
    expect(inspection !== undefined && inspection.valid_until < TODAY_ISO).toBe(true)
  })

  it('v4 : véhicule suspendu', () => {
    expect(vehicle('v4').admin_status).toBe('SUSPENDU')
  })

  it('v5 : ancien QR révoqué, remplacé par un QR actif', () => {
    const tokens = db.qr_tokens.filter((q) => q.vehicle_id === 'v5')
    expect(tokens.map((q) => q.status).sort()).toEqual(['ACTIF', 'REVOQUE'])
    expect(tokens.find((q) => q.status === 'REVOQUE')?.replaced_by).toBe('q5b')
  })

  it('v6 : revendu, deux propriétaires dont un seul actuel, un seul QR', () => {
    const owners = db.ownerships.filter((o) => o.vehicle_id === 'v6')
    expect(owners).toHaveLength(2)
    expect(owners.filter((o) => o.end_date === null)).toHaveLength(1)
    expect(db.qr_tokens.filter((q) => q.vehicle_id === 'v6')).toHaveLength(1)
  })

  it('v7 : en période de grâce', () => {
    const days = daysSince(vehicle('v7').activated_until)
    expect(days).toBeGreaterThan(0)
    expect(days).toBeLessThanOrEqual(db.config.grace_days)
  })

  it('v8 : réactivation requise avec 2 PV impayés', () => {
    expect(daysSince(vehicle('v8').activated_until)).toBeGreaterThan(db.config.grace_days)
    const unpaid = db.penalties.filter((p) => p.vehicle_id === 'v8' && p.status === 'NOTIFIE')
    expect(unpaid).toHaveLength(2)
  })

  it('v9 : PV contesté en cours', () => {
    const contested = db.penalties.filter((p) => p.vehicle_id === 'v9' && p.status === 'CONTESTE')
    expect(contested).toHaveLength(1)
  })

  it('v10 : conducteur autorisé différent du propriétaire', () => {
    const driver = db.driver_authorizations.find((x) => x.vehicle_id === 'v10')
    const current = db.ownerships.find((o) => o.vehicle_id === 'v10' && o.end_date === null)
    const owner = db.persons.find((p) => p.id === current?.person_id)
    expect(driver).toBeDefined()
    expect(driver?.driver_ref).not.toBe(owner?.id_ref)
  })

  it('v11 : en attente de seconde validation, sans QR', () => {
    expect(vehicle('v11').creation_status).toBe('EN_ATTENTE_VALIDATION')
    expect(vehicle('v11').approved_by).toBeNull()
    expect(db.qr_tokens.filter((q) => q.vehicle_id === 'v11')).toHaveLength(0)
  })

  it('contient une demande de correction en attente', () => {
    expect(db.change_requests.some((c) => c.type === 'correction' && c.status === 'pending')).toBe(true)
  })
})