import { env } from '../config/env'
import { can, publicStatusLabel, type Permission } from '../rules/access'
import { toIsoDate } from '../rules/dates'
import { countUnpaid } from '../rules/penalties'
import { parseQrToken } from '../rules/qr'
import { computeVerdict, verdictExposesData } from '../rules/verdict'
import type {
  AgentVehicleView,
  Api,
  ControlListItem,
  LoginChallenge,
  LoginCredentials,
  PublicStatus,
  Session,
  VerifyResult,
} from '../types/api'
import type { Control, Db, Role, Vehicle } from '../types/types'
import { recordAudit } from './audit'
import { now } from './clock'
import { getDb, updateDb } from './db'
import { ApiError } from './errors'
import { isNetworkOnline } from './network'
import { clearSession, getSession, setSession } from './session'

const MOCK_VERSION = '0.1.0'

/** Identifiants de démonstration, identiques pour tous : la sécurité est simulée. */
export const DEMO_PASSWORD = 'demo1234'
export const DEMO_OTP = '123456'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function randomLatency(min: number, max: number, random: () => number = Math.random): number {
  return Math.round(min + random() * (max - min))
}

/** Simule un aller-retour réseau : attente, éventuelle coupure, puis résultat. */
export async function simulate<T>(compute: () => T | Promise<T>): Promise<T> {
  await sleep(randomLatency(env.VITE_MOCK_LATENCY_MIN, env.VITE_MOCK_LATENCY_MAX))
  if (!isNetworkOnline()) throw new ApiError('NETWORK', 'Réseau coupé (simulation)')
  return compute()
}

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`

// ---------- Authentification ----------

/** null = identifiant inconnu : le code sera toujours refusé, sans révéler que l'identifiant n'existe pas. */
type Challenge = { userId: string; name: string; role: Role } | null
const challenges = new Map<string, Challenge>()

async function login(credentials: LoginCredentials): Promise<LoginChallenge> {
  const db = getDb()
  const challengeId = newId('ch')

  if (credentials.kind === 'agent') {
    const user = db.users.find((u) => u.badge === credentials.badge && u.status === 'active')
    if (!user || credentials.password !== DEMO_PASSWORD) {
      await recordAudit({
        actorId: 'anonymous',
        action: 'auth.login_failed',
        entity: 'user',
        entityId: credentials.badge.slice(0, 32),
      })
      throw new ApiError('UNAUTHORIZED', 'Identifiants incorrects')
    }
    challenges.set(challengeId, { userId: user.id, name: user.name, role: user.role })
    return { challengeId }
  }

  const person = db.persons.find((p) => p.id_ref === credentials.idRef)
  if (person) {
    challenges.set(challengeId, { userId: person.id, name: person.full_name, role: 'owner' })
    updateDb((draft) => {
      draft.sms_outbox.push({
        id: newId('sms'),
        to: person.phone,
        body: `VéhiPass (démo) : votre code de connexion est ${DEMO_OTP}`,
        sent_at: now().toISOString(),
      })
    })
  } else {
    challenges.set(challengeId, null)
  }
  return { challengeId }
}

async function verifyOtp(challengeId: string, code: string): Promise<Session> {
  const challenge = challenges.get(challengeId)
  if (!challenge || code !== DEMO_OTP) {
    await recordAudit({
      actorId: challenge?.userId ?? 'anonymous',
      action: 'auth.otp_failed',
      entity: 'challenge',
      entityId: challengeId,
    })
    throw new ApiError('UNAUTHORIZED', 'Code incorrect')
  }
  challenges.delete(challengeId)
  const session: Session = {
    token: `mock.${challenge.userId}.${newId('t')}`,
    userId: challenge.userId,
    role: challenge.role,
    name: challenge.name,
  }
  setSession(session)
  await recordAudit({ actorId: challenge.userId, action: 'auth.login', entity: 'user', entityId: challenge.userId })
  return session
}

async function logout(): Promise<void> {
  const session = getSession()
  clearSession()
  if (session) {
    await recordAudit({ actorId: session.userId, action: 'auth.logout', entity: 'user', entityId: session.userId })
  }
}

// ---------- Droits ----------

type Actor = { userId: string; role: Role }

/**
 * Vérifie la session ET le droit. Le rôle est relu dans la base, pas dans la session :
 * un serveur ne croit jamais ce que le client prétend être.
 * Tout refus est journalisé.
 */
async function authorize(permission: Permission): Promise<Actor> {
  const session = getSession()
  const db = getDb()

  let actor: Actor | null = null
  if (session) {
    if (session.role === 'owner') {
      if (db.persons.some((p) => p.id === session.userId)) actor = { userId: session.userId, role: 'owner' }
    } else {
      const user = db.users.find((u) => u.id === session.userId && u.status === 'active')
      if (user) actor = { userId: user.id, role: user.role }
    }
  }

  if (!actor) {
    await recordAudit({
      actorId: session?.userId ?? 'anonymous',
      action: 'access.denied',
      entity: 'permission',
      entityId: permission,
    })
    throw new ApiError('UNAUTHORIZED', 'Session absente ou invalide')
  }
  if (!can(actor.role, permission)) {
    await recordAudit({ actorId: actor.userId, action: 'access.denied', entity: 'permission', entityId: permission })
    throw new ApiError('FORBIDDEN', 'Droit insuffisant')
  }
  return actor
}

// ---------- Vérification d'un QR ----------

function evaluateScan(db: Db, scannedToken: string) {
  const today = toIsoDate(now())
  const parsed = parseQrToken(scannedToken)
  // Une signature fausse = QR inconnu : on ne cherche même pas dans la base.
  const qr = parsed?.signatureValid ? (db.qr_tokens.find((q) => q.public_id === parsed.publicId) ?? null) : null
  const found = qr ? db.vehicles.find((v) => v.id === qr.vehicle_id) : undefined
  const vehicle = found && found.creation_status === 'VALIDE' ? found : null

  const verdict = computeVerdict({
    qr,
    vehicle,
    documents: vehicle ? db.documents.filter((d) => d.vehicle_id === vehicle.id) : [],
    unpaidPenaltyCount: vehicle ? countUnpaid(db.penalties.filter((p) => p.vehicle_id === vehicle.id)) : 0,
    today,
    graceDays: db.config.grace_days,
  })
  return { today, parsed, qr, vehicle, verdict }
}

function toAgentView(db: Db, vehicle: Vehicle, today: string): AgentVehicleView {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    color: vehicle.color,
    hasDeclaredDriver: db.driver_authorizations.some(
      (d) => d.vehicle_id === vehicle.id && d.status === 'active' && d.valid_from <= today && today <= d.valid_until,
    ),
  }
}

async function verifyQr(scannedToken: string): Promise<VerifyResult> {
  const actor = await authorize('verify.full')
  const db = getDb()
  const { today, parsed, qr, vehicle, verdict } = evaluateScan(db, scannedToken)

  let controlId: string | null = null
  if (can(actor.role, 'control.create')) {
    controlId = newId('ctl')
    const control: Control = {
      id: controlId,
      agent_id: actor.userId,
      vehicle_id: qr?.vehicle_id ?? null,
      scanned_public_id: parsed?.publicId ?? 'illisible',
      timestamp: now().toISOString(),
      verdict: verdict.code,
      mode: 'online',
    }
    updateDb((draft) => {
      draft.controls.push(control)
    })
  }

  await recordAudit({
    actorId: actor.userId,
    action: 'qr.verify',
    entity: 'qr',
    entityId: parsed?.publicId ?? 'illisible',
  })

  return {
    verdict,
    // Les verdicts « sans donnée » (vehicleStatus null) n'exposent aucun véhicule.
    vehicle: vehicle && verdict.vehicleStatus !== null ? toAgentView(db, vehicle, today) : null,
    controlId,
    checkedAt: now().toISOString(),
  }
}

function getPublicStatus(scannedToken: string): PublicStatus {
  return { label: publicStatusLabel(evaluateScan(getDb(), scannedToken).verdict.code) }
}

async function listMyControls(): Promise<ControlListItem[]> {
  const actor = await authorize('control.list_own')
  const db = getDb()
  return db.controls
    .filter((c) => c.agent_id === actor.userId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
    .map((c) => ({
      id: c.id,
      timestamp: c.timestamp,
      verdict: c.verdict,
      // La plaque n'apparaît que si le verdict l'avait déjà montrée à l'agent.
      plate: verdictExposesData(c.verdict) ? (db.vehicles.find((v) => v.id === c.vehicle_id)?.plate ?? null) : null,
      mode: c.mode,
    }))
}

export function createMockApi(): Api {
  return {
    getAppInfo: () =>
      simulate(() => ({
        mode: 'mock' as const,
        version: MOCK_VERSION,
        serverTime: now().toISOString(),
      })),
    login: (credentials) => simulate(() => login(credentials)),
    verifyOtp: (challengeId, code) => simulate(() => verifyOtp(challengeId, code)),
    logout: () => simulate(() => logout()),
    getPublicStatus: (scannedToken) => simulate(() => getPublicStatus(scannedToken)),
    verifyQr: (scannedToken) => simulate(() => verifyQr(scannedToken)),
        listMyControls: () => simulate(() => listMyControls()),
  }
}