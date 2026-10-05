import { beforeEach, describe, expect, it } from 'vitest'
import { getDb, resetDb, updateDb } from './db'

describe('db', () => {
  beforeEach(() => {
    resetDb()
  })

  it('démarre avec les données de démo', () => {
    expect(getDb().vehicles.length).toBeGreaterThanOrEqual(10)
  })

  it('conserve une modification', () => {
    updateDb((db) => {
      db.vehicles[0].admin_status = 'SUSPENDU'
    })
    expect(getDb().vehicles[0].admin_status).toBe('SUSPENDU')
  })

  it('annule la modification si elle échoue en cours de route', () => {
    expect(() =>
      updateDb((db) => {
        db.vehicles[0].admin_status = 'SUSPENDU'
        throw new Error('panne')
      }),
    ).toThrow('panne')
    expect(getDb().vehicles[0].admin_status).toBe('ACTIF')
  })

  it('resetDb remet les données initiales', () => {
    updateDb((db) => {
      db.vehicles.length = 0
    })
    resetDb()
    expect(getDb().vehicles.length).toBeGreaterThanOrEqual(10)
  })
})