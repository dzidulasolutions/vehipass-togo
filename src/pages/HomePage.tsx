import { Link } from 'react-router-dom'
import { IconlyArrowRight } from '../components/icons'

const SOON = ['Propriétaire', 'Administration', 'Institution']

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-lg p-md">
      <header className="flex flex-col gap-3xs">
        <p className="font-righteous text-display">VéhiPass</p>
        <p className="text-muted">Module de vérification numérique des véhicules — prototype.</p>
      </header>

      <nav aria-label="Espaces">
        <ul className="flex flex-col divide-y divide-border">
          <li>
            <Link to="/agent" className="flex min-h-11 items-center justify-between py-sm font-semibold">
              Agent de contrôle <IconlyArrowRight size={20} />
            </Link>
          </li>
          {SOON.map((label) => (
            <li key={label} className="flex min-h-11 items-center justify-between py-sm text-muted">
              <span>{label}</span>
              <span className="text-small">Bientôt</span>
            </li>
          ))}
          <li>
            <Link to="/fondations" className="flex min-h-11 items-center py-sm text-small text-muted underline">
              Page de test (développement)
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}