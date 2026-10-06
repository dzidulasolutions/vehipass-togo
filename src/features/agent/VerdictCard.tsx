import type { ComponentType, ReactNode } from 'react'
import { FiCheckCircle, FiXCircle, IconAlert, IconInfo } from '../../components/icons'
import { Skeleton, SkeletonList, SkeletonRegion, SkeletonText } from '../../components/ui/Skeleton'
import { cx } from '../../lib/cx'
import { formatDate, formatDateTime, formatDaysLeft, plural } from '../../lib/format'
import {
  ACTIVATION_LABEL,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
  VEHICLE_STATUS_LABEL,
} from '../../lib/labels'
import type { ActivationInfo } from '../../rules/activation'
import type { VerifyResult } from '../../types/api'
import type { DocumentStatus, VerdictColor } from '../../types/types'

// La couleur ne porte jamais seule le sens : chaque verdict a aussi une icône et un texte.
const TONES: Record<VerdictColor, { panel: string; Icon: ComponentType<{ size?: number }> }> = {
  vert: { panel: 'border-success/30 bg-success-bg text-success', Icon: FiCheckCircle },
  orange: { panel: 'border-warning/30 bg-warning-bg text-warning', Icon: IconAlert },
  rouge: { panel: 'border-error/30 bg-error-bg text-error', Icon: FiXCircle },
  gris: { panel: 'border-border bg-surface text-foreground', Icon: IconInfo },
}

const DOCUMENT_CHIP: Record<DocumentStatus, string> = {
  VALIDE: 'bg-success-bg text-success',
  EXPIRE: 'bg-warning-bg text-warning',
  EN_ATTENTE: 'bg-warning-bg text-warning',
  NON_TROUVE: 'bg-warning-bg text-warning',
  SUSPENDU: 'bg-error-bg text-error',
  REVOQUE: 'bg-error-bg text-error',
}

function activationHint(activation: ActivationInfo): string | null {
  if (activation.status === 'GRACE' && activation.graceDaysLeft !== null) {
    const left = activation.graceDaysLeft
    return `${left} ${plural(left, 'jour')} de grâce ${plural(left, 'restant')}`
  }
  if (activation.status === 'REACTIVATION_REQUISE') {
    return `Échéance dépassée de ${activation.daysSinceExpiry} ${plural(activation.daysSinceExpiry, 'jour')}`
  }
  return null
}

function Row({ label, value, hint }: { label: string; value: ReactNode; hint?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-sm py-xs">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="text-right text-body font-semibold">
        {value}
        {hint && <span className="block text-small font-normal text-muted">{hint}</span>}
      </dd>
    </div>
  )
}

export function VerdictCard({ result }: { result: VerifyResult }) {
  const { verdict, vehicle } = result
  const tone = TONES[verdict.color]
  const Icon = tone.Icon

  return (
    <article aria-labelledby="verdict-title" className="flex flex-col gap-md">
      <div className={cx('flex flex-col gap-xs rounded-surface border p-md', tone.panel)}>
        <div className="flex items-center gap-xs">
          <Icon size={28} />
          <h2 id="verdict-title" className="font-title text-h1">
            {verdict.label}
          </h2>
        </div>
        <p className="text-body text-foreground">{verdict.suggestedAction}</p>
      </div>

      {vehicle && (
        <section className="flex flex-col gap-3xs">
          <p className="text-caption text-muted">Véhicule</p>
          <p className="font-title text-h1 tabular-nums">{vehicle.plate}</p>
          <p className="text-small text-muted">
            {vehicle.brand} · {vehicle.model} · {vehicle.color}
          </p>
        </section>
      )}

      {verdict.vehicleStatus && verdict.activation && vehicle && (
        <section className="flex flex-col gap-3xs">
          <h3 className="text-h2">Dossier</h3>
          <dl className="flex flex-col divide-y divide-border">
            <Row label="Statut du véhicule" value={VEHICLE_STATUS_LABEL[verdict.vehicleStatus]} />
            <Row
              label="Activation"
              value={ACTIVATION_LABEL[verdict.activation.status]}
              hint={activationHint(verdict.activation)}
            />
            <Row
              label="PV impayés"
              value={verdict.unpaidPenaltyCount === 0 ? 'Aucun' : verdict.unpaidPenaltyCount}
            />
            <Row label="Conducteur déclaré" value={vehicle.hasDeclaredDriver ? 'Oui' : 'Non'} />
          </dl>
        </section>
      )}

      {verdict.documents.length > 0 && (
        <section className="flex flex-col gap-3xs">
          <h3 className="text-h2">Documents</h3>
          <ul className="flex flex-col divide-y divide-border">
            {verdict.documents.map((doc) => (
              <li key={doc.type} className="flex items-center justify-between gap-sm py-xs">
                <div className="flex flex-col">
                  <span className="text-body font-semibold">{DOCUMENT_TYPE_LABEL[doc.type]}</span>
                  <span className="text-small text-muted">
                    {doc.validUntil
                      ? `${formatDate(doc.validUntil)}${doc.daysLeft !== null ? ` · ${formatDaysLeft(doc.daysLeft)}` : ''}`
                      : 'Aucun document enregistré'}
                  </span>
                </div>
                <span
                  className={cx(
                    'shrink-0 rounded-control px-2xs py-3xs text-caption font-semibold',
                    DOCUMENT_CHIP[doc.status],
                  )}
                >
                  {DOCUMENT_STATUS_LABEL[doc.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-caption text-muted">
        Vérifié le {formatDateTime(result.checkedAt)}
        {result.controlId ? ' · Contrôle enregistré' : ''}
      </p>
    </article>
  )
}

/** Même mise en page que la carte, pour que rien ne saute à l'arrivée du résultat. */
export function VerdictSkeleton() {
  return (
    <SkeletonRegion label="Vérification en cours" className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs rounded-surface border border-border p-md" aria-hidden="true">
        <div className="flex items-center gap-xs">
          <Skeleton shape="full" className="size-7" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <SkeletonText lines={2} />
      </div>
      <div className="flex flex-col gap-3xs" aria-hidden="true">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <SkeletonList count={3} />
    </SkeletonRegion>
  )
}