import { beforeEach, describe, expect, it } from 'vitest'
import { recordAudit, sha256Hex, verifyChain } from './audit'
import { getDb, resetDb } from './db'

const record = (action: string) =>
  recordAudit({ actorId: 'u_admin1', action, entity: 'vehicle', entityId: 'v1' })

describe('sha256Hex', () => {
  it('calcule le SHA-256 connu de « abc »', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('journal d’audit chaîné', () => {
  beforeEach(() => {
    resetDb()
  })

  it('accepte un journal vide', async () => {
    expect(await verifyChain([])).toEqual({ valid: true, brokenAt: null })
  })

  it('enchaîne les entrées, et la chaîne est valide', async () => {
    await record('a')
    await record('b')
    await record('c')
    const log = getDb().audit_log
    expect(log).toHaveLength(3)
    expect(log[1].prev_hash).toBe(log[0].hash)
    expect(await verifyChain(log)).toEqual({ valid: true, brokenAt: null })
  })

  it('reste valide quand plusieurs entrées arrivent en même temps', async () => {
    await Promise.all([record('1'), record('2'), record('3'), record('4'), record('5')])
    const log = getDb().audit_log
    expect(log).toHaveLength(5)
    expect(await verifyChain(log)).toEqual({ valid: true, brokenAt: null })
  })

  it('détecte une entrée modifiée', async () => {
    await record('a')
    await record('b')
    await record('c')
    const log = structuredClone(getDb().audit_log)
    log[1].action = 'falsifié'
    expect(await verifyChain(log)).toEqual({ valid: false, brokenAt: 1 })
  })

  it('détecte une entrée supprimée', async () => {
    await record('a')
    await record('b')
    await record('c')
    const log = structuredClone(getDb().audit_log)
    log.splice(1, 1)
    expect(await verifyChain(log)).toEqual({ valid: false, brokenAt: 1 })
  })
})