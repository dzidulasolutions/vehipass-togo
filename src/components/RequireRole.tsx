import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import type { Role } from '../types/types'

/**
 * Confort d'interface : renvoie vers la connexion si le rôle ne convient pas.
 * Ce n'est PAS une sécurité : les droits sont vérifiés par l'API (voir authorize).
 */
export function RequireRole({
  roles,
  loginPath,
  children,
}: {
  roles: readonly Role[]
  loginPath: string
  children: ReactNode
}) {
  const session = useSession()
  const location = useLocation()
  if (!session || !roles.includes(session.role)) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}