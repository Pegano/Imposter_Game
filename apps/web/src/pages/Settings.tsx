import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { GroupManager } from '@/components/game/GroupManager'

export function Settings() {
  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">← Terug</Button>
        </Link>
        <h1 className="text-xl font-semibold text-white ml-4">Instellingen</h1>
      </div>

      <div className="space-y-6">
        {/* Groups Section */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-1">👥 Groepen</h2>
          <p className="text-slate-400 text-sm mb-4">
            Bekijk en beheer opgeslagen spelersgroepen
          </p>
          <GroupManager />
        </div>

        {/* Categories Section */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-1">📁 Categorieën</h2>
          <p className="text-slate-400 text-sm mb-4">
            Beheer woord categorieën en hints
          </p>
          <Link to="/words">
            <Button variant="secondary" fullWidth>
              Categorieën beheren
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
