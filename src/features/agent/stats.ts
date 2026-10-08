import type { ControlListItem } from '../../types/api'

export type ControlFilter = 'all' | 'compliant' | 'attention'

/** Chiffres du jour pour l'écran d'accueil. */
export function summarizeControls(items: ControlListItem[], today: string) {
  const todays = items.filter((item) => item.timestamp.slice(0, 10) === today)
  const compliant = todays.filter((item) => item.verdict === 'CONFORME').length
  return { total: todays.length, compliant, attention: todays.length - compliant }
}

export function filterControls(items: ControlListItem[], filter: ControlFilter): ControlListItem[] {
  if (filter === 'compliant') return items.filter((item) => item.verdict === 'CONFORME')
  if (filter === 'attention') return items.filter((item) => item.verdict !== 'CONFORME')
  return items
}

/** Regroupe une liste triée par date décroissante en blocs par jour. */
export function groupByDay(items: ControlListItem[]): Array<{ day: string; items: ControlListItem[] }> {
  const groups: Array<{ day: string; items: ControlListItem[] }> = []
  for (const item of items) {
    const day = item.timestamp.slice(0, 10)
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.items.push(item)
    else groups.push({ day, items: [item] })
  }
  return groups
}