import type { ActivationStatus, DocumentStatus, DocumentType, VehicleStatus } from '../types/types'

// Record<...> : si un statut est ajouté plus tard, TypeScript exige son libellé ici.
export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  registration: 'Carte grise',
  insurance: 'Assurance',
  technical_inspection: 'Contrôle technique',
}

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  VALIDE: 'Valide',
  EXPIRE: 'Expiré',
  SUSPENDU: 'Suspendu',
  EN_ATTENTE: 'En attente',
  REVOQUE: 'Révoqué',
  NON_TROUVE: 'Introuvable',
}

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  ACTIF: 'Actif',
  A_VERIFIER: 'À vérifier',
  SUSPENDU: 'Suspendu',
  INACTIF: 'Inactif',
  SIGNALE: 'Signalé',
}

export const ACTIVATION_LABEL: Record<ActivationStatus, string> = {
  ACTIVE: 'À jour',
  GRACE: 'Période de grâce',
  REACTIVATION_REQUISE: 'Réactivation requise',
}