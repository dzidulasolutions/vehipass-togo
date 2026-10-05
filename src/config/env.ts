import { z } from 'zod'

const envSchema = z
  .object({
    VITE_API_MODE: z.enum(['mock', 'http']).default('mock'),
    VITE_API_URL: z
      .string()
      .trim()
      .transform((url) => url.replace(/\/+$/, ''))
      .default(''),
    VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    VITE_MOCK_LATENCY_MIN: z.coerce.number().int().min(0).default(300),
    VITE_MOCK_LATENCY_MAX: z.coerce.number().int().min(0).default(800),
  })
  .superRefine((value, ctx) => {
    if (value.VITE_API_MODE === 'http' && !/^https?:\/\/.+/.test(value.VITE_API_URL)) {
      ctx.addIssue({
        code: 'custom',
        path: ['VITE_API_URL'],
        message: 'doit être une URL http(s) quand VITE_API_MODE=http',
      })
    }
    if (value.VITE_MOCK_LATENCY_MIN > value.VITE_MOCK_LATENCY_MAX) {
      ctx.addIssue({
        code: 'custom',
        path: ['VITE_MOCK_LATENCY_MIN'],
        message: 'ne peut pas dépasser VITE_MOCK_LATENCY_MAX',
      })
    }
  })

export type Env = z.infer<typeof envSchema>

/** Valide les variables d'environnement ; échoue tôt avec un message clair. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw)
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.')} : ${issue.message}`)
      .join('\n')
    throw new Error(`Configuration invalide (fichier .env) :\n${details}`)
  }
  return result.data
}

export const env: Env = parseEnv(import.meta.env)