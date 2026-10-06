const pad = (n: number) => String(n).padStart(2, '0')

/** « jour » ou « jours » : le pluriel commence à 2. */
export function plural(count: number, word: string): string {
  return count > 1 ? `${word}s` : word
}

/** AAAA-MM-JJ → JJ/MM/AAAA */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/** Date-heure ISO → JJ/MM HH:mm, en UTC (le Togo est en UTC). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

/** Jours restants avant une échéance, dits en toutes lettres (négatif = déjà expiré). */
export function formatDaysLeft(daysLeft: number): string {
  if (daysLeft === 0) return "Expire aujourd'hui"
  if (daysLeft > 0) return `Expire dans ${daysLeft} ${plural(daysLeft, 'jour')}`
  return `Expiré depuis ${-daysLeft} ${plural(-daysLeft, 'jour')}`
}