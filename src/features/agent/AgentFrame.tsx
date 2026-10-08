import type { ReactNode } from 'react'

export function AgentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-1 justify-center bg-surface">
      <div className="relative flex w-full  flex-1 flex-col bg-background md:shadow-elevated">
        {children}
      </div>
    </div>
  )
}