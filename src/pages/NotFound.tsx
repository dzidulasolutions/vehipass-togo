import { Link } from 'react-router-dom'
import { IconlyArrowRight } from '../components/icons'

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-sm p-md">
      <h1 className="text-h1">Page introuvable</h1>
      <p className="text-muted">Cette adresse n'existe pas dans le prototype.</p>
      <Link to="/" className="inline-flex items-center gap-2xs font-semibold underline">
        Retour à l'accueil <IconlyArrowRight size={18} />
      </Link>
    </main>
  )
}