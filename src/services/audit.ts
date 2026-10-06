import type { AuditEntry } from '../types/types'
import { now } from './clock'
import { getDb, updateDb } from './db'

const GENESIS_HASH = '0'.repeat(64)

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** Le hash dépend du contenu de l'entrée ET du hash de la précédente. */
export function computeEntryHash(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
  return sha256Hex(
    JSON.stringify([
      entry.prev_hash,
      entry.id,
      entry.actor_id,
      entry.action,
      entry.entity,
      entry.entity_id,
      entry.timestamp,
    ]),
  )
}

export type ChainCheck = { valid: boolean; brokenAt: number | null }

/** Recalcule toute la chaîne ; retourne la position de la première entrée incohérente. */
export async function verifyChain(log: AuditEntry[]): Promise<ChainCheck> {
  let previous = GENESIS_HASH
  for (let i = 0; i < log.length; i++) {
    const { hash, ...rest } = log[i]
    if (rest.prev_hash !== previous) return { valid: false, brokenAt: i }
    if ((await computeEntryHash(rest)) !== hash) return { valid: false, brokenAt: i }
    previous = hash
  }
  return { valid: true, brokenAt: null }
}

type AuditInput = { actorId: string; action: string; entity: string; entityId: string }

// File d'attente : les écritures simultanées passent l'une après l'autre,
// sinon deux entrées partiraient du même hash précédent et casseraient la chaîne.
let queue: Promise<void> = Promise.resolve()

/** Ajoute une entrée à la fin du journal (ajout seul : aucune fonction ne modifie ni ne supprime). */
export function recordAudit(input: AuditInput): Promise<void> {
  const task = queue.then(async () => {
    const log = getDb().audit_log
    const previous = log[log.length - 1]
    const base = {
      id: `a${log.length + 1}`,
      actor_id: input.actorId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId,
      timestamp: now().toISOString(),
      prev_hash: previous?.hash ?? GENESIS_HASH,
    }
    const entry: AuditEntry = { ...base, hash: await computeEntryHash(base) }
    updateDb((db) => {
      db.audit_log.push(entry)
    })
  })
  queue = task.catch(() => undefined)
  return task
}