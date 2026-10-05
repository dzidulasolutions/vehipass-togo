const KEY = 'vehipass.clock.offsetMs'
const DAY_MS = 24 * 60 * 60 * 1000

function readOffset(): number {
  try {
    if (typeof localStorage === 'undefined') return 0
    const raw = localStorage.getItem(KEY)
    return raw ? Number(raw) || 0 : 0
  } catch {
    return 0
  }
}

function writeOffset(value: number): void {
  try {
    if (typeof localStorage === 'undefined') return
    if (value === 0) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, String(value))
  } catch {
    // stockage indisponible : l'horloge reste en mémoire seulement
  }
}

let offsetMs = readOffset()

/** Date « courante » du prototype (réelle + décalage simulé). */
export function now(): Date {
  return new Date(Date.now() + offsetMs)
}

/** Fixe la date simulée ; le temps continue ensuite de s'écouler. */
export function setNow(date: Date): void {
  offsetMs = date.getTime() - Date.now()
  writeOffset(offsetMs)
}

/** Avance (ou recule) la date simulée de n jours. */
export function advanceDays(days: number): void {
  offsetMs += days * DAY_MS
  writeOffset(offsetMs)
}

/** Revient au temps réel. */
export function resetClock(): void {
  offsetMs = 0
  writeOffset(0)
}

/** Date au format YYYY-MM-DD, n jours à partir de « maintenant ». */
export function daysFromNow(days: number): string {
  return new Date(now().getTime() + days * DAY_MS).toISOString().slice(0, 10)
}