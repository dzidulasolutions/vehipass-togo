import type { ReactNode } from 'react'

export function AgentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-surface">
      <div className="relative flex w-full max-w-md flex-1 flex-col bg-background md:shadow-elevated">
        {children}
      </div>
    </div>
  )
}