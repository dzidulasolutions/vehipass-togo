import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, IconScan, IconlyArrowRight, IconlyDocument } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { cx } from '../../lib/cx'
import { AgentFrame } from './AgentFrame'
import { markOnboardingSeen } from './onboarding'

const SLIDES = [
  {
    Icon: IconScan,
    title: 'Scannez le QR du véhicule',
    text: "Un code unique relie le véhicule à son dossier numérique. Aucune donnée personnelle n'y est inscrite.",
  },
  {
    Icon: FiCheckCircle,
    title: 'Un verdict clair en quelques secondes',
    text: "Le statut du véhicule et celui de chaque document sont affichés séparément, avec l'action à suivre.",
  },
  {
    Icon: IconlyDocument,
    title: 'Chaque contrôle est tracé',
    text: "Consultations, PV et paiements sont journalisés. L'argent ne passe jamais par vos mains.",
  },
]

export default function AgentOnboardingPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const Icon = slide.Icon
  const isLast = index === SLIDES.length - 1

  const finish = () => {
    markOnboardingSeen()
    navigate('/agent/connexion', { replace: true })
  }

  return (
    <AgentFrame>
      <div className="grid-wrapper flex flex-1 flex-col text-background">
        <div className="grid-background" aria-hidden="true" />
        <div className="relative z-10 flex flex-1 flex-col p-md">
          <div className="flex items-center justify-between">
            <span className="font-righteous text-h2">VéhiPass</span>
            {!isLast && (
              <Button variant="ghost-inverse" onClick={finish}>
                Passer
              </Button>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-md" aria-live="polite">
            <span className="flex size-16 items-center justify-center rounded-full bg-background text-primary">
              <Icon size={32} />
            </span>
            <h1 className="font-title text-display">{slide.title}</h1>
            <p className="text-body text-background/70">{slide.text}</p>
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex gap-2xs" aria-hidden="true">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={cx(
                    'h-1 rounded-full transition-all duration-200',
                    i === index ? 'w-6 bg-background' : 'w-2 bg-background/30',
                  )}
                />
              ))}
            </div>
            <Button
              variant="inverse"
              fullWidth
              icon={<IconlyArrowRight size={18} />}
              onClick={() => (isLast ? finish() : setIndex(index + 1))}
            >
              {isLast ? 'Commencer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </div>
    </AgentFrame>
  )
}