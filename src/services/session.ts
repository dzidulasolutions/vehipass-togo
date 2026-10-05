const KEY = 'vehipass.session.token'
let memoryToken: string | null = null

/** Jeton de session du prototype. Dans un vrai système : cookie httpOnly, pas de stockage navigateur. */
export function getToken(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return memoryToken
    return sessionStorage.getItem(KEY)
  } catch {
    return memoryToken
  }
}

export function setToken(token: string | null): void {
  memoryToken = token
  try {
    if (typeof sessionStorage === 'undefined') return
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    // stockage indisponible : le jeton reste en mémoire
  }
}