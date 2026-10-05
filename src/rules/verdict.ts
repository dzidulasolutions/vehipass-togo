import type {
  DocumentStatus,
  QrStatus,
  VehicleDocument,
  VehicleStatus,
  VerdictCode,
  VerdictColor,
} from '../types/types'
import { getActivation, type ActivationInfo } from './activation'
import { evaluateDocuments, type DocumentReport } from './documents'

export type VerdictInput = {
  /** null = QR inconnu ou signature invalide. */
  qr: { status: QrStatus } | null
  vehicle: { admin_status: VehicleStatus; activated_until: string } | null
  documents: VehicleDocument[]
  /** Nombre de PV impayés : on affiche le nombre, jamais le détail. */
  unpaidPenaltyCount: number
  /** Date du jour, AAAA-MM-JJ. */
  today: string
  graceDays: number
}

export type VerdictResult = {
  code: VerdictCode
  color: VerdictColor
  label: string
  suggestedAction: string
  vehicleStatus: VehicleStatus | null
  activation: ActivationInfo | null
  documents: DocumentReport[]
  unpaidPenaltyCount: number
}

const META: Record<VerdictCode, { color: VerdictColor; label: string; action: string }> = {
  VERIFICATION_IMPOSSIBLE: {
    color: 'gris',
    label: 'Vérification impossible',
    action: "Aucun dossier n'a pu être établi pour ce code. Appliquer la procédure prévue.",
  },
  CODE_REVOQUE: {
    color: 'rouge',
    label: 'Code révoqué',
    action: "Ce code n'est plus valide. Appliquer la procédure prévue.",
  },
  VEHICULE_SUSPENDU: {
    color: 'rouge',
    label: 'Véhicule suspendu',
    action: 'Le dossier de ce véhicule est suspendu. Appliquer la procédure prévue.',
  },
  A_VERIFIER: {
    color: 'orange',
    label: 'À vérifier',
    action: 'Une vérification complémentaire est nécessaire. Appliquer la procédure prévue.',
  },
  REACTIVATION_REQUISE: {
    color: 'orange',
    label: 'Réactivation requise',
    action: 'Le dossier doit être réactivé auprès du service compétent. Appliquer la procédure prévue.',
  },
  DOCUMENT_A_REGULARISER: {
    color: 'orange',
    label: 'Document à régulariser',
    action: 'Un ou plusieurs documents sont à régulariser. Appliquer la procédure prévue.',
  },
  CONFORME: {
    color: 'vert',
    label: 'Conforme',
    action: 'Aucune anomalie détectée dans le dossier.',
  },
}

/** Statuts de véhicule qui demandent une vérification complémentaire. */
const NEEDS_CHECK: ReadonlySet<VehicleStatus> = new Set(['A_VERIFIER', 'SIGNALE', 'INACTIF'])

/** Statuts de document à régulariser. */
const BLOCKING_DOCUMENT: ReadonlySet<DocumentStatus> = new Set([
  'EXPIRE',
  'REVOQUE',
  'SUSPENDU',
  'NON_TROUVE',
])

function result(
  code: VerdictCode,
  details: Partial<Omit<VerdictResult, 'code' | 'color' | 'label' | 'suggestedAction'>> = {},
): VerdictResult {
  const meta = META[code]
  return {
    code,
    color: meta.color,
    label: meta.label,
    suggestedAction: meta.action,
    vehicleStatus: null,
    activation: null,
    documents: [],
    unpaidPenaltyCount: 0,
    ...details,
  }
}

/** Verdict d'un contrôle, selon l'ordre de priorité du cahier des charges (3.2). */
export function computeVerdict(input: VerdictInput): VerdictResult {
  const { qr, vehicle, documents, today, graceDays } = input

  // Ces deux cas n'exposent aucune donnée du dossier.
  if (!qr) return result('VERIFICATION_IMPOSSIBLE')
  if (qr.status !== 'ACTIF') return result('CODE_REVOQUE')
  if (!vehicle) return result('VERIFICATION_IMPOSSIBLE')

  const details = {
    vehicleStatus: vehicle.admin_status,
    activation: getActivation(vehicle.activated_until, today, graceDays),
    documents: evaluateDocuments(documents, today),
    unpaidPenaltyCount: input.unpaidPenaltyCount,
  }

  if (vehicle.admin_status === 'SUSPENDU') return result('VEHICULE_SUSPENDU', details)

  if (NEEDS_CHECK.has(vehicle.admin_status) || details.documents.some((d) => d.status === 'EN_ATTENTE')) {
    return result('A_VERIFIER', details)
  }
  if (details.activation.status === 'REACTIVATION_REQUISE') {
    return result('REACTIVATION_REQUISE', details)
  }
  if (details.documents.some((d) => BLOCKING_DOCUMENT.has(d.status))) {
    return result('DOCUMENT_A_REGULARISER', details)
  }
  return result('CONFORME', details)
}