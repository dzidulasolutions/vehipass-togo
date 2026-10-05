import { buildSeed } from '../data/seed'
import { dbSchema } from '../data/schemas'
import type { Db } from '../types/types'
import { now } from './clock'

const KEY = 'vehipass.db'
let cache: Db | null = null

function readStored(): Db | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = dbSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null // données invalides ou anciennes : on repart du seed
  } catch {
    return null
  }
}

function persist(db: Db): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // stockage plein ou indisponible : la base reste en mémoire
  }
}

/** Base courante : celle du navigateur si elle est valide, sinon le seed. */
export function getDb(): Db {
  if (!cache) {
    cache = readStored() ?? buildSeed(now())
    persist(cache)
  }
  return cache
}

/**
 * Applique une modification sur une copie, puis la valide et la sauvegarde.
 * Si `mutate` échoue en route, la base n'est pas modifiée.
 */
export function updateDb(mutate: (db: Db) => void): Db {
  const draft = structuredClone(getDb())
  mutate(draft)
  cache = draft
  persist(draft)
  return draft
}

/** Revient au jeu de données de démo, recalculé à partir de la date simulée. */
export function resetDb(): Db {
  cache = buildSeed(now())
  persist(cache)
  return cache
}