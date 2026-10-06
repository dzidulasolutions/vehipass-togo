import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useId, useRef } from 'react'
import { cameraErrorMessage } from './cameraError'

type QrScannerProps = {
  onScan: (text: string) => void
  onError: (message: string) => void
}

function stopScanner(scanner: Html5Qrcode): void {
  scanner
    .stop()
    .then(() => scanner.clear())
    .catch(() => undefined) // déjà arrêté : rien à faire
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const regionId = `qr-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)

  // Les fonctions reçues changent à chaque rendu : on garde la plus récente sans relancer la caméra.
  useEffect(() => {
    onScanRef.current = onScan
    onErrorRef.current = onError
  })

  useEffect(() => {
    let active = true
    let scanner: Html5Qrcode | null = null

    // Démarrage différé : en développement, React monte, démonte puis remonte le composant.
    // Sans ce délai, deux scanners se disputeraient la même caméra.
    const timer = window.setTimeout(() => {
      const instance = new Html5Qrcode(regionId)
      scanner = instance
      instance
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            if (active) onScanRef.current(text)
          },
          () => undefined,
        )
        .then(() => {
          if (!active) stopScanner(instance)
        })
        .catch((error: unknown) => {
          if (active) onErrorRef.current(cameraErrorMessage(error))
        })
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timer)
      if (scanner) stopScanner(scanner)
    }
  }, [regionId])

  return <div id={regionId} className="overflow-hidden rounded-surface bg-primary" />
}