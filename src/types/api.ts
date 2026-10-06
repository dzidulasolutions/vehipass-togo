import type { VerdictResult } from '../rules/verdict'
import type { Role } from './types'

export type ApiMode = 'mock' | 'http'

export interface AppInfo {
  mode: ApiMode
  version: string
  /** Heure du serveur (ISO). En mode mock : l'horloge simulée. */
  serverTime: string
}

/** Session ouverte après une connexion complète (identifiant + code temporaire). */
export interface Session {
  token: string
  userId: string
  role: Role
  name: string
}

export type LoginCredentials =
  | { kind: 'agent'; badge: string; password: string }
  | { kind: 'owner'; idRef: string }

export interface LoginChallenge {
  challengeId: string
}

/** Ce qu'un agent voit du véhicule : de quoi le reconnaître, rien de personnel. */
export interface AgentVehicleView {
  plate: string
  brand: string
  model: string
  color: string
  hasDeclaredDriver: boolean
}

export interface VerifyResult {
  verdict: VerdictResult
  /** null quand le verdict n'expose aucune donnée (QR inconnu, invalide ou révoqué). */
  vehicle: AgentVehicleView | null
  /** Contrôle enregistré (null si le rôle n'enregistre pas de contrôle). */
  controlId: string | null
  checkedAt: string
}

/** Statut minimal visible par n'importe qui. */
export interface PublicStatus {
  label: string
}

/**
 * Contrat unique entre l'interface et les données.
 * Chaque fonctionnalité ajoute ses méthodes ici ; le mock ET le client http
 * doivent alors les implémenter, sinon TypeScript refuse de compiler.
 */
export interface Api {
  getAppInfo(): Promise<AppInfo>

  // Authentification en deux temps : identifiant, puis code temporaire
  login(credentials: LoginCredentials): Promise<LoginChallenge>
  verifyOtp(challengeId: string, code: string): Promise<Session>
  logout(): Promise<void>

  // Public (anonyme)
  getPublicStatus(scannedToken: string): Promise<PublicStatus>

  // Agent
  verifyQr(scannedToken: string): Promise<VerifyResult>
}