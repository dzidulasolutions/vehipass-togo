import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, signPublicId } from '../rules/qr'
import { verifyChain } from './audit'
import { getDb, resetDb, updateDb } from './db'
import { DEMO_OTP, DEMO_PASSWORD, createMockApi } from './mockApi'
import { setNetwork } from './network'
import { clearSession, getSession, setSession } from './session'

const api = createMockApi()

/** Laisse passer la latence simulée, puis rend le résultat (ou l'erreur) de l'appel. */
function call<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  )
  return vi
    .advanceTimersByTimeAsync(2000)
    .then(() => settled)
    .then((result) => {
      if (result.ok) return result.value
      throw result.error
    })
}
    const before = getDb().controls.length

async function loginAgent(badge = 'AG-001') {
  const challenge = await call(api.login({ kind: 'agent', badge, password: DEMO_PASSWORD }))
  return call(api.verifyOtp(challenge.challengeId, DEMO_OTP))
}

const vehicleOf = (id: string) => {
  const found = getDb().vehicles.find((v) => v.id === id)
  if (!found) throw new Error(`véhicule introuvable : ${id}`)
  return found
}
const tokenOf = (vehicleId: string) => buildQrToken(vehicleOf(vehicleId).public_id)
const auditActions = () => getDb().audit_log.map((e) => e.action)
describe('connexion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetDb()
    clearSession()
    setNetwork('online')
  })
  afterEach(() => {
    vi.useRealTimers()
    clearSession()
  })

  it('ouvre une session pour un agent (identifiant, mot de passe puis code)', async () => {
    const session = await loginAgent()
    expect(session).toMatchObject({ userId: 'u_agent1', role: 'control_agent', name: 'Agent Démo 1' })
    expect(getSession()?.userId).toBe('u_agent1')
    expect(auditActions()).toContain('auth.login')
  })

  it('refuse un mauvais mot de passe et le journalise', async () => {
    await expect(
      call(api.login({ kind: 'agent', badge: 'AG-001', password: 'faux' })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(auditActions()).toContain('auth.login_failed')
    expect(getSession()).toBeNull()
  })

  it('refuse un code temporaire incorrect', async () => {
    const challenge = await call(api.login({ kind: 'agent', badge: 'AG-001', password: DEMO_PASSWORD }))
    await expect(call(api.verifyOtp(challenge.challengeId, '000000'))).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
    expect(auditActions()).toContain('auth.otp_failed')
    expect(getSession()).toBeNull()
  })

  it('envoie un SMS au propriétaire, qui se connecte avec ce code', async () => {
    const challenge = await call(api.login({ kind: 'owner', idRef: 'ID-DEMO-0001' }))
    const sms = getDb().sms_outbox.find((m) => m.to === '+228 90 00 00 01')
    expect(sms?.body).toContain(DEMO_OTP)
    const session = await call(api.verifyOtp(challenge.challengeId, DEMO_OTP))
    expect(session).toMatchObject({ role: 'owner', name: 'Kossi Démo' })
  })

  it('ne révèle pas qu’une pièce d’identité est inconnue : même réponse, aucun SMS, code refusé', async () => {
    const before = getDb().sms_outbox.length
    const challenge = await call(api.login({ kind: 'owner', idRef: 'ID-INCONNU' }))
    expect(challenge.challengeId).toBeTruthy()
    expect(getDb().sms_outbox).toHaveLength(before)
    await expect(call(api.verifyOtp(challenge.challengeId, DEMO_OTP))).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('ferme la session à la déconnexion', async () => {
    await loginAgent()
    await call(api.logout())
    expect(getSession()).toBeNull()
    expect(auditActions()).toContain('auth.logout')
  })
})

describe('vérification d’un QR', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetDb()
    clearSession()
    setNetwork('online')
  })
  afterEach(() => {
    vi.useRealTimers()
    clearSession()
  })

  it('refuse sans session et journalise la tentative', async () => {
    await expect(call(api.verifyQr(tokenOf('v1')))).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    const denied = getDb().audit_log.find((e) => e.action === 'access.denied')
    expect(denied).toMatchObject({ actor_id: 'anonymous', entity_id: 'verify.full' })
  })

  it('refuse un propriétaire (droit insuffisant) et journalise la tentative', async () => {
    const challenge = await call(api.login({ kind: 'owner', idRef: 'ID-DEMO-0001' }))
    await call(api.verifyOtp(challenge.challengeId, DEMO_OTP))
    await expect(call(api.verifyQr(tokenOf('v1')))).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(getDb().audit_log.some((e) => e.action === 'access.denied' && e.actor_id === 'p1')).toBe(true)
  })

  it('v1 conforme : verdict vert, véhicule visible, contrôle enregistré', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(tokenOf('v1')))
    expect(result.verdict.code).toBe('CONFORME')
    expect(result.vehicle).toMatchObject({ plate: 'TG-DEMO-001', hasDeclaredDriver: false })
    expect(result.controlId).not.toBeNull()
    expect(getDb().controls.at(-1)).toMatchObject({
      id: result.controlId,
      agent_id: 'u_agent1',
      vehicle_id: 'v1',
      verdict: 'CONFORME',
      mode: 'online',
    })
    expect(auditActions()).toContain('qr.verify')
  })

  it('accepte aussi l’adresse complète contenue dans le QR', async () => {
    await loginAgent()
    const url = `https://vehipass.example/v/${tokenOf('v1')}`
    expect((await call(api.verifyQr(url))).verdict.code).toBe('CONFORME')
  })

  it('QR fabriqué (identifiant réel, fausse signature) : vérification impossible, aucune donnée', async () => {
    await loginAgent()
    const forged = `${vehicleOf('v1').public_id}.00000000`
    expect(forged.endsWith(signPublicId(vehicleOf('v1').public_id))).toBe(false)
    const result = await call(api.verifyQr(forged))
    expect(result.verdict.code).toBe('VERIFICATION_IMPOSSIBLE')
    expect(result.vehicle).toBeNull()
    expect(result.verdict.documents).toEqual([])
    expect(getDb().controls.at(-1)?.vehicle_id).toBeNull()
  })

  it('QR inconnu (signature valide, aucun dossier) : vérification impossible', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(buildQrToken('0123456789abcdef')))
    expect(result.verdict.code).toBe('VERIFICATION_IMPOSSIBLE')
    expect(result.vehicle).toBeNull()
  })

  it('contenu illisible : vérification impossible, enregistré sans copier le contenu', async () => {
    await loginAgent()
    const result = await call(api.verifyQr('bonjour tout le monde'))
    expect(result.verdict.code).toBe('VERIFICATION_IMPOSSIBLE')
        expect(getDb().controls.at(-1)?.scanned_public_id).toBe('illisible')
  })

  it('v5 : l’ancien QR révoqué affiche « Code révoqué » sans donnée', async () => {
    await loginAgent()
    const oldQr = getDb().qr_tokens.find((q) => q.id === 'q5a')
    const result = await call(api.verifyQr(buildQrToken(oldQr?.public_id ?? '')))
    expect(result.verdict.code).toBe('CODE_REVOQUE')
    expect(result.vehicle).toBeNull()
  })

  it('v5 : le nouveau QR fonctionne', async () => {
    await loginAgent()
    expect((await call(api.verifyQr(tokenOf('v5')))).verdict.code).toBe('CONFORME')
  })

  it('v2 : assurance expirée, véhicule toujours actif', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(tokenOf('v2')))
    expect(result.verdict.code).toBe('DOCUMENT_A_REGULARISER')
    expect(result.verdict.vehicleStatus).toBe('ACTIF')
  })

  it('v4 : véhicule suspendu', async () => {
    await loginAgent()
    expect((await call(api.verifyQr(tokenOf('v4')))).verdict.code).toBe('VEHICULE_SUSPENDU')
  })

  it('v8 : réactivation requise, deux PV impayés annoncés par leur nombre', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(tokenOf('v8')))
    expect(result.verdict.code).toBe('REACTIVATION_REQUISE')
    expect(result.verdict.unpaidPenaltyCount).toBe(2)
  })

  it('v10 : conducteur déclaré, sans conclure à une infraction', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(tokenOf('v10')))
    expect(result.vehicle?.hasDeclaredDriver).toBe(true)
    expect(result.verdict.code).toBe('CONFORME')
  })

  it('le rôle vient de la base, pas de la session : une session falsifiée « admin » reste un agent', async () => {
    setSession({ token: 'x', userId: 'u_agent1', role: 'admin_agent', name: 'Faux admin' })
    const result = await call(api.verifyQr(tokenOf('v1')))
    expect(result.controlId).not.toBeNull() // seul un agent de contrôle enregistre un contrôle
  })

  it('refuse un compte désactivé', async () => {
    await loginAgent()
    updateDb((db) => {
      const user = db.users.find((u) => u.id === 'u_agent1')
      if (user) user.status = 'disabled'
    })
    await expect(call(api.verifyQr(tokenOf('v1')))).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('un administrateur peut vérifier mais n’enregistre pas de contrôle', async () => {
    await loginAgent('AD-001')
    const result = await call(api.verifyQr(tokenOf('v1')))
    expect(result.verdict.code).toBe('CONFORME')
    expect(result.controlId).toBeNull()
  })

  it('le public voit un statut minimal, sans session et sans contrôle enregistré', async () => {
    const valid = await call(api.getPublicStatus(tokenOf('v1')))
    const suspended = await call(api.getPublicStatus(tokenOf('v4')))
    expect(valid.label).toBe('Véhicule enregistré — statut : valide')
    expect(suspended.label).toBe('Véhicule enregistré — statut : à vérifier')
    expect(suspended.label).not.toMatch(/suspend/i)
    expect(getDb().controls).toHaveLength(before)  })

  it('toutes ces opérations laissent un journal d’audit dont la chaîne est valide', async () => {
    await loginAgent()
    await call(api.verifyQr(tokenOf('v1')))
    await call(api.verifyQr('illisible'))
    expect(getDb().audit_log.length).toBeGreaterThan(2)
    expect((await verifyChain(getDb().audit_log)).valid).toBe(true)
  })
})

describe('historique des contrôles', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetDb()
    clearSession()
    setNetwork('online')
  })
  afterEach(() => {
    vi.useRealTimers()
    clearSession()
  })

  it('refuse sans session', async () => {
    await expect(call(api.listMyControls())).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('refuse un propriétaire', async () => {
    const challenge = await call(api.login({ kind: 'owner', idRef: 'ID-DEMO-0001' }))
    await call(api.verifyOtp(challenge.challengeId, DEMO_OTP))
    await expect(call(api.listMyControls())).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('retourne uniquement les contrôles de l’agent, du plus récent au plus ancien', async () => {
    await loginAgent()
    const list = await call(api.listMyControls())
    const mine = getDb().controls.filter((c) => c.agent_id === 'u_agent1')
    expect(list).toHaveLength(mine.length)
    expect(list.length).toBeGreaterThan(0)
    const times = list.map((item) => item.timestamp)
    expect(times).toEqual([...times].sort().reverse())
  })

  it('masque la plaque quand le verdict n’exposait aucune donnée', async () => {
    await loginAgent()
    const list = await call(api.listMyControls())
    const hidden = list.filter((i) => i.verdict === 'VERIFICATION_IMPOSSIBLE' || i.verdict === 'CODE_REVOQUE')
    expect(hidden.length).toBeGreaterThan(0)
    for (const item of hidden) expect(item.plate).toBeNull()
    expect(list.some((i) => i.plate !== null)).toBe(true)
  })

  it('place un nouveau contrôle en tête de liste', async () => {
    await loginAgent()
    const result = await call(api.verifyQr(tokenOf('v4')))
    const list = await call(api.listMyControls())
    expect(list[0]).toMatchObject({ id: result.controlId, verdict: 'VEHICULE_SUSPENDU', plate: 'TG-DEMO-004' })
  })
})