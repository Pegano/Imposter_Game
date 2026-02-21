import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useGameStore } from '@/stores/gameStore'
import { categoriesApi, wordsApi, type ApiCategory } from '@/lib/api'
import { socket } from '@/lib/socket'
import type { Difficulty } from '@imposter-game/shared'

export function GameSetup() {
  const navigate = useNavigate()
  const { settings, updateSettings, assignRoles, players, isMultiDevice, myPlayerId } = useGameStore()

  const myPlayer = players.find((p) => p.id === myPlayerId)
  const amIHost = myPlayer?.isHost ?? false

  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    settings.categoryId ?? null
  )
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isMultiDevice && players.length < 3) navigate('/lobby')
  }, [players.length, navigate, isMultiDevice])

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .finally(() => setLoadingCats(false))
  }, [])

  const handleStartRound = async () => {
    setError('')
    setStarting(true)
    try {
      const word = await wordsApi.getRandom(selectedCategoryId ?? undefined)
      assignRoles({
        id: word.id,
        categoryId: word.categoryId,
        word: word.word,
        hintEasy: word.hintEasy,
        hintMedium: word.hintMedium,
        hintHard: word.hintHard,
        createdAt: new Date(word.createdAt),
        updatedAt: new Date(word.updatedAt),
      })
    } catch (e: any) {
      setError(e.message ?? 'Kon geen woord ophalen')
      setStarting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')}>
          ← Terug
        </Button>
        <h1 className="text-xl font-semibold text-white ml-4">Instellingen</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-auto">
        {/* Category Selection */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">Categorie</label>

          {loadingCats ? (
            <p className="text-slate-500 text-sm">Laden...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* "Alle" option */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  updateSettings({ categoryId: undefined })
                }}
                className={`p-3 rounded-xl text-left transition-all flex items-center gap-2
                  ${selectedCategoryId === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
              >
                <span className="text-xl">🎲</span>
                <span className="text-sm font-medium">Alle categorieën</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id)
                    updateSettings({ categoryId: cat.id })
                  }}
                  className={`p-3 rounded-xl text-left transition-all flex items-center gap-2
                    ${selectedCategoryId === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                  <span className="text-xl">{cat.icon ?? '📁'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className={`text-xs ${selectedCategoryId === cat.id ? 'text-primary-100' : 'text-slate-500'}`}>
                      {cat.wordCount} woorden
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">Moeilijkheid</label>
          <div className="flex gap-2">
            {([1, 2, 3] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => updateSettings({ difficulty: level })}
                className={`flex-1 py-4 rounded-xl transition-all flex flex-col items-center
                  ${settings.difficulty === level
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
              >
                <span className="text-2xl mb-1">
                  {level === 1 ? '😊' : level === 2 ? '😐' : '😈'}
                </span>
                <span className="text-sm">
                  {level === 1 ? 'Makkelijk' : level === 2 ? 'Gemiddeld' : 'Moeilijk'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Toggle */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">Timer</label>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white">Timer inschakelen</span>
              <button
                onClick={() => updateSettings({ timerEnabled: !settings.timerEnabled })}
                className={`w-14 h-8 rounded-full transition-colors
                  ${settings.timerEnabled ? 'bg-primary-500' : 'bg-slate-600'}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-transform
                    ${settings.timerEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {settings.timerEnabled && (
              <div>
                <input
                  type="range"
                  min={60}
                  max={300}
                  step={30}
                  value={settings.timerSeconds}
                  onChange={(e) => updateSettings({ timerSeconds: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-white mt-2">
                  {Math.floor(settings.timerSeconds / 60)}:{String(settings.timerSeconds % 60).padStart(2, '0')} minuten
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-3">{error}</p>
      )}

      {/* Start Button */}
      {isMultiDevice && !amIHost ? (
        <p className="text-slate-400 text-sm text-center pb-2">
          Wachten op host om nieuwe ronde te starten...
        </p>
      ) : isMultiDevice && amIHost ? (
        <Button variant="primary" size="lg" fullWidth onClick={() => socket.emit('start_round')}>
          Start Ronde →
        </Button>
      ) : (
        <Button variant="primary" size="lg" fullWidth onClick={handleStartRound} disabled={starting}>
          {starting ? 'Woord ophalen...' : 'Start Ronde →'}
        </Button>
      )}
    </div>
  )
}
