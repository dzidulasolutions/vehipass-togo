const DAY_MS = 86_400_000

const toUtc = (iso: string): number => {
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number]
  return Date.UTC(year, month - 1, day)
}

/** Date au format AAAA-MM-JJ (UTC). */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Nombre de jours de `from` à `to` (positif si `to` est après `from`). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
}

export function addDays(iso: string, days: number): string {
  return toIsoDate(new Date(toUtc(iso) + days * DAY_MS))
}

/** Ajoute des mois en gardant un jour valide (31 août + 6 mois = 28 février). */
export function addMonths(iso: string, months: number): string {
  const [, , day] = iso.split('-').map(Number) as [number, number, number]
  const [year, month] = iso.split('-').map(Number) as [number, number]
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return toIsoDate(target)
}