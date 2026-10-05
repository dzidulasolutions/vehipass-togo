import { env } from '../config/env'
import type { Api } from '../types/api'
import { createHttpApi } from './httpApi'
import { createMockApi } from './mockApi'

/** Seul point d'entrée de l'interface vers les données. Le mode vient du fichier .env. */
export const api: Api = env.VITE_API_MODE === 'http' ? createHttpApi() : createMockApi()