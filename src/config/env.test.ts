import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('applique les valeurs par défaut (mode mock)', () => {
    const env = parseEnv({})
    expect(env.VITE_API_MODE).toBe('mock')
    expect(env.VITE_API_TIMEOUT_MS).toBe(10000)
    expect(env.VITE_MOCK_LATENCY_MIN).toBe(300)
  })

  it('accepte le mode http et retire le slash final', () => {
    const env = parseEnv({ VITE_API_MODE: 'http', VITE_API_URL: 'https://api.exemple.tg/' })
    expect(env.VITE_API_URL).toBe('https://api.exemple.tg')
  })

  it('refuse le mode http sans URL', () => {
    expect(() => parseEnv({ VITE_API_MODE: 'http' })).toThrow(/VITE_API_URL/)
  })

  it('refuse un mode inconnu', () => {
    expect(() => parseEnv({ VITE_API_MODE: 'autre' })).toThrow(/VITE_API_MODE/)
  })

  it('refuse une latence minimale supérieure à la maximale', () => {
    expect(() => parseEnv({ VITE_MOCK_LATENCY_MIN: '900', VITE_MOCK_LATENCY_MAX: '100' })).toThrow(
      /VITE_MOCK_LATENCY_MIN/,
    )
  })
})