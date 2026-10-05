import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceDays, daysFromNow, now, resetClock, setNow } from './clock'

describe('clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'))
    resetClock()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('suit la date réelle par défaut', () => {
    expect(now().toISOString()).toBe('2026-10-05T10:00:00.000Z')
  })

  it('calcule des dates relatives à aujourd’hui', () => {
    expect(daysFromNow(0)).toBe('2026-10-05')
    expect(daysFromNow(-5)).toBe('2026-09-30')
    expect(daysFromNow(10)).toBe('2026-10-15')
  })

  it('avance la date simulée de 30 jours', () => {
    advanceDays(30)
    expect(daysFromNow(0)).toBe('2026-11-04')
  })

  it('fixe une date simulée précise', () => {
    setNow(new Date('2027-01-01T00:00:00Z'))
    expect(daysFromNow(0)).toBe('2027-01-01')
  })

  it('revient au temps réel après resetClock', () => {
    advanceDays(90)
    resetClock()
    expect(daysFromNow(0)).toBe('2026-10-05')
  })
})