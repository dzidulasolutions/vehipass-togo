export type ApiMode = 'mock' | 'http'

export interface AppInfo {
  mode: ApiMode
  version: string
  /** Heure du serveur (ISO). En mode mock : l'horloge simulée. */
  serverTime: string
}

/**
 * Contrat unique entre l'interface et les données.
 * Chaque fonctionnalité ajoute ses méthodes ici ; le mock ET le client http
 * doivent alors les implémenter, sinon TypeScript refuse de compiler.
 */
export interface Api {
  getAppInfo(): Promise<AppInfo>
}