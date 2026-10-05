import { env } from '../config/env'
import type { Api } from '../types/api'
import { now } from './clock'
import { ApiError } from './errors'
import { isNetworkOnline } from './network'

const MOCK_VERSION = '0.1.0'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function randomLatency(min: number, max: number, random: () => number = Math.random): number {
  return Math.round(min + random() * (max - min))
}

/** Simule un aller-retour réseau : attente, éventuelle coupure, puis résultat. */
export async function simulate<T>(compute: () => T): Promise<T> {
  await sleep(randomLatency(env.VITE_MOCK_LATENCY_MIN, env.VITE_MOCK_LATENCY_MAX))
  if (!isNetworkOnline()) throw new ApiError('NETWORK', 'Réseau coupé (simulation)')
  return compute()
}

export function createMockApi(): Api {
  return {
    getAppInfo: () =>
      simulate(() => ({
        mode: 'mock' as const,
        version: MOCK_VERSION,
        serverTime: now().toISOString(),
      })),
  }
}