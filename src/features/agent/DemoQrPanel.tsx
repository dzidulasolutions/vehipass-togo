import { useMemo } from 'react'
import { IconlyArrowRight } from '../../components/icons'
import { listDemoQr } from '../../services/demo'

export function DemoQrPanel({ onScan }: { onScan: (token: string) => void }) {
  const items = useMemo(() => listDemoQr(), [])

  return (
    <section className="flex flex-col gap-xs">
      <div className="flex flex-col gap-3xs">
        <h2 className="text-h2">QR de démo</h2>
        <p className="text-small text-muted">Sans caméra, touchez un cas pour simuler un scan.</p>
      </div>
      <ul className="flex flex-col divide-y divide-border rounded-surface bg-surface px-sm">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onScan(item.token)}
              className="flex min-h-12 w-full items-center justify-between gap-sm py-xs text-left"
            >
              <span className="text-body">{item.label}</span>
              <span className="flex shrink-0 items-center gap-2xs text-small text-muted">
                {item.plate && <span className="tabular-nums">{item.plate}</span>}
                <IconlyArrowRight size={16} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}