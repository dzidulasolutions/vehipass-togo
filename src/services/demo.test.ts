import { beforeEach, describe, expect, it } from 'vitest'
import { parseQrToken } from '../rules/qr'
import { resetDb } from './db'
import { listDemoQr } from './demo'

describe('listDemoQr', () => {
  beforeEach(() => {
    resetDb()
  })

  it('propose 10 scénarios et 3 cas particuliers', () => {
    const items = listDemoQr()
    expect(items).toHaveLength(13)
    expect(items.map((i) => i.id)).toEqual(
      expect.arrayContaining(['v1', 'v10', 'revoked', 'forged', 'unknown']),
    )
  })

  it('signe correctement tous les QR sauf le QR fabriqué', () => {
    for (const item of listDemoQr()) {
      const parsed = parseQrToken(item.token)
      expect(parsed).not.toBeNull()
      expect(parsed?.signatureValid).toBe(item.id !== 'forged')
    }
  })

  it('donne une plaque aux scénarios de véhicules uniquement', () => {
    const items = listDemoQr()
    expect(items.find((i) => i.id === 'v1')?.plate).toBe('TG-DEMO-001')
    expect(items.find((i) => i.id === 'unknown')?.plate).toBeNull()
  })
})