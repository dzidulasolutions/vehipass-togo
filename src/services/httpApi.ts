import { z } from 'zod'
import { env } from '../config/env'
import type { Api, AppInfo } from '../types/api'
import {
  loginChallengeSchema,
  publicStatusSchema,
  sessionSchema,
  verifyResultSchema,
} from './apiSchemas'
import { createHttpClient, type HttpClient } from './http'
import { clearSession, getToken, setSession } from './session'

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

    login: (credentials) => client.post('/auth/login', credentials, { schema: loginChallengeSchema }),

    async verifyOtp(challengeId, code) {
      const session = await client.post('/auth/otp', { challengeId, code }, { schema: sessionSchema })
      setSession(session)
      return session
    },

    async logout() {
      try {
        await client.post('/auth/logout')
      } finally {
        clearSession()
      }
    },

    getPublicStatus: (scannedToken) =>
      client.get(`/public/v/${encodeURIComponent(scannedToken)}`, { schema: publicStatusSchema }),

    verifyQr: (scannedToken) =>
      client.get(`/agent/verify/${encodeURIComponent(scannedToken)}`, { schema: verifyResultSchema }),
  }
}