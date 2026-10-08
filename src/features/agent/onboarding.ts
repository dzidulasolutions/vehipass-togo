const KEY = 'vehipass.agent.onboarded'

export function hasSeenOnboarding(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingSeen(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, '1')
  } catch {
    // stockage indisponible : l'accueil réapparaîtra, sans gravité
  }
}