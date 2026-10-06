import type { VerdictResult } from './verdict'

export type CheckpointOutcome = 'PAPERS_OK' | 'VERIFIED_BY_APP' | 'PROCEDURE' | 'NO_RECORD'

export type CheckpointResult = {
  outcome: CheckpointOutcome
  message: string
}

/**
 * Règle papiers / QR (3.4). L'application informe, elle ne décide pas :
 * saisie du véhicule et sanctions relèvent de la procédure appliquée par l'agent.
 */
export function checkpointOutcome(input: {
  papers: 'EN_REGLE' | 'ABSENTS'
  verdict: Pick<VerdictResult, 'code' | 'label'> | null
}): CheckpointResult {
  const { papers, verdict } = input

  if (papers === 'EN_REGLE') {
    return {
      outcome: 'PAPERS_OK',
      message: "Papiers en règle : aucune vérification n'est nécessaire dans l'application.",
    }
  }
  if (!verdict || verdict.code === 'VERIFICATION_IMPOSSIBLE') {
    return {
      outcome: 'NO_RECORD',
      message: "Aucun dossier trouvé. L'agent applique la procédure prévue.",
    }
  }
  if (verdict.code === 'CONFORME') {
    return {
      outcome: 'VERIFIED_BY_APP',
      message: "Papiers absents, mais le dossier est conforme dans l'application.",
    }
  }
  return {
    outcome: 'PROCEDURE',
    message: `Papiers absents. Dossier : ${verdict.label}. L'agent applique la procédure prévue.`,
  }
}