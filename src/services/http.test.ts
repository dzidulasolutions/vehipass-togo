import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createHttpClient } from './http'

const BASE = 'https://api.test'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} })
    return respond()
  }) as typeof fetch
  return { impl, calls }
}

function makeClient(fetchImpl: typeof fetch, token: string | null = null) {
  return createHttpClient({ baseUrl: BASE, timeoutMs: 1000, getToken: () => token, fetchImpl })
}

describe('createHttpClient', () => {
  it('appelle la bonne URL avec la requête et le jeton', async () => {
    const { impl, calls } = fakeFetch(() => json({ ok: true }))
    await makeClient(impl, 'abc').get('/ping', { query: { a: 1, b: undefined } })
    expect(calls[0].url).toBe('https://api.test/ping?a=1')
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer abc')
  })

  it('valide la réponse avec un schéma Zod', async () => {
    const { impl } = fakeFetch(() => json({ version: '1' }))
    const data = await makeClient(impl).get('/x', { schema: z.object({ version: z.string() }) })
    expect(data.version).toBe('1')
  })

  it('rejette une réponse qui ne respecte pas le schéma', async () => {
    const { impl } = fakeFetch(() => json({ version: 42 }))
    await expect(
      makeClient(impl).get('/x', { schema: z.object({ version: z.string() }) }),
    ).rejects.toMatchObject({ code: 'UNKNOWN' })
  })

  it.each([
    [401, 'UNAUTHORIZED'],
    [500, 'SERVER'],
  ])('traduit le statut HTTP %i en code %s', async (status, code) => {
    const { impl } = fakeFetch(() => json({}, status))
    await expect(makeClient(impl).get('/x')).rejects.toMatchObject({ code })
  })

  it('signale une panne réseau', async () => {
    const impl = (async () => {
      throw new TypeError('Failed to fetch')
    }) as typeof fetch
    await expect(makeClient(impl).get('/x')).rejects.toMatchObject({ code: 'NETWORK' })
  })

  it('signale un délai dépassé', async () => {
    vi.useFakeTimers()
    try {
      const impl = ((_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          )
        })) as typeof fetch
      const client = createHttpClient({ baseUrl: BASE, timeoutMs: 500, getToken: () => null, fetchImpl: impl })
      const assertion = expect(client.get('/slow')).rejects.toMatchObject({ code: 'TIMEOUT' })
      await vi.advanceTimersByTimeAsync(600)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })
})