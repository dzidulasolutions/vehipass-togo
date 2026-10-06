import { useSyncExternalStore } from 'react'
import { getSession, subscribeSession } from '../services/session'

/** Session courante ; l'interface se met à jour à la connexion et à la déconnexion. */
export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession)
}