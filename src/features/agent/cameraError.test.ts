import { describe, expect, it } from 'vitest'
import { cameraErrorMessage } from './cameraError'

describe('cameraErrorMessage', () => {
  it('explique un accès refusé', () => {
    expect(cameraErrorMessage(new Error('NotAllowedError: Permission denied'))).toMatch(/refusé/)
    expect(cameraErrorMessage('NotAllowedError')).toMatch(/refusé/)
  })

  it('explique l’absence de caméra', () => {
    expect(cameraErrorMessage(new Error('NotFoundError: Requested device not found'))).toMatch(/Aucune caméra/)
  })

  it('explique une caméra déjà utilisée', () => {
    expect(cameraErrorMessage(new Error('NotReadableError: Could not start video source'))).toMatch(/utilisée/)
  })

  it('reste lisible pour une erreur inconnue', () => {
    expect(cameraErrorMessage(new Error('???'))).toBe("Impossible d'activer la caméra.")
  })
})