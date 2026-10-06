import type {
  Db,
  DocumentStatus,
  Ownership,
  Penalty,
  PenaltyStatus,
  QrToken,
  Vehicle,
  VehicleDocument,
  VehicleStatus,
} from '../types/types'

const DAY_MS = 86_400_000
const pad = (n: number, size = 3) => String(n).padStart(size, '0')

// Identifiants publics des QR (opaques, sans lien avec la plaque).
const PUBLIC_IDS = [
  '9f3a1c7e2b', '4be82d10a7', 'c71f5a93e0', '2d6e0b48f1', 'a85c3e7d29', 'e1094bf6c3',
  '7a3d92e5b8', '5c2f8a1d46', 'b60e47c9a2', '13d9f5e08c', 'f48a2c61d7',
]
const NEW_QR_V5 = '8e51c0a7d3'

const COLORS = ['rouge', 'noir', 'bleu', 'vert', 'gris']
const BRAND_LETTERS = ['A', 'B', 'C']

const PENALTY_AMOUNTS = { CASQUE: 5000, DOC_ABSENT: 10000, ASSUR_EXP: 15000 } as const

type VehicleSpec = {
  owner: string
  status?: VehicleStatus
  /** Jours par rapport à aujourd'hui (négatif = dans le passé). */
  registered?: number
  activatedUntil: number
  insuranceUntil?: number
  inspectionUntil?: number
  pending?: boolean
}

// v1 conforme · v2 assurance expirée · v3 contrôle technique expiré · v4 suspendu
// v5 QR révoqué puis remplacé · v6 revendu · v7 période de grâce
// v8 réactivation requise · v9 PV contesté · v10 conducteur autorisé
// v11 en attente de seconde validation
const SPECS: VehicleSpec[] = [
  { owner: 'p1', activatedUntil: 150 },
  { owner: 'p2', activatedUntil: 90, insuranceUntil: -12 },
  { owner: 'p3', activatedUntil: 60, inspectionUntil: -20 },
  { owner: 'p4', status: 'SUSPENDU', activatedUntil: 100 },
  { owner: 'p5', activatedUntil: 80 },
  { owner: 'p6', activatedUntil: 120, registered: -700 },
  { owner: 'p2', activatedUntil: -5 },
  { owner: 'p3', activatedUntil: -40 },
  { owner: 'p4', activatedUntil: 30 },
  { owner: 'p5', activatedUntil: 140 },
  { owner: 'p6', activatedUntil: 180, registered: 0, pending: true },
]

const OWNERS = [
  ['Kossi Démo', 'Lomé (démo)'],
  ['Ama Démo', 'Kara (démo)'],
  ['Yao Démo', 'Sokodé (démo)'],
  ['Afi Démo', 'Atakpamé (démo)'],
  ['Komla Démo', 'Dapaong (démo)'],
  ['Esi Démo', 'Aného (démo)'],
] as const

/** Construit le jeu de données de démo, avec des dates calculées à partir de `today`. */
export function buildSeed(today: Date): Db {
  const d = (days: number) => new Date(today.getTime() + days * DAY_MS).toISOString().slice(0, 10)
  const dt = (days: number, time = '10:15:00') => `${d(days)}T${time}Z`

  const vehicles: Vehicle[] = []
  const documents: VehicleDocument[] = []
  const ownerships: Ownership[] = []
  const qrTokens: QrToken[] = []

  SPECS.forEach((spec, index) => {
    const n = index + 1
    const id = `v${n}`
    const registered = spec.registered ?? -500
    const publicId = n === 5 ? NEW_QR_V5 : PUBLIC_IDS[index]

    vehicles.push({
      id,
      public_id: publicId,
      plate: `TG-DEMO-${pad(n)}`,
      vin: `DEMOVIN${pad(n, 10)}`,
      category: 'moto',
      brand: `Marque ${BRAND_LETTERS[index % BRAND_LETTERS.length]}`,
      model: `Modèle ${n}`,
      color: COLORS[index % COLORS.length],
      registration_date: d(registered),
      admin_status: spec.status ?? 'ACTIF',
      activated_until: d(spec.activatedUntil),
      creation_status: spec.pending ? 'EN_ATTENTE_VALIDATION' : 'VALIDE',
      created_by: 'u_admin1',
      approved_by: spec.pending ? null : 'u_admin2',
    })

    // Le statut stocké reste VALIDE même si la date est dépassée : EXPIRE est calculé par les règles.
    const docStatus: DocumentStatus = spec.pending ? 'EN_ATTENTE' : 'VALIDE'
    const insuranceUntil = spec.insuranceUntil ?? 180
    const inspectionUntil = spec.inspectionUntil ?? 240
    documents.push(
      {
        id: `d${n}_reg`, vehicle_id: id, type: 'registration', status: docStatus,
        issue_date: d(registered), valid_until: d(registered + 1825),
        issuer_org_id: 'org_transport', reference: `CG-DEMO-${pad(n)}`,
      },
      {
        id: `d${n}_ins`, vehicle_id: id, type: 'insurance', status: docStatus,
        issue_date: d(insuranceUntil - 365), valid_until: d(insuranceUntil),
        issuer_org_id: 'org_assur', reference: `AS-DEMO-${pad(n)}`,
      },
      {
        id: `d${n}_ct`, vehicle_id: id, type: 'technical_inspection', status: docStatus,
        issue_date: d(inspectionUntil - 365), valid_until: d(inspectionUntil),
        issuer_org_id: 'org_ct', reference: `CT-DEMO-${pad(n)}`,
      },
    )

    if (n === 6) {
      // Véhicule revendu : même véhicule, même QR, deux propriétaires dans l'historique.
      ownerships.push(
        { id: 'o6a', vehicle_id: id, person_id: 'p1', start_date: d(registered), end_date: d(-200) },
        { id: 'o6b', vehicle_id: id, person_id: spec.owner, start_date: d(-200), end_date: null },
      )
    } else {
      ownerships.push({
        id: `o${n}`, vehicle_id: id, person_id: spec.owner, start_date: d(registered), end_date: null,
      })
    }

    // Le QR n'est généré qu'après la seconde validation.
    if (spec.pending) return

    if (n === 5) {
      qrTokens.push(
        {
          id: 'q5a', vehicle_id: id, public_id: PUBLIC_IDS[index], status: 'REVOQUE',
          issued_at: d(registered), revoked_at: d(-90), replaced_by: 'q5b',
        },
        {
          id: 'q5b', vehicle_id: id, public_id: NEW_QR_V5, status: 'ACTIF',
          issued_at: d(-90), revoked_at: null, replaced_by: null,
        },
      )
    } else {
      qrTokens.push({
        id: `q${n}`, vehicle_id: id, public_id: publicId, status: 'ACTIF',
        issued_at: d(registered), revoked_at: null, replaced_by: null,
      })
    }
  })

  const penalty = (
    id: string,
    vehicleId: string,
    code: keyof typeof PENALTY_AMOUNTS,
    status: PenaltyStatus,
    days: number,
    extra: Partial<Penalty> = {},
  ): Penalty => ({
    id,
    vehicle_id: vehicleId,
    catalog_code: code,
    amount_xof: PENALTY_AMOUNTS[code],
    agent_id: 'u_agent1',
    status,
    created_at: dt(days),
    notified_at: ['NOTIFIE', 'CONTESTE', 'PAYE'].includes(status) ? dt(days, '10:20:00') : null,
    origin: 'online',
    contest: null,
    payment_id: null,
    ...extra,
  })

  return {
    meta: { version: 1, generated_at: d(0) },
        config: { activation_months: 6, grace_days: 15, contest_days: 30, registration_fee_xof: 1000, snapshot_hours: 24 },
    organisations: [
      { id: 'org_transport', name: 'Service transport (démo)', type: 'transport_admin' },
      { id: 'org_assur', name: 'Assureur (démo)', type: 'insurer' },
      { id: 'org_ct', name: 'Centre contrôle technique (démo)', type: 'inspection_center' },
      { id: 'org_police', name: 'Forces de contrôle (démo)', type: 'police' },
    ],
    users: [
      { id: 'u_agent1', org_id: 'org_police', role: 'control_agent', name: 'Agent Démo 1', badge: 'AG-001', status: 'active' },
      { id: 'u_agent2', org_id: 'org_police', role: 'control_agent', name: 'Agent Démo 2', badge: 'AG-002', status: 'active' },
      { id: 'u_admin1', org_id: 'org_transport', role: 'admin_agent', name: 'Agent Admin 1', badge: 'AD-001', status: 'active' },
      { id: 'u_admin2', org_id: 'org_transport', role: 'admin_agent', name: 'Agent Admin 2', badge: 'AD-002', status: 'active' },
      { id: 'u_inst1', org_id: 'org_transport', role: 'institution_admin', name: 'Admin Institutionnel', badge: 'IN-001', status: 'active' },
    ],
    persons: OWNERS.map(([fullName, address], i) => ({
      id: `p${i + 1}`,
      full_name: fullName,
      id_ref: `ID-DEMO-${pad(i + 1, 4)}`,
      phone: `+228 90 00 00 0${i + 1}`,
      address,
    })),
    vehicles,
    ownerships,
    documents,
    qr_tokens: qrTokens,
    driver_authorizations: [
      {
        id: 'da1', vehicle_id: 'v10', driver_name: 'Yawa Démo', driver_ref: 'ID-DEMO-0007',
        valid_from: d(-30), valid_until: d(150), status: 'active',
      },
    ],
    penalty_catalog: [
      { code: 'CASQUE', label: 'Défaut de port du casque', amount_xof: PENALTY_AMOUNTS.CASQUE, legal_ref: 'Texte fictif A' },
      { code: 'DOC_ABSENT', label: 'Documents non présentés', amount_xof: PENALTY_AMOUNTS.DOC_ABSENT, legal_ref: 'Texte fictif B' },
      { code: 'ASSUR_EXP', label: 'Assurance expirée', amount_xof: PENALTY_AMOUNTS.ASSUR_EXP, legal_ref: 'Texte fictif C' },
    ],
    penalties: [
      penalty('pv1', 'v8', 'CASQUE', 'NOTIFIE', -60),
      penalty('pv2', 'v8', 'DOC_ABSENT', 'NOTIFIE', -10),
      penalty('pv3', 'v9', 'ASSUR_EXP', 'CONTESTE', -20, {
        contest: {
          reason: "Assurance renouvelée la veille du contrôle (justificatif joint, démo).",
          created_at: dt(-15),
          decision: null,
        },
      }),
      penalty('pv4', 'v2', 'CASQUE', 'PAYE', -30, { payment_id: 'pay1' }),
      penalty('pv5', 'v3', 'DOC_ABSENT', 'BROUILLON', -1, { agent_id: 'u_agent2', origin: 'offline' }),
    ],
    payments: [
      {
        id: 'pay1', penalty_ids: ['pv4'], amount_xof: PENALTY_AMOUNTS.CASQUE,
        reference: 'QT-DEMO-0001', method: 'Mobile money (démo)', paid_at: dt(-28),
        recipient: 'Trésor public — démo',
      },
    ],
    controls: [],
    change_requests: [
      {
        id: 'cr1', vehicle_id: 'v3', requested_by: 'p3', type: 'correction',
        payload: { field: 'color', requested_value: 'bleu' }, status: 'pending',
      },
    ],
    sms_outbox: [],
    audit_log: [],
  }
}