import { describe, expect, it } from 'vitest'
import type { VerdictCode } from '../types/types'
import {
  PERMISSIONS,
  can,
  canApprove,
  issuerCanUpdate,
  publicStatusLabel,
  scanLevel,
  type AccessRole,
  type Permission,
} from './access'

const ROLES: AccessRole[] = ['public', 'owner', 'control_agent', 'admin_agent', 'institution_admin', 'issuer']
const PERMISSION_LIST = Object.keys(PERMISSIONS) as Permission[]
const allowed = (role: AccessRole) => PERMISSION_LIST.filter((p) => can(role, p))
const rolesFor = (permission: Permission) => ROLES.filter((r) => can(r, permission))

const OFFICIAL_DATA_CHANGES: Permission[] = [
  'vehicle.create',
  'vehicle.approve',
  'ownership.transfer',
  'vehicle.suspend',
  'vehicle.unsuspend',
  'qr.revoke',
  'qr.issue',
  'dossier.reactivate',
  'document.update',
  'penalty.resolve_contest',
  'request.review',
]

describe('permissions', () => {
  it('le public n’a aucun droit nominatif', () => {
    expect(allowed('public')).toEqual([])
  })

  it('un agent de contrôle ne modifie jamais le dossier', () => {
    for (const p of OFFICIAL_DATA_CHANGES) expect(can('control_agent', p)).toBe(false)
  })

  it('un propriétaire ne modifie aucune donnée officielle', () => {
    for (const p of OFFICIAL_DATA_CHANGES) expect(can('owner', p)).toBe(false)
  })

  it('l’administrateur institutionnel ne modifie aucune donnée métier', () => {
    expect([...allowed('institution_admin')].sort()).toEqual(['audit.view', 'dashboard.view', 'users.manage'])
  })

  it('un organisme émetteur ne peut que mettre à jour des documents', () => {
    expect(allowed('issuer')).toEqual(['document.update'])
  })

  it('seul le propriétaire paie ou conteste un PV', () => {
    expect(rolesFor('penalty.pay')).toEqual(['owner'])
    expect(rolesFor('penalty.contest')).toEqual(['owner'])
  })

  it('seul l’agent de contrôle crée un PV, et l’agent administratif tranche les contestations', () => {
    expect(rolesFor('penalty.create')).toEqual(['control_agent'])
    expect(rolesFor('penalty.resolve_contest')).toEqual(['admin_agent'])
  })

  it('chaque permission est accordée à au moins un rôle', () => {
    for (const p of PERMISSION_LIST) expect(rolesFor(p).length).toBeGreaterThan(0)
  })
})

describe('issuerCanUpdate', () => {
  it('limite chaque organisme à son type de document', () => {
    expect(issuerCanUpdate('insurer', 'insurance')).toBe(true)
    expect(issuerCanUpdate('insurer', 'technical_inspection')).toBe(false)
    expect(issuerCanUpdate('insurer', 'registration')).toBe(false)
    expect(issuerCanUpdate('inspection_center', 'technical_inspection')).toBe(true)
    expect(issuerCanUpdate('transport_admin', 'registration')).toBe(true)
    expect(issuerCanUpdate('police', 'registration')).toBe(false)
  })
})

describe('canApprove (double validation)', () => {
  it('refuse qu’un agent valide sa propre création', () => {
    expect(canApprove('u_admin1', 'u_admin1')).toBe(false)
  })

  it('accepte la validation par un autre agent', () => {
    expect(canApprove('u_admin1', 'u_admin2')).toBe(true)
  })
})

describe('scanLevel', () => {
  it('donne un niveau selon le rôle', () => {
    expect(scanLevel('public', false)).toBe('minimal')
    expect(scanLevel('control_agent', false)).toBe('agent')
    expect(scanLevel('admin_agent', false)).toBe('admin')
    expect(scanLevel('institution_admin', false)).toBe('minimal')
    expect(scanLevel('issuer', false)).toBe('minimal')
  })

  it('ne donne son dossier au propriétaire que pour son propre véhicule', () => {
    expect(scanLevel('owner', true)).toBe('owner')
    expect(scanLevel('owner', false)).toBe('minimal')
  })
})

describe('publicStatusLabel', () => {
  const ALL_CODES: Record<VerdictCode, true> = {
    VERIFICATION_IMPOSSIBLE: true,
    CODE_REVOQUE: true,
    VEHICULE_SUSPENDU: true,
    A_VERIFIER: true,
    REACTIVATION_REQUISE: true,
    DOCUMENT_A_REGULARISER: true,
    CONFORME: true,
  }

  it.each(Object.keys(ALL_CODES) as VerdictCode[])('%s : le public ne voit aucun motif', (code) => {
    expect(publicStatusLabel(code)).not.toMatch(/suspend|expir|assurance|document|activation|signal/i)
  })

  it('affiche valide, à vérifier, code révoqué ou vérification impossible', () => {
    expect(publicStatusLabel('CONFORME')).toBe('Véhicule enregistré — statut : valide')
    expect(publicStatusLabel('VEHICULE_SUSPENDU')).toBe('Véhicule enregistré — statut : à vérifier')
    expect(publicStatusLabel('DOCUMENT_A_REGULARISER')).toBe('Véhicule enregistré — statut : à vérifier')
    expect(publicStatusLabel('CODE_REVOQUE')).toBe('Code révoqué')
    expect(publicStatusLabel('VERIFICATION_IMPOSSIBLE')).toBe('Vérification impossible')
  })
})