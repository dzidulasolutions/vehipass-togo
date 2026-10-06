import { describe, expect, it } from 'vitest'
import { addDays, addMonths, daysBetween, toIsoDate } from './dates'

describe('dates', () => {
  it('formate une date en AAAA-MM-JJ', () => {
    expect(toIsoDate(new Date('2026-10-05T23:30:00Z'))).toBe('2026-10-05')
  })

  it('compte les jours entre deux dates', () => {
    expect(daysBetween('2026-10-05', '2026-10-15')).toBe(10)
    expect(daysBetween('2026-10-15', '2026-10-05')).toBe(-10)
    expect(daysBetween('2026-10-05', '2026-10-05')).toBe(0)
    expect(daysBetween('2026-12-25', '2027-01-05')).toBe(11)
  })

  it('ajoute des jours, en avant et en arrière', () => {
    expect(addDays('2026-10-05', 30)).toBe('2026-11-04')
    expect(addDays('2026-10-05', -5)).toBe('2026-09-30')
  })

  it('ajoute des mois', () => {
    expect(addMonths('2026-10-05', 6)).toBe('2027-04-05')
  })

  it('ramène au dernier jour du mois quand le jour n’existe pas', () => {
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28')
    expect(addMonths('2027-08-31', 6)).toBe('2028-02-29')
  })
})