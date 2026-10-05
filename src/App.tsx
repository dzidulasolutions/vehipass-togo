import { Route, Routes } from 'react-router-dom'
import NotFound from './pages/NotFound'
import PrototypeBanner from './components/PrototypeBanner'
import Showcase from './pages/Showcase'

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PrototypeBanner />
      <Routes>
        <Route path="/" element={<Showcase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}