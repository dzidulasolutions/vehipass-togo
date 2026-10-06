import type { DocumentStatus, DocumentType, VehicleDocument } from '../types/types'
import { daysBetween } from './dates'

export const REQUIRED_DOCUMENT_TYPES: readonly DocumentType[] = [
  'registration',
  'insurance',
  'technical_inspection',
]

export type DocumentReport = {
  id: string | null
  type: DocumentType
  status: DocumentStatus
  validUntil: string | null
  /** Jours restants avant expiration (négatif si expiré). */
  daysLeft: number | null
}

/**
 * Statut réel d'un document à une date donnée.
 * EXPIRE est calculé : un document encore marqué VALIDE dont la date est dépassée est expiré.
 * Il reste valide jusqu'à la fin du jour indiqué par valid_until.
 */
export function effectiveDocumentStatus(
  doc: Pick<VehicleDocument, 'status' | 'valid_until'>,
  today: string,
): DocumentStatus {
  if (doc.status === 'VALIDE' && doc.valid_until < today) return 'EXPIRE'
  return doc.status
}

/** Un rapport par type de document obligatoire ; NON_TROUVE si le véhicule n'en a pas. */
export function evaluateDocuments(documents: VehicleDocument[], today: string): DocumentReport[] {
  return REQUIRED_DOCUMENT_TYPES.map((type): DocumentReport => {
    // En cas de renouvellements, on retient le document qui expire le plus tard.
    const latest = documents
      .filter((d) => d.type === type)
      .sort((a, b) => b.valid_until.localeCompare(a.valid_until))[0]

    if (!latest) return { id: null, type, status: 'NON_TROUVE', validUntil: null, daysLeft: null }
    return {
      id: latest.id,
      type,
      status: effectiveDocumentStatus(latest, today),
      validUntil: latest.valid_until,
      daysLeft: daysBetween(today, latest.valid_until),
    }
  })
}