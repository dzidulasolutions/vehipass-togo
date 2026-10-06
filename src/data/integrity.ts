import type { Db } from "../types/types";

/** Vérifie les règles que le schéma Zod ne voit pas (références entre tables, doubles validations...). */
export function checkIntegrity(db: Db): string[] {
  const problems: string[] = [];

  const vehicleIds = new Set(db.vehicles.map((v) => v.id));
  const personIds = new Set(db.persons.map((p) => p.id));
  const orgIds = new Set(db.organisations.map((o) => o.id));
  const userIds = new Set(db.users.map((u) => u.id));
  const qrIds = new Set(db.qr_tokens.map((q) => q.id));
  const paymentIds = new Set(db.payments.map((p) => p.id));
  const penaltyIds = new Set(db.penalties.map((p) => p.id));
  const catalog = new Map(db.penalty_catalog.map((c) => [c.code, c]));

  const unique = (label: string, values: string[]) => {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) problems.push(`${label} en double : ${value}`);
      seen.add(value);
    }
  };
  const mustExist = (label: string, value: string, known: Set<string>) => {
    if (!known.has(value)) problems.push(`${label} inconnu : ${value}`);
  };

  unique(
    "id véhicule",
    db.vehicles.map((v) => v.id),
  );
  unique(
    "plaque",
    db.vehicles.map((v) => v.plate),
  );
  unique(
    "identifiant public véhicule",
    db.vehicles.map((v) => v.public_id),
  );
  unique(
    "identifiant public QR",
    db.qr_tokens.map((q) => q.public_id),
  );
  unique(
    "id personne",
    db.persons.map((p) => p.id),
  );

  for (const user of db.users)
    mustExist(`organisation de ${user.id}`, user.org_id, orgIds);

  for (const o of db.ownerships) {
    mustExist(`véhicule de ${o.id}`, o.vehicle_id, vehicleIds);
    mustExist(`propriétaire de ${o.id}`, o.person_id, personIds);
    if (o.end_date !== null && o.end_date < o.start_date)
      problems.push(`${o.id} : fin avant le début`);
  }
  for (const doc of db.documents) {
    mustExist(`véhicule de ${doc.id}`, doc.vehicle_id, vehicleIds);
    mustExist(`organisme de ${doc.id}`, doc.issuer_org_id, orgIds);
  }
  for (const q of db.qr_tokens) {
    mustExist(`véhicule de ${q.id}`, q.vehicle_id, vehicleIds);
    if (q.replaced_by !== null)
      mustExist(`remplaçant de ${q.id}`, q.replaced_by, qrIds);
  }
  for (const da of db.driver_authorizations)
    mustExist(`véhicule de ${da.id}`, da.vehicle_id, vehicleIds);
  for (const cr of db.change_requests)
    mustExist(`véhicule de ${cr.id}`, cr.vehicle_id, vehicleIds);
  for (const c of db.controls) {
    mustExist(`agent de ${c.id}`, c.agent_id, userIds);
    if (c.vehicle_id !== null)
      mustExist(`véhicule de ${c.id}`, c.vehicle_id, vehicleIds);
  }

  for (const p of db.penalties) {
    mustExist(`véhicule de ${p.id}`, p.vehicle_id, vehicleIds);
    mustExist(`agent de ${p.id}`, p.agent_id, userIds);
    const item = catalog.get(p.catalog_code);
    if (!item)
      problems.push(`${p.id} : code de barème inconnu ${p.catalog_code}`);
    else if (item.amount_xof !== p.amount_xof)
      problems.push(`${p.id} : montant différent du barème`);
    if (p.payment_id !== null)
      mustExist(`paiement de ${p.id}`, p.payment_id, paymentIds);
    if (p.status === "PAYE" && p.payment_id === null)
      problems.push(`${p.id} : payé sans paiement`);
    if (
      p.status === "CONTESTE" &&
      (p.contest === null || p.contest.decision !== null)
    ) {
      problems.push(`${p.id} : contesté sans contestation en cours`);
    }
    if (
      (p.status === "NOTIFIE" || p.status === "CONTESTE") &&
      p.notified_at === null
    ) {
      problems.push(`${p.id} : notifié sans date de notification`);
    }
    if (p.status === "BROUILLON" && p.notified_at !== null) {
      problems.push(`${p.id} : brouillon déjà notifié`);
    }
  }

  for (const pay of db.payments) {
    let total = 0;
    for (const pid of pay.penalty_ids) {
      mustExist(`PV de ${pay.id}`, pid, penaltyIds);
      total += db.penalties.find((p) => p.id === pid)?.amount_xof ?? 0;
    }
    if (total !== pay.amount_xof)
      problems.push(`${pay.id} : montant différent de la somme des PV`);
  }

  for (const v of db.vehicles) {
    mustExist(`créateur de ${v.id}`, v.created_by, userIds);
    if (v.approved_by !== null) {
      mustExist(`validateur de ${v.id}`, v.approved_by, userIds);
      if (v.approved_by === v.created_by)
        problems.push(`${v.id} : validé par son propre créateur`);
    }
    const activeQr = db.qr_tokens.filter(
      (q) => q.vehicle_id === v.id && q.status === "ACTIF",
    );
    if (v.creation_status === "VALIDE") {
      if (v.approved_by === null)
        problems.push(`${v.id} : validé sans validateur`);
      const current = db.ownerships.filter(
        (o) => o.vehicle_id === v.id && o.end_date === null,
      );
      if (current.length !== 1)
        problems.push(
          `${v.id} : ${current.length} propriétaires actuels (1 attendu)`,
        );
      if (activeQr.length !== 1)
        problems.push(`${v.id} : ${activeQr.length} QR actifs (1 attendu)`);
      else if (activeQr[0].public_id !== v.public_id)
        problems.push(`${v.id} : QR actif différent de son identifiant public`);
    } else if (activeQr.length > 0) {
      problems.push(`${v.id} : QR actif avant la seconde validation`);
    }
  }

  return problems;
}
