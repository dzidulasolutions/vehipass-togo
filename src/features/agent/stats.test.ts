import { describe, expect, it } from 'vitest'
import type { ControlListItem } from '../../types/api'
import { filterControls, groupByDay, summarizeControls } from './stats'

const item = (id: string, timestamp: string, verdict: ControlListItem['verdict']): ControlListItem => ({
  id,
  timestamp,
  verdict,
  plate: 'TG-DEMO-001',
  mode: 'online',
})

const ITEMS = [
  item('a', '2026-10-05T09:00:00Z', 'CONFORME'),
  item('b', '2026-10-05T08:00:00Z', 'DOCUMENT_A_REGULARISER'),
  item('c', '2026-10-05T07:00:00Z', 'VERIFICATION_IMPOSSIBLE'),
  item('d', '2026-10-04T16:00:00Z', 'CONFORME'),
  item('e', '2026-10-03T10:00:00Z', 'VEHICULE_SUSPENDU'),
]

describe('summarizeControls', () => {
  it('compte les contrôles du jour, conformes ou non', () => {
    expect(summarizeControls(ITEMS, '2026-10-05')).toEqual({ total: 3, compliant: 1, attention: 2 })
  })

  it('retourne des zéros quand rien n’a été fait aujourd’hui', () => {
    expect(summarizeControls(ITEMS, '2026-10-10')).toEqual({ total: 0, compliant: 0, attention: 0 })
  })
})

describe('filterControls', () => {
  it('filtre selon le verdict', () => {
    expect(filterControls(ITEMS, 'all')).toHaveLength(5)
    expect(filterControls(ITEMS, 'compliant').map((i) => i.id)).toEqual(['a', 'd'])
    expect(filterControls(ITEMS, 'attention').map((i) => i.id)).toEqual(['b', 'c', 'e'])
  })
})

describe('groupByDay', () => {
  it('regroupe par jour en gardant l’ordre', () => {
    const groups = groupByDay(ITEMS)
    expect(groups.map((g) => g.day)).toEqual(['2026-10-05', '2026-10-04', '2026-10-03'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('accepte une liste vide', () => {
    expect(groupByDay([])).toEqual([])
  })
})