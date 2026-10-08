/** Cas de démonstration, un par véhicule du jeu de données (voir seed.ts). */
export const DEMO_SCENARIOS: ReadonlyArray<{ vehicleId: string; label: string }> = [
  { vehicleId: 'v1', label: 'Tout conforme' },
  { vehicleId: 'v2', label: 'Assurance expirée' },
  { vehicleId: 'v3', label: 'Contrôle technique expiré' },
  { vehicleId: 'v4', label: 'Véhicule suspendu' },
  { vehicleId: 'v5', label: 'QR remplacé (nouveau code valide)' },
  { vehicleId: 'v6', label: 'Véhicule revendu (même QR)' },
  { vehicleId: 'v7', label: 'Période de grâce' },
  { vehicleId: 'v8', label: 'Réactivation requise, 2 PV impayés' },
  { vehicleId: 'v9', label: 'PV contesté en cours' },
  { vehicleId: 'v10', label: 'Conducteur autorisé déclaré' },
]