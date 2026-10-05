import type { ZodType } from 'zod'
import { ApiError, codeFromStatus } from './errors'

export type HttpClientOptions = {
  baseUrl: string
  timeoutMs: number
  getToken: () => string | null
  /** Injectable pour les tests ; par défaut le fetch du navigateur. */
  fetchImpl?: typeof fetch
}

type RequestOptions<T> = {
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Si fourni, la réponse du serveur est validée avant d'arriver dans l'interface. */
  schema?: ZodType<T>
}

export function createHttpClient(options: HttpClientOptions) {
  const { baseUrl, timeoutMs, getToken } = options
  const doFetch: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init))

  async function request<T>(method: string, path: string, opts: RequestOptions<T> = {}): Promise<T> {
    const url = new URL(baseUrl + path)
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }

    const headers: Record<string, string> = { Accept: 'application/json' }
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    let response: Response
    try {
      response = await doFetch(url.toString(), {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: controller.signal,
      })
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Délai dépassé')
      }
      throw new ApiError('NETWORK', 'Réseau indisponible')
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      throw new ApiError(codeFromStatus(response.status), `HTTP ${response.status}`, response.status)
    }
    if (response.status === 204) return undefined as T

    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new ApiError('UNKNOWN', 'Réponse illisible')
    }

    if (!opts.schema) return data as T
    const parsed = opts.schema.safeParse(data)
    if (!parsed.success) throw new ApiError('UNKNOWN', 'Réponse inattendue du serveur')
    return parsed.data
  }

  return {
    get: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) => request<T>('GET', path, opts),
    post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions<T>, 'body'>) =>
      request<T>('POST', path, { ...opts, body }),
    put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions<T>, 'body'>) =>
      request<T>('PUT', path, { ...opts, body }),
    delete: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) => request<T>('DELETE', path, opts),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>