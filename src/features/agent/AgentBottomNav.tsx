import { NavLink } from 'react-router-dom'
import { IconScan, IconlyActivity, IconlyHome, IconlyUser } from '../../components/icons'
import { cx } from '../../lib/cx'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex min-h-14 flex-col items-center justify-center gap-3xs rounded-control text-caption font-semibold transition-colors',
    isActive ? 'text-primary' : 'text-muted hover:text-foreground',
  )

export function AgentBottomNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="sticky bottom-0 z-20 grid grid-cols-4 items-end border-t border-border bg-background px-2xs pt-2xs pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <NavLink to="/agent" end className={linkClass}>
        <IconlyHome size={22} />
        Accueil
      </NavLink>
      <NavLink to="/agent/scan" className={linkClass}>
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-background">
          <IconScan size={22} />
        </span>
        Scanner
      </NavLink>
      <NavLink to="/agent/historique" className={linkClass}>
        <IconlyActivity size={22} />
        Historique
      </NavLink>
      <NavLink to="/agent/profil" className={linkClass}>
        <IconlyUser size={22} />
        Profil
      </NavLink>
    </nav>
  )
}