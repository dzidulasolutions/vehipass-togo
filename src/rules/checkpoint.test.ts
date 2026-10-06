import { describe, expect, it } from 'vitest'
import type { VerdictCode } from '../types/types'
import { checkpointOutcome } from './checkpoint'

const found = (code: VerdictCode, label: string) => ({ code, label })

describe('checkpointOutcome', () => {
  it('papiers en règle : aucune vérification, quel que soit le dossier', () => {
    expect(checkpointOutcome({ papers: 'EN_REGLE', verdict: null }).outcome).toBe('PAPERS_OK')
    expect(
      checkpointOutcome({ papers: 'EN_REGLE', verdict: found('VEHICULE_SUSPENDU', 'Véhicule suspendu') }).outcome,
    ).toBe('PAPERS_OK')
  })

  it('papiers absents et dossier conforme : vérifié par l’application', () => {
    const r = checkpointOutcome({ papers: 'ABSENTS', verdict: found('CONFORME', 'Conforme') })
    expect(r.outcome).toBe('VERIFIED_BY_APP')
  })

  it('papiers absents et dossier non conforme : procédure, avec le verdict', () => {
    const r = checkpointOutcome({ papers: 'ABSENTS', verdict: found('DOCUMENT_A_REGULARISER', 'Document à régulariser') })
    expect(r.outcome).toBe('PROCEDURE')
    expect(r.message).toContain('Document à régulariser')
  })

  it('papiers absents et code révoqué : procédure', () => {
    const r = checkpointOutcome({ papers: 'ABSENTS', verdict: found('CODE_REVOQUE', 'Code révoqué') })
    expect(r.outcome).toBe('PROCEDURE')
  })

  it.each([null, found('VERIFICATION_IMPOSSIBLE', 'Vérification impossible')])(
    'papiers absents et aucun dossier : « Aucun dossier trouvé »',
    (verdict) => {
      const r = checkpointOutcome({ papers: 'ABSENTS', verdict })
      expect(r.outcome).toBe('NO_RECORD')
      expect(r.message).toContain('Aucun dossier trouvé')
    },
  )

  it('aucun message n’accuse ni ne décide d’une saisie', () => {
    const cases = [
      checkpointOutcome({ papers: 'EN_REGLE', verdict: null }),
      checkpointOutcome({ papers: 'ABSENTS', verdict: null }),
      checkpointOutcome({ papers: 'ABSENTS', verdict: found('CONFORME', 'Conforme') }),
      checkpointOutcome({ papers: 'ABSENTS', verdict: found('VEHICULE_SUSPENDU', 'Véhicule suspendu') }),
    ]
    for (const r of cases) expect(r.message).not.toMatch(/fraud|infraction|saisi|volé/i)
  })
})