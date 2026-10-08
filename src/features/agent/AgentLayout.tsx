import { Outlet } from 'react-router-dom'
import { AgentBottomNav } from './AgentBottomNav'
import { AgentFrame } from './AgentFrame'

export default function AgentLayout() {
  return (
    <AgentFrame>
      <main className="flex-1 px-sm pt-sm pb-md">
        <Outlet />
      </main>
      <AgentBottomNav />
    </AgentFrame>
  )
}