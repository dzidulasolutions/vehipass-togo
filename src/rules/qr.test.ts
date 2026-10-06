import { describe, expect, it } from 'vitest'
import { buildQrToken, buildQrUrl, parseQrToken, signPublicId } from './qr'

const ID = '9f3a1c7e2b'

describe('jeton QR', () => {
  it('signe de façon stable et avec 8 caractères hexadécimaux', () => {
    expect(signPublicId(ID)).toBe(signPublicId(ID))
    expect(signPublicId(ID)).toMatch(/^[0-9a-f]{8}$/)
    expect(signPublicId(ID)).not.toBe(signPublicId('4be82d10a7'))
  })

  it('lit un jeton qu’il a lui-même construit', () => {
    expect(parseQrToken(buildQrToken(ID))).toEqual({ publicId: ID, signatureValid: true })
  })

  it('lit une adresse complète, avec espaces ou paramètres autour', () => {
    const url = buildQrUrl('https://vehipass.example/', ID)
    expect(url).toBe(`https://vehipass.example/v/${buildQrToken(ID)}`)
    expect(parseQrToken(`  ${url}  `)?.signatureValid).toBe(true)
    expect(parseQrToken(`${url}?source=camera#x`)?.signatureValid).toBe(true)
  })

  it('reconnaît une signature fausse (QR fabriqué)', () => {
    expect(parseQrToken(`${ID}.00000000`)).toEqual({ publicId: ID, signatureValid: false })
  })

  it('une signature valide pour un autre identifiant ne marche pas', () => {
    const other = signPublicId('4be82d10a7')
    expect(parseQrToken(`${ID}.${other}`)?.signatureValid).toBe(false)
  })

  it.each([
    ['vide', ''],
    ['sans signature', ID],
    ['identifiant trop court', 'abc.12345678'],
    ['identifiant non hexadécimal', 'zzzzzzzzzz.12345678'],
    ['signature trop courte', `${ID}.1234`],
    ['trop de parties', `${ID}.12345678.ab`],
    ['texte quelconque', 'bonjour tout le monde'],
  ])('rejette un format illisible : %s', (_label, scanned) => {
    expect(parseQrToken(scanned)).toBeNull()
  })
})