import type {
  DocumentType,
  Organisation,
  Role,
  VerdictCode,
} from "../types/types";

export type AccessRole = Role | "public";

/** Qui a le droit de faire quoi. Chaque rôle n'a que ce que sa mission exige. */
export const PERMISSIONS = {
  // Contrôle
  "verify.full": ["control_agent", "admin_agent"],
  "vehicle.search": ["control_agent", "admin_agent"],
  "control.create": ["control_agent"],
  "control.list_own": ["control_agent"],
  // Pénalités
  "penalty.create": ["control_agent"],
  "penalty.validate": ["control_agent", "admin_agent"],
  "penalty.pay": ["owner"],
  "penalty.contest": ["owner"],
  "penalty.resolve_contest": ["admin_agent"],
  // Propriétaire
  "vehicle.view_own": ["owner"],
  "driver.declare": ["owner"],
  "request.create": ["owner"],
  // Administration
  "request.review": ["admin_agent"],
  "vehicle.create": ["admin_agent"],
  "vehicle.approve": ["admin_agent"],
  "ownership.transfer": ["admin_agent"],
  "vehicle.suspend": ["admin_agent"],
  "vehicle.unsuspend": ["admin_agent"],
  "qr.revoke": ["admin_agent"],
  "qr.issue": ["admin_agent"],
  "dossier.reactivate": ["admin_agent"],
  "document.update": ["admin_agent", "issuer"],
  // Institution : supervise, ne modifie aucune donnée métier
  "users.manage": ["institution_admin"],
  "audit.view": ["institution_admin"],
  "dashboard.view": ["institution_admin"],
} as const satisfies Record<string, readonly AccessRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: AccessRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly AccessRole[]).includes(role);
}

/** Documents qu'un organisme émetteur a le droit de mettre à jour. */
const ISSUER_DOCUMENTS: Record<Organisation["type"], readonly DocumentType[]> =
  {
    transport_admin: ["registration"],
    insurer: ["insurance"],
    inspection_center: ["technical_inspection"],
    police: [],
  };

export function issuerCanUpdate(
  orgType: Organisation["type"],
  docType: DocumentType,
): boolean {
  return ISSUER_DOCUMENTS[orgType].includes(docType);
}

/** Double validation : le validateur doit être une autre personne que le créateur. */
export function canApprove(createdBy: string, approverId: string): boolean {
  return createdBy !== approverId;
}

export type ScanLevel = "minimal" | "owner" | "agent" | "admin";

/** Niveau de détail obtenu en scannant un QR. */
export function scanLevel(role: AccessRole, ownsVehicle: boolean): ScanLevel {
  switch (role) {
    case "control_agent":
      return "agent";
    case "admin_agent":
      return "admin";
    case "owner":
      return ownsVehicle ? "owner" : "minimal";
    default:
      return "minimal"; // public, organisme émetteur, administrateur institutionnel
  }
}

/** Ce que voit un anonyme : jamais de motif, ni de détail sur le dossier. */
export function publicStatusLabel(code: VerdictCode): string {
  switch (code) {
    case "VERIFICATION_IMPOSSIBLE":
      return "Vérification impossible";
    case "CODE_REVOQUE":
      return "Code révoqué";
    case "CONFORME":
      return "Véhicule enregistré — statut : valide";
    default:
      return "Véhicule enregistré — statut : à vérifier";
  }
}
