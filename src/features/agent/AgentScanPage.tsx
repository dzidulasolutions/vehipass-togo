import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconScan } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { env } from '../../config/env'
import { api } from '../../services/api'
import { ApiError } from '../../services/errors'
import { clearSession } from '../../services/session'
import type { VerifyResult } from '../../types/api'
import { DemoQrPanel } from './DemoQrPanel'
import { QrScanner } from './QrScanner'
import { VerdictCard, VerdictSkeleton } from './VerdictCard'

type ScanState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'result'; result: VerifyResult }
  | { phase: 'error'; error: unknown; token: string }

export default function AgentScanPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<ScanState>({ phase: 'idle' })
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const busy = useRef(false) // la caméra peut lire le même QR plusieurs fois de suite

  const verify = useCallback(
    async (token: string) => {
      if (busy.current) return
      busy.current = true
      setCameraOn(false)
      setState({ phase: 'loading' })
      try {
        const result = await api.verifyQr(token)
        setState({ phase: 'result', result })
      } catch (error) {
        if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
          clearSession()
          navigate('/agent/connexion', { replace: true })
          return
        }
        setState({ phase: 'error', error, token })
      } finally {
        busy.current = false
      }
    },
    [navigate],
  )

  const reset = () => setState({ phase: 'idle' })

  return (
    <div className="flex flex-col gap-md">
      {state.phase === 'idle' && (
        <>
          <header className="flex flex-col gap-3xs">
            <h1 className="font-title text-h1">Scanner un QR</h1>
            <p className="text-small text-muted">
              Papiers absents ? Scannez le QR du véhicule pour vérifier son dossier.
            </p>
          </header>

          <section className="flex flex-col gap-xs" aria-label="Caméra">
            {cameraOn ? (
              <>
                <div className="overflow-hidden rounded-surface bg-primary">
                  <QrScanner
                    onScan={verify}
                    onError={(message) => {
                      setCameraOn(false)
                      setCameraError(message)
                    }}
                  />
                </div>
                <Button variant="secondary" onClick={() => setCameraOn(false)}>
                  Arrêter la caméra
                </Button>
              </>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-sm rounded-surface bg-primary p-md text-center text-background">
                <IconScan size={48} />
                <p className="max-w-56 text-small text-background/70">
                  Placez le QR du véhicule dans le cadre pour lancer la vérification.
                </p>
                <Button
                  variant="inverse"
                  onClick={() => {
                    setCameraError(null)
                    setCameraOn(true)
                  }}
                >
                  Activer la caméra
                </Button>
              </div>
            )}
            {cameraError && (
              <p role="alert" className="rounded-control bg-error-bg p-xs text-small text-error">
                {cameraError}
              </p>
            )}
          </section>

          {env.VITE_API_MODE === 'mock' && <DemoQrPanel onScan={verify} />}
        </>
      )}

      {state.phase === 'loading' && <VerdictSkeleton />}

      {state.phase === 'error' && (
        <>
          <ErrorState
            title="Impossible de joindre le service"
            error={state.error}
            onRetry={() => verify(state.token)}
          />
          <Button variant="secondary" onClick={reset}>
            Nouveau scan
          </Button>
        </>
      )}

      {state.phase === 'result' && (
        <>
          <div aria-live="polite">
            <VerdictCard result={state.result} />
          </div>
          <Button fullWidth icon={<IconScan size={20} />} onClick={reset}>
            Nouveau scan
          </Button>
        </>
      )}
    </div>
  )
}