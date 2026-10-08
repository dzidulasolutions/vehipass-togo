import { DEMO_SCENARIOS } from '../data/demoScenarios'
import { buildQrToken } from '../rules/qr'
import { getDb, resetDb } from './db'
import { DEMO_OTP, DEMO_PASSWORD, simulate } from './mockApi'

export interface DemoSummary {
  generatedAt: string
  vehicles: number
  owners: number
  documents: number
  penalties: number
}

export interface DemoQr {
  id: string
  label: string
  plate: string | null
  /** Ce que contiendrait le QR scanné. */
  token: string
}

/** Identifiants de démonstration affichés sur les écrans de connexion (mode mock uniquement). */
export const DEMO_HINT = { badge: 'AG-001', password: DEMO_PASSWORD, otp: DEMO_OTP } as const

/**
 * Outils de démo, volontairement hors du contrat `Api` :
 * un vrai backend n'a pas de bouton « réinitialiser la démo ».
 */
export function getDemoSummary(): Promise<DemoSummary> {
  return simulate(() => {
    const db = getDb()
    return {
      generatedAt: db.meta.generated_at,
      vehicles: db.vehicles.length,
      owners: db.persons.length,
      documents: db.documents.length,
      penalties: db.penalties.length,
    }
  })
}

export function resetDemo(): void {
  resetDb()
}

/** Les QR à « scanner » en démo : un par scénario, plus trois cas particuliers. */
export function listDemoQr(): DemoQr[] {
  const db = getDb()
  const items: DemoQr[] = []

  for (const scenario of DEMO_SCENARIOS) {
    const vehicle = db.vehicles.find((v) => v.id === scenario.vehicleId)
    if (vehicle && vehicle.creation_status === 'VALIDE') {
      items.push({
        id: scenario.vehicleId,
        label: scenario.label,
        plate: vehicle.plate,
        token: buildQrToken(vehicle.public_id),
      })
    }
  }

  const revoked = db.qr_tokens.find((q) => q.status === 'REVOQUE')
  if (revoked) {
    items.push({ id: 'revoked', label: 'QR révoqué (ancien code)', plate: null, token: buildQrToken(revoked.public_id) })
  }

  const first = db.vehicles[0]
  if (first) {
    items.push({
      id: 'forged',
      label: 'QR fabriqué (fausse signature)',
      plate: null,
      token: `${first.public_id}.00000000`,
    })
  }

  items.push({ id: 'unknown', label: 'QR inconnu (aucun dossier)', plate: null, token: buildQrToken('0123456789abcdef') })
  return items
}