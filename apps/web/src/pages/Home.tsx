import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      {/* Logo / Title */}
      <div className="mb-12">
        <div className="text-6xl mb-4">🎭</div>
        <h1 className="text-4xl font-bold text-white mb-2">IMPOSTER</h1>
        <p className="text-slate-400 text-lg">Het party spel voor families</p>
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-xs space-y-4">
        <Link to="/lobby" className="block">
          <Button variant="primary" size="lg" fullWidth>
            Nieuw Spel
          </Button>
        </Link>

        <Link to="/join" className="block">
          <Button variant="secondary" size="lg" fullWidth>
            Deelnemen
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-3 mt-12 justify-center">
        <Link to="/stats">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">📊</span>
            Statistieken
          </Button>
        </Link>

        <Link to="/settings">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">⚙️</span>
            Instellingen
          </Button>
        </Link>

        <Link to="/words">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">📚</span>
            Woorden
          </Button>
        </Link>
      </div>

      {/* Version */}
      <p className="text-slate-600 text-sm mt-auto pt-8">v1.0.0</p>
    </div>
  )
}
