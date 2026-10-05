export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | undefined

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 400 || status === 422) return 'VALIDATION'
  if (status >= 500) return 'SERVER'
  return 'UNKNOWN'
}

const USER_MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK: 'Pas de connexion. Vérifiez votre réseau puis réessayez.',
  TIMEOUT: 'Le service met trop de temps à répondre. Réessayez dans un instant.',
  UNAUTHORIZED: 'Votre session a expiré. Reconnectez-vous.',
  FORBIDDEN: "Vous n'avez pas accès à cette information.",
  NOT_FOUND: "Cette information n'existe pas ou n'est plus disponible.",
  VALIDATION: 'Certaines informations envoyées ne sont pas valides.',
  SERVER: 'Le service rencontre un problème. Réessayez plus tard.',
  UNKNOWN: "Une erreur inattendue s'est produite.",
}

/** Message affichable à l'utilisateur : jamais de code technique. */
export function toUserMessage(error: unknown): string {
  return error instanceof ApiError ? USER_MESSAGES[error.code] : USER_MESSAGES.UNKNOWN
}