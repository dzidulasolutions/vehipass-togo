import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { IconlyHide, IconlyShow } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { env } from '../../config/env'
import { useSession } from '../../hooks/useSession'
import { api } from '../../services/api'
import { DEMO_HINT } from '../../services/demo'
import { ApiError, toUserMessage } from '../../services/errors'

export default function AgentLoginPage() {
  const navigate = useNavigate()
  const session = useSession()

  const [step, setStep] = useState<'credentials' | 'code'>('credentials')
  const [badge, setBadge] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session?.role === 'control_agent') return <Navigate to="/agent" replace />

  async function submitCredentials(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const challenge = await api.login({ kind: 'agent', badge: badge.trim(), password })
      setChallengeId(challenge.challengeId)
      setStep('code')
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === 'UNAUTHORIZED'
          ? 'Matricule ou mot de passe incorrect.'
          : toUserMessage(e),
      )
    } finally {
      setPending(false)
    }
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault()
    if (!challengeId) return
    setPending(true)
    setError(null)
    try {
      const opened = await api.verifyOtp(challengeId, code.trim())
      if (opened.role !== 'control_agent') {
        await api.logout()
        setError("Ce compte n'a pas accès à l'espace agent de contrôle.")
        setStep('credentials')
        setCode('')
        return
      }
      navigate('/agent', { replace: true })
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === 'UNAUTHORIZED'
          ? 'Code incorrect. Vérifiez et réessayez.'
          : toUserMessage(e),
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-lg p-md">
      <header className="flex flex-col gap-3xs">
        <p className="font-righteous text-h2">VéhiPass</p>
        <h1 className="text-display">Espace agent</h1>
        <p className="text-muted">
          {step === 'credentials'
            ? 'Connectez-vous avec votre matricule.'
            : 'Saisissez le code temporaire à 6 chiffres.'}
        </p>
      </header>

      {step === 'credentials' ? (
        <form onSubmit={submitCredentials} className="flex flex-col gap-sm">
          <TextField
            label="Matricule"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            autoComplete="username"
            autoCapitalize="characters"
            required
          />
          <TextField
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            trailing={
              <Button
                variant="ghost"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword((v) => !v)}
                icon={showPassword ? <IconlyHide size={20} /> : <IconlyShow size={20} />}
              />
            }
          />
          {error && (
            <p role="alert" className="text-small text-error">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth loading={pending}>
            Continuer
          </Button>
        </form>
      ) : (
        <form onSubmit={submitCode} className="flex flex-col gap-sm">
          <TextField
            label="Code temporaire"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            required
          />
          {error && (
            <p role="alert" className="text-small text-error">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth loading={pending} disabled={code.length !== 6}>
            Se connecter
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStep('credentials')
              setCode('')
              setError(null)
            }}
          >
            Retour
          </Button>
        </form>
      )}

      {env.VITE_API_MODE === 'mock' && (
        <aside className="rounded-surface bg-surface p-sm text-small text-muted">
          <p className="font-semibold text-foreground">Compte de démo</p>
          <p>
            Matricule {DEMO_HINT.badge} · mot de passe {DEMO_HINT.password} · code {DEMO_HINT.otp}
          </p>
        </aside>
      )}
    </main>
  )
}