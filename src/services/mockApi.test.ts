import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockApi, randomLatency } from './mockApi'
import { setNetwork } from './network'

describe('randomLatency', () => {
  it('reste dans l’intervalle demandé', () => {
    expect(randomLatency(300, 800, () => 0)).toBe(300)
    expect(randomLatency(300, 800, () => 1)).toBe(800)
    expect(randomLatency(300, 800, () => 0.5)).toBe(550)
  })
})

describe('mockApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setNetwork('online')
  })

  afterEach(() => {
    vi.useRealTimers()
    setNetwork('online')
  })

  it('répond après la latence simulée', async () => {
    const promise = createMockApi().getAppInfo()
    await vi.advanceTimersByTimeAsync(1000)
    await expect(promise).resolves.toMatchObject({ mode: 'mock' })
  })

  it('échoue avec le code NETWORK quand le réseau est coupé', async () => {
    setNetwork('offline')
    const assertion = expect(createMockApi().getAppInfo()).rejects.toMatchObject({ code: 'NETWORK' })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})