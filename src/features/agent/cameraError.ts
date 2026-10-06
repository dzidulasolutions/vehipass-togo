/** Traduit l'erreur technique de la caméra en phrase compréhensible. */
export function cameraErrorMessage(error: unknown): string {
  const text = String(error)
  if (/NotAllowed|Permission|denied/i.test(text)) {
    return "L'accès à la caméra est refusé. Autorisez-la dans les réglages du navigateur, ou utilisez les QR de démo."
  }
  if (/NotFound|no camera/i.test(text)) return 'Aucune caméra détectée sur cet appareil.'
  if (/NotReadable|in use/i.test(text)) return 'La caméra est utilisée par une autre application.'
  return "Impossible d'activer la caméra."
}