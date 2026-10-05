export type NetworkState = 'online' | 'offline'

const KEY = 'vehipass.network'
const listeners = new Set<() => void>()

function read(): NetworkState {
  try {
    if (typeof localStorage === 'undefined') return 'online'
    return localStorage.getItem(KEY) === 'offline' ? 'offline' : 'online'
  } catch {
    return 'online'
  }
}

let state: NetworkState = read()

export function getNetwork(): NetworkState {
  return state
}

export function isNetworkOnline(): boolean {
  return state === 'online'
}

export function setNetwork(next: NetworkState): void {
  state = next
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, next)
  } catch {
    // stockage indisponible : l'état reste en mémoire
  }
  listeners.forEach((listener) => listener())
}

/** Pour useSyncExternalStore : l'interface se met à jour quand l'état réseau change. */
export function subscribeNetwork(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}