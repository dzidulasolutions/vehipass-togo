import type { Session } from '../types/api'
import { sessionSchema } from './apiSchemas'

const KEY = 'vehipass.session'
let memorySession: Session | null = null

/** Session courante, ou null. Les données stockées sont revalidées à chaque lecture. */
export function getSession(): Session | null {
  try {
    if (typeof sessionStorage === 'undefined') return memorySession
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = sessionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return memorySession
  }
}

export function setSession(session: Session): void {
  memorySession = session
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // stockage indisponible : la session reste en mémoire
  }
}

export function clearSession(): void {
  memorySession = null
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(KEY)
  } catch {
    // rien à faire
  }
}

/** Jeton envoyé au serveur en mode http. */
export function getToken(): string | null {
  return getSession()?.token ?? null
}