import {
  FiCheckCircle,
  FiXCircle,
  IconlyActivity,
  IconlyAddUser,
  IconlyChart,
  IconlyDocument,
  IconlyHome,
  IconlyLoader,
  IconlySearch,
  IconlyUser,
  IconlyWallet,
} from '../components/icons'
import { SkeletonCard, SkeletonList, SkeletonProfile, SkeletonRegion } from '../components/ui/Skeleton'

const ICONS = [
  IconlyHome, IconlySearch, IconlyUser, IconlyAddUser, IconlyDocument, IconlyWallet,
  IconlyActivity, IconlyChart, FiCheckCircle, FiXCircle, IconlyLoader,
]

export default function Showcase() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-lg p-md">
      <header className="flex flex-col gap-3xs">
        <p className="font-righteous text-display">VéhiPass</p>
        <p className="text-muted">Fondations : styles, polices, icônes et squelettes.</p>
      </header>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Typographie</h2>
        <p className="text-h1">Titre h1 (24 px)</p>
        <p className="text-body">Texte courant (15 px), lisible en plein soleil.</p>
        <p className="text-small text-muted">Texte secondaire (13 px)</p>
        <p className="text-caption text-muted">Métadonnée (11 px)</p>
        <p className="text-numeric tabular-nums">5 000 F — 10 000 F — 15 000 F</p>
      </section>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Couleurs</h2>
        <div className="flex flex-wrap gap-xs text-small">
          <span className="rounded-control bg-primary px-xs py-2xs text-background">Primaire</span>
          <span className="rounded-control border border-border bg-surface px-xs py-2xs">Surface</span>
          <span className="rounded-control bg-success-bg px-xs py-2xs text-success">Succès</span>
          <span className="rounded-control bg-warning-bg px-xs py-2xs text-warning">Alerte</span>
          <span className="rounded-control bg-error-bg px-xs py-2xs text-error">Erreur</span>
        </div>
      </section>

      <section className="flex flex-col gap-xs">
        <h2 className="text-h2">Icônes</h2>
        <div className="flex flex-wrap gap-sm text-foreground">
          {ICONS.map((Icon, i) => (
            <Icon key={i} size={24} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="text-h2">Chargement</h2>
        <SkeletonRegion className="flex flex-col gap-md">
          <SkeletonProfile />
          <SkeletonCard />
          <SkeletonList count={3} />
        </SkeletonRegion>
      </section>
    </main>
  )
}