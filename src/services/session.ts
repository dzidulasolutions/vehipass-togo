import type { Session } from '../types/api'
import { sessionSchema } from './apiSchemas'

const KEY = 'vehipass.session'

// undefined = pas encore lue. La valeur est gardée en mémoire : l'interface doit toujours
// recevoir le MÊME objet tant que la session ne change pas (voir useSession).
let current: Session | null | undefined
const listeners = new Set<() => void>()

function load(): Session | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = sessionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

const notify = () => listeners.forEach((listener) => listener())

export function getSession(): Session | null {
  if (current === undefined) current = load()
  return current
}

export function setSession(session: Session): void {
  current = session
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // stockage indisponible : la session reste en mémoire
  }
  notify()
}

export function clearSession(): void {
  current = null
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(KEY)
  } catch {
    // rien à faire
  }
  notify()
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Jeton envoyé au serveur en mode http. */
export function getToken(): string | null {
  return getSession()?.token ?? null
}