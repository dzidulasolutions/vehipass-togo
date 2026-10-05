import { getDb, resetDb } from './db'
import { simulate } from './mockApi'

export interface DemoSummary {
  generatedAt: string
  vehicles: number
  owners: number
  documents: number
  penalties: number
}

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