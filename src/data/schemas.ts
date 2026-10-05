import { z } from 'zod'
import type {
  ChangeRequest,
  Config,
  Control,
  Db,
  DriverAuthorization,
  Organisation,
  AuditEntry,
  Ownership,
  Payment,
  Penalty,
  PenaltyCatalogItem,
  Person,
  QrToken,
  SmsMessage,
  User,
  Vehicle,
  VehicleDocument,
} from '../types/types'

const id = z.string().min(1)
const nullableId = id.nullable()
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date attendue : AAAA-MM-JJ')
const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, 'date-heure ISO attendue')

const vehicleStatus = z.enum(['ACTIF', 'A_VERIFIER', 'SUSPENDU', 'INACTIF', 'SIGNALE'])
const documentType = z.enum(['registration', 'insurance', 'technical_inspection'])
const documentStatus = z.enum(['VALIDE', 'EXPIRE', 'SUSPENDU', 'EN_ATTENTE', 'REVOQUE', 'NON_TROUVE'])
const qrStatus = z.enum(['ACTIF', 'REVOQUE', 'REMPLACE'])
const penaltyStatus = z.enum(['BROUILLON', 'VALIDE', 'NOTIFIE', 'CONTESTE', 'PAYE', 'ANNULE'])
const verdictCode = z.enum([
  'VERIFICATION_IMPOSSIBLE',
  'CODE_REVOQUE',
  'VEHICULE_SUSPENDU',
  'A_VERIFIER',
  'REACTIVATION_REQUISE',
  'DOCUMENT_A_REGULARISER',
  'CONFORME',
])

// `satisfies` : si un schéma et son type TypeScript divergent, ça ne compile plus.
export const organisationSchema = z.object({
  id,
  name: z.string().min(1),
  type: z.enum(['transport_admin', 'insurer', 'inspection_center', 'police']),
}) satisfies z.ZodType<Organisation>

export const userSchema = z.object({
  id,
  org_id: id,
  role: z.enum(['control_agent', 'admin_agent', 'institution_admin']),
  name: z.string().min(1),
  badge: z.string().min(1),
  status: z.enum(['active', 'disabled']),
}) satisfies z.ZodType<User>

export const personSchema = z.object({
  id,
  full_name: z.string().min(1),
  id_ref: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
}) satisfies z.ZodType<Person>

export const vehicleSchema = z.object({
  id,
  public_id: z.string().regex(/^[0-9a-f]{10,}$/, 'identifiant public hexadécimal attendu'),
  plate: z.string().min(1),
  vin: z.string().min(1),
  category: z.literal('moto'),
  brand: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  registration_date: isoDate,
  admin_status: vehicleStatus,
  activated_until: isoDate,
  creation_status: z.enum(['EN_ATTENTE_VALIDATION', 'VALIDE']),
  created_by: id,
  approved_by: nullableId,
}) satisfies z.ZodType<Vehicle>

export const ownershipSchema = z.object({
  id,
  vehicle_id: id,
  person_id: id,
  start_date: isoDate,
  end_date: isoDate.nullable(),
}) satisfies z.ZodType<Ownership>

export const documentSchema = z.object({
  id,
  vehicle_id: id,
  type: documentType,
  status: documentStatus,
  issue_date: isoDate,
  valid_until: isoDate,
  issuer_org_id: id,
  reference: z.string().min(1),
}) satisfies z.ZodType<VehicleDocument>

export const qrTokenSchema = z.object({
  id,
  vehicle_id: id,
  public_id: z.string().regex(/^[0-9a-f]{10,}$/, 'identifiant public hexadécimal attendu'),
  status: qrStatus,
  issued_at: isoDate,
  revoked_at: isoDate.nullable(),
  replaced_by: nullableId,
}) satisfies z.ZodType<QrToken>

export const driverAuthorizationSchema = z.object({
  id,
  vehicle_id: id,
  driver_name: z.string().min(1),
  driver_ref: z.string().min(1),
  valid_from: isoDate,
  valid_until: isoDate,
  status: z.enum(['active', 'expired']),
}) satisfies z.ZodType<DriverAuthorization>

export const penaltyCatalogItemSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  amount_xof: z.number().int().positive(),
  legal_ref: z.string().min(1),
}) satisfies z.ZodType<PenaltyCatalogItem>

export const penaltySchema = z.object({
  id,
  vehicle_id: id,
  catalog_code: z.string().min(1),
  amount_xof: z.number().int().positive(),
  agent_id: id,
  status: penaltyStatus,
  created_at: isoDateTime,
  origin: z.enum(['online', 'offline']),
  contest: z
    .object({
      reason: z.string().min(1),
      created_at: isoDateTime,
      decision: z.enum(['ANNULE', 'MAINTENU']).nullable(),
    })
    .nullable(),
  payment_id: nullableId,
}) satisfies z.ZodType<Penalty>

export const paymentSchema = z.object({
  id,
  penalty_ids: z.array(id).min(1),
  amount_xof: z.number().int().positive(),
  reference: z.string().min(1),
  method: z.string().min(1),
  paid_at: isoDateTime,
  recipient: z.string().min(1),
}) satisfies z.ZodType<Payment>

export const controlSchema = z.object({
  id,
  agent_id: id,
  vehicle_id: nullableId,
  scanned_public_id: z.string().min(1),
  timestamp: isoDateTime,
  verdict: verdictCode,
  mode: z.enum(['online', 'offline']),
}) satisfies z.ZodType<Control>

export const changeRequestSchema = z.object({
  id,
  vehicle_id: id,
  requested_by: id,
  type: z.enum(['vente', 'correction', 'adresse']),
  payload: z.record(z.string(), z.string()),
  status: z.enum(['pending', 'approved', 'rejected']),
}) satisfies z.ZodType<ChangeRequest>

export const smsMessageSchema = z.object({
  id,
  to: z.string().min(1),
  body: z.string().min(1),
  sent_at: isoDateTime,
}) satisfies z.ZodType<SmsMessage>

export const auditEntrySchema = z.object({
  id,
  actor_id: id,
  action: z.string().min(1),
  entity: z.string().min(1),
  entity_id: z.string().min(1),
  timestamp: isoDateTime,
  prev_hash: z.string(),
  hash: z.string().min(1),
}) satisfies z.ZodType<AuditEntry>

export const configSchema = z.object({
  activation_months: z.number().int().positive(),
  grace_days: z.number().int().min(0),
  registration_fee_xof: z.number().int().min(0),
  snapshot_hours: z.number().int().positive(),
}) satisfies z.ZodType<Config>

export const dbSchema = z.object({
  meta: z.object({ version: z.number().int().positive(), generated_at: isoDate }),
  config: configSchema,
  organisations: z.array(organisationSchema),
  users: z.array(userSchema),
  persons: z.array(personSchema),
  vehicles: z.array(vehicleSchema),
  ownerships: z.array(ownershipSchema),
  documents: z.array(documentSchema),
  qr_tokens: z.array(qrTokenSchema),
  driver_authorizations: z.array(driverAuthorizationSchema),
  penalty_catalog: z.array(penaltyCatalogItemSchema),
  penalties: z.array(penaltySchema),
  payments: z.array(paymentSchema),
  controls: z.array(controlSchema),
  change_requests: z.array(changeRequestSchema),
  sms_outbox: z.array(smsMessageSchema),
  audit_log: z.array(auditEntrySchema),
}) satisfies z.ZodType<Db>