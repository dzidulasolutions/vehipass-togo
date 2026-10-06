// ---------- Statuts ----------
export type Role =
  | 'control_agent'
  | 'admin_agent'
  | 'institution_admin'
  | 'owner'
  | 'issuer'

export type VehicleStatus = 'ACTIF' | 'A_VERIFIER' | 'SUSPENDU' | 'INACTIF' | 'SIGNALE'
export type DocumentType = 'registration' | 'insurance' | 'technical_inspection'
export type DocumentStatus =
  | 'VALIDE' | 'EXPIRE' | 'SUSPENDU' | 'EN_ATTENTE' | 'REVOQUE' | 'NON_TROUVE'
export type QrStatus = 'ACTIF' | 'REVOQUE' | 'REMPLACE'
export type ActivationStatus = 'ACTIVE' | 'GRACE' | 'REACTIVATION_REQUISE'
export type PenaltyStatus =
  | 'BROUILLON' | 'VALIDE' | 'NOTIFIE' | 'CONTESTE' | 'PAYE' | 'ANNULE'

export type VerdictCode =
  | 'VERIFICATION_IMPOSSIBLE'
  | 'CODE_REVOQUE'
  | 'VEHICULE_SUSPENDU'
  | 'A_VERIFIER'
  | 'REACTIVATION_REQUISE'
  | 'DOCUMENT_A_REGULARISER'
  | 'CONFORME'

export type VerdictColor = 'gris' | 'rouge' | 'orange' | 'vert'

// ---------- Entités ----------
export interface Organisation {
  id: string
  name: string
  type: 'transport_admin' | 'insurer' | 'inspection_center' | 'police'
}

export interface User {
  id: string
  org_id: string
  role: Exclude<Role, 'owner' | 'issuer'>
  name: string
  badge: string
  status: 'active' | 'disabled'
}

export interface Person {
  id: string
  full_name: string
  id_ref: string // référence fictive, jamais une vraie pièce
  phone: string
  address: string
}

export interface Vehicle {
  id: string
  public_id: string
  plate: string
  vin: string
  category: 'moto'
  brand: string
  model: string
  color: string
  registration_date: string // YYYY-MM-DD
  admin_status: VehicleStatus
  activated_until: string // YYYY-MM-DD
  // Double validation (voir 3.8) : champs ajoutés par rapport à l'exemple de db.json
  creation_status: 'EN_ATTENTE_VALIDATION' | 'VALIDE'
  created_by: string
  approved_by: string | null
}

export interface Ownership {
  id: string
  vehicle_id: string
  person_id: string
  start_date: string
  end_date: string | null // null = propriétaire actuel
}

export interface VehicleDocument {
  id: string
  vehicle_id: string
  type: DocumentType
  status: DocumentStatus
  issue_date: string
  valid_until: string
  issuer_org_id: string
  reference: string
}

export interface QrToken {
  id: string
  vehicle_id: string
  public_id: string
  status: QrStatus
  issued_at: string
  revoked_at: string | null
  replaced_by: string | null
}

export interface DriverAuthorization {
  id: string
  vehicle_id: string
  driver_name: string
  driver_ref: string
  valid_from: string
  valid_until: string
  status: 'active' | 'expired'
}

export interface PenaltyCatalogItem {
  code: string
  label: string
  amount_xof: number
  legal_ref: string
}

export interface Penalty {
  id: string
  vehicle_id: string
  catalog_code: string
  amount_xof: number // copié du catalogue, jamais saisi
  agent_id: string
  status: PenaltyStatus
  created_at: string // ISO
  notified_at: string | null // ISO ; null tant que le SMS n'est pas parti
  origin: 'online' | 'offline'
  contest: { reason: string; created_at: string; decision: 'ANNULE' | 'MAINTENU' | null } | null
  payment_id: string | null
}

export interface Payment {
  id: string
  penalty_ids: string[]
  amount_xof: number
  reference: string
  method: string
  paid_at: string
  recipient: string // ex. « Trésor public — démo »
}

export interface Control {
  id: string
  agent_id: string
  vehicle_id: string | null
  scanned_public_id: string
  timestamp: string
  verdict: VerdictCode
  mode: 'online' | 'offline'
}

export interface ChangeRequest {
  id: string
  vehicle_id: string
  requested_by: string
  type: 'vente' | 'correction' | 'adresse'
  payload: Record<string, string>
  status: 'pending' | 'approved' | 'rejected'
}

export interface SmsMessage {
  id: string
  to: string
  body: string
  sent_at: string
}

export interface AuditEntry {
  id: string
  actor_id: string
  action: string
  entity: string
  entity_id: string
  timestamp: string
  prev_hash: string
  hash: string
}

export interface Config {
  activation_months: number
  grace_days: number
  contest_days: number
  registration_fee_xof: number
  snapshot_hours: number
}

export interface Db {
  meta: { version: number; generated_at: string }
  config: Config
  organisations: Organisation[]
  users: User[]
  persons: Person[]
  vehicles: Vehicle[]
  ownerships: Ownership[]
  documents: VehicleDocument[]
  qr_tokens: QrToken[]
  driver_authorizations: DriverAuthorization[]
  penalty_catalog: PenaltyCatalogItem[]
  penalties: Penalty[]
  payments: Payment[]
  controls: Control[]
  change_requests: ChangeRequest[]
  sms_outbox: SmsMessage[]
  audit_log: AuditEntry[]
}