import { z } from 'zod'
import { env } from '../config/env'
import type { Api, AppInfo } from '../types/api'
import { createHttpClient, type HttpClient } from './http'
import { getToken } from './session'

const appInfoSchema = z.object({ version: z.string(), serverTime: z.string() })

export function createHttpApi(
  client: HttpClient = createHttpClient({
    baseUrl: env.VITE_API_URL,
    timeoutMs: env.VITE_API_TIMEOUT_MS,
    getToken,
  }),
): Api {
  return {
    async getAppInfo(): Promise<AppInfo> {
      const data = await client.get('/health', { schema: appInfoSchema })
      return { mode: 'http', ...data }
    },
  }
}