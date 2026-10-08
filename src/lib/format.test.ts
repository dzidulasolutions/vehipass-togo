import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatDayLabel, formatDaysLeft, getInitials, plural } from './format'

describe('format', () => {
  it('accorde jour / jours', () => {
    expect(plural(0, 'jour')).toBe('jour')
    expect(plural(1, 'jour')).toBe('jour')
    expect(plural(2, 'jour')).toBe('jours')
  })

  it('met une date au format JJ/MM/AAAA', () => {
    expect(formatDate('2026-10-05')).toBe('05/10/2026')
    expect(formatDate('2026-10-05T10:00:00Z')).toBe('05/10/2026')
  })

  it('met une date-heure au format JJ/MM HH:mm', () => {
    expect(formatDateTime('2026-10-05T09:07:00Z')).toBe('05/10 09:07')
    expect(formatDateTime('2026-12-31T23:59:00Z')).toBe('31/12 23:59')
  })

  it('décrit les jours restants avant une échéance', () => {
    expect(formatDaysLeft(12)).toBe('Expire dans 12 jours')
    expect(formatDaysLeft(1)).toBe('Expire dans 1 jour')
    expect(formatDaysLeft(0)).toBe("Expire aujourd'hui")
    expect(formatDaysLeft(-1)).toBe('Expiré depuis 1 jour')
    expect(formatDaysLeft(-4)).toBe('Expiré depuis 4 jours')
  })
})

describe('formatDayLabel et getInitials', () => {
  it('dit aujourd’hui, hier, ou la date', () => {
    expect(formatDayLabel('2026-10-05', '2026-10-05')).toBe("Aujourd'hui")
    expect(formatDayLabel('2026-10-04', '2026-10-05')).toBe('Hier')
    expect(formatDayLabel('2026-10-01', '2026-10-05')).toBe('01/10/2026')
  })

  it('calcule les initiales', () => {
    expect(getInitials('Agent Démo 1')).toBe('AD')
    expect(getInitials('Kossi')).toBe('K')
    expect(getInitials('  ')).toBe('')
  })
})