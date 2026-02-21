import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlayerCard } from '@/components/game/PlayerCard'
import { AvatarSelector } from '@/components/game/AvatarSelector'
import { SaveGroupModal } from '@/components/game/SaveGroupModal'
import { LoadGroupModal } from '@/components/game/LoadGroupModal'
import { useGameStore } from '@/stores/gameStore'
import { AVATAR_PRESETS } from '@/lib/avatars'
import { categoriesApi, wordsApi, type ApiCategory, type ApiGroup } from '@/lib/api'
import { socket } from '@/lib/socket'
import type { Difficulty } from '@imposter-game/shared'

const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Makkelijk', 2: 'Gemiddeld', 3: 'Moeilijk' }
const DIFFICULTY_EMOJI: Record<Difficulty, string> = { 1: '😊', 2: '😐', 3: '😈' }

export function Lobby() {
  const navigate = useNavigate()

  // Player UI state
  const [playerName, setPlayerName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].id)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showSaveGroup, setShowSaveGroup] = useState(false)
  const [showLoadGroup, setShowLoadGroup] = useState(false)
  const [savedGroupName, setSavedGroupName] = useState<string | null>(null)

  // Settings UI state
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const {
    session,
    players,
    addPlayer,
    removePlayer,
    settings,
    updateSettings,
    assignRoles,
    isMultiDevice,
    setMultiDevice,
    myPlayerId,
  } = useGameStore()

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {})
  }, [])

  const selectedCat = categories.find((c) => c.id === settings.categoryId) ?? null
  const canStart = players.length >= 3
  const amIHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false

  // ── Multi-device: create game ──────────────────────────────────
  const handleCreateGame = () => {
    if (!playerName.trim()) return
    socket.emit('create_game', { playerName: playerName.trim(), avatarId: selectedAvatar })
  }

  // ── Multi-device: start round ──────────────────────────────────
  const handleStartRound = () => {
    socket.emit('start_round')
  }

  // ── Multi-device: settings change ────────────────────────────
  const handleUpdateSettings = (partial: Parameters<typeof updateSettings>[0]) => {
    updateSettings(partial)
    if (isMultiDevice) {
      socket.emit('update_settings', { ...settings, ...partial })
    }
  }

  // ── Single-device: add player ──────────────────────────────────
  const handleAddPlayer = () => {
    if (!playerName.trim()) return
    addPlayer({
      id: crypto.randomUUID(),
      name: playerName.trim(),
      avatarId: selectedAvatar,
      isImposter: false,
      hasViewed: false,
      isHost: players.length === 0,
      isConnected: true,
      joinedAt: new Date(),
    })
    setPlayerName('')
    const idx = AVATAR_PRESETS.findIndex((a) => a.id === selectedAvatar)
    setSelectedAvatar(AVATAR_PRESETS[(idx + 1) % AVATAR_PRESETS.length].id)
    setSavedGroupName(null)
  }

  const handleLoadGroup = (group: ApiGroup) => {
    players.forEach((p) => removePlayer(p.id))
    group.players.forEach((p, i) =>
      addPlayer({
        id: crypto.randomUUID(),
        name: p.name,
        avatarId: p.avatarId,
        isImposter: false,
        hasViewed: false,
        isHost: i === 0,
        isConnected: true,
        joinedAt: new Date(),
      })
    )
    setSavedGroupName(group.name)
  }

  // ── Single-device: start round ─────────────────────────────────
  const handleStart = async () => {
    setStartError('')
    setStarting(true)
    try {
      const word = await wordsApi.getRandom(settings.categoryId)
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
      navigate('/game')
    } catch (e: unknown) {
      setStartError(e instanceof Error ? e.message : 'Kon geen woord ophalen')
      setStarting(false)
    }
  }

  // ── Settings panel (shared between modes) ─────────────────────
  const settingsPanel = (
    <>
      <div className="flex gap-2 mb-2 shrink-0">
        {/* Categorie */}
        <button
          onClick={() => { setCategoryOpen((o) => !o); setDifficultyOpen(false) }}
          className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
            ${categoryOpen ? 'bg-primary-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span>{selectedCat?.icon ?? '🎲'}</span>
            <span className="truncate font-medium">{selectedCat?.name ?? 'Alle'}</span>
          </div>
          <span className="text-xs ml-1 shrink-0">{categoryOpen ? '▲' : '▼'}</span>
        </button>

        {/* Moeilijkheid */}
        <button
          onClick={() => { setDifficultyOpen((o) => !o); setCategoryOpen(false) }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all shrink-0
            ${difficultyOpen ? 'bg-primary-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <span>{DIFFICULTY_EMOJI[settings.difficulty]}</span>
          <span className="font-medium">{DIFFICULTY_LABEL[settings.difficulty]}</span>
          <span className="text-xs">{difficultyOpen ? '▲' : '▼'}</span>
        </button>

        {/* Timer toggle */}
        <div className="bg-slate-800 rounded-xl px-3 flex items-center gap-2 shrink-0">
          <span className="text-base">⏱️</span>
          <button
            onClick={() => handleUpdateSettings({ timerEnabled: !settings.timerEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors
              ${settings.timerEnabled ? 'bg-primary-500' : 'bg-slate-600'}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                ${settings.timerEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {categoryOpen && (
        <div className="bg-slate-800 rounded-xl mb-2 overflow-hidden shrink-0">
          <button
            onClick={() => { handleUpdateSettings({ categoryId: undefined }); setCategoryOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all
              ${!settings.categoryId ? 'bg-primary-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <span className="text-lg w-6 text-center">🎲</span>
            <span className="font-medium">Alle categorieën</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { handleUpdateSettings({ categoryId: cat.id }); setCategoryOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all border-t border-slate-700/50
                ${settings.categoryId === cat.id ? 'bg-primary-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              <span className="text-lg w-6 text-center">{cat.icon ?? '📁'}</span>
              <span className="font-medium flex-1 text-left">{cat.name}</span>
              <span className={`text-xs ${settings.categoryId === cat.id ? 'text-primary-100' : 'text-slate-500'}`}>
                {cat.wordCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {difficultyOpen && (
        <div className="bg-slate-800 rounded-xl mb-2 p-3 flex gap-2 shrink-0">
          {([1, 2, 3] as Difficulty[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { handleUpdateSettings({ difficulty: lvl }); setDifficultyOpen(false) }}
              className={`flex-1 py-3 rounded-xl text-xs text-center transition-all
                ${settings.difficulty === lvl
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              <div className="text-2xl mb-1">{DIFFICULTY_EMOJI[lvl]}</div>
              {DIFFICULTY_LABEL[lvl]}
            </button>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="flex flex-col flex-1 p-4 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center mb-4 shrink-0">
        <Link to="/">
          <Button variant="ghost" size="sm">← Terug</Button>
        </Link>
        <h1 className="text-xl font-semibold text-white ml-4">Nieuw Spel</h1>
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex bg-slate-800 rounded-xl p-1 mb-4 shrink-0">
        <button
          onClick={() => setMultiDevice(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
            ${!isMultiDevice ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          📱 1 Telefoon
        </button>
        <button
          onClick={() => setMultiDevice(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
            ${isMultiDevice ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          📡 Eigen Telefoon
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MULTI-DEVICE MODE
      ════════════════════════════════════════════════════════════ */}
      {isMultiDevice && (
        <>
          {/* Before game is created: host name + avatar + create button */}
          {!session && (
            <div className="flex flex-col gap-4">
              <p className="text-slate-400 text-sm text-center">
                Voer jouw naam in en maak een spel aan. Anderen kunnen via de game code meedoen.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="w-11 h-11 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl shrink-0 transition-colors"
                  aria-label="Kies avatar"
                >
                  {AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.emoji ?? '🎭'}
                </button>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Jouw naam..."
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGame()}
                  className="flex-1"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCreateGame}
                disabled={!playerName.trim()}
              >
                Maak Spel →
              </Button>
            </div>
          )}

          {/* After game is created: show code, players, settings, start button */}
          {session && (
            <>
              {/* Game code */}
              <div className="bg-slate-800 rounded-xl p-4 mb-4 text-center shrink-0">
                <p className="text-slate-400 text-xs mb-1">Game code — deel met vrienden</p>
                <p className="text-3xl font-mono font-bold text-primary-400 tracking-widest">
                  {session.code}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Via: {window.location.origin}/join
                </p>
              </div>

              {/* Settings */}
              {settingsPanel}

              {/* Players */}
              <div className="flex-1 overflow-auto min-h-0 mb-3">
                {players.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6">
                    <p className="text-3xl mb-2">⏳</p>
                    <p className="text-sm">Wachten op spelers...</p>
                  </div>
                )}
              </div>

              {/* Start button (host only) */}
              {amIHost && (
                <div className="shrink-0 pt-1">
                  <p className={`text-center text-sm mb-2 ${canStart ? 'text-green-400' : 'text-slate-400'}`}>
                    {canStart ? '✓ ' : ''}
                    {players.length} speler{players.length !== 1 ? 's' : ''}
                    {!canStart && ' (minimaal 3 nodig)'}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleStartRound}
                    disabled={!canStart}
                  >
                    Start Spel →
                  </Button>
                </div>
              )}
              {!amIHost && (
                <p className="text-slate-400 text-sm text-center shrink-0 pb-2">
                  Wachten op host om te starten...
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          SINGLE-DEVICE MODE (unchanged)
      ════════════════════════════════════════════════════════════ */}
      {!isMultiDevice && (
        <>
          {settingsPanel}

          <div className="mb-2 shrink-0" />

          {/* Group actions */}
          <div className="flex gap-2 mb-3 shrink-0">
            <Button variant="secondary" size="sm" fullWidth onClick={() => setShowLoadGroup(true)}>
              📂 Groep laden
            </Button>
            {players.length > 0 && (
              <Button variant="secondary" size="sm" fullWidth onClick={() => setShowSaveGroup(true)}>
                💾 Opslaan
              </Button>
            )}
          </div>

          {savedGroupName && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 mb-3 shrink-0">
              <span className="text-green-400 text-sm">
                ✓ Groep: <strong>{savedGroupName}</strong>
              </span>
            </div>
          )}

          {/* Add Player Form */}
          <div className="flex gap-2 mb-3 shrink-0">
            <button
              onClick={() => setShowAvatarSelector(true)}
              className="w-11 h-11 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl shrink-0 transition-colors"
              aria-label="Kies avatar"
            >
              {AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.emoji ?? '🎭'}
            </button>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Naam speler..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              className="flex-1"
            />
            <Button onClick={handleAddPlayer} disabled={!playerName.trim()}>+</Button>
          </div>

          {/* Players List */}
          <div className="flex-1 overflow-auto min-h-0">
            {players.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onRemove={() => {
                      removePlayer(player.id)
                      setSavedGroupName(null)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p className="text-4xl mb-3">👥</p>
                <p>Voeg minimaal 3 spelers toe</p>
                <p className="text-sm mt-1">of laad een opgeslagen groep</p>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="shrink-0 pt-3">
            <p className={`text-center text-sm mb-2 ${canStart ? 'text-green-400' : 'text-slate-400'}`}>
              {canStart ? '✓ ' : ''}
              {players.length} speler{players.length !== 1 ? 's' : ''}
              {!canStart && ' (minimaal 3 nodig)'}
            </p>
            {startError && (
              <p className="text-red-400 text-sm text-center mb-2">{startError}</p>
            )}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStart}
              disabled={!canStart || starting}
            >
              {starting ? 'Laden...' : 'Start Ronde →'}
            </Button>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {showAvatarSelector && (
        <AvatarSelector
          selected={selectedAvatar}
          onSelect={(id) => {
            setSelectedAvatar(id)
            setShowAvatarSelector(false)
          }}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
      <SaveGroupModal
        isOpen={showSaveGroup}
        players={players}
        onClose={() => setShowSaveGroup(false)}
        onSaved={(name) => {
          setSavedGroupName(name)
          setShowSaveGroup(false)
        }}
      />
      <LoadGroupModal
        isOpen={showLoadGroup}
        onClose={() => setShowLoadGroup(false)}
        onLoad={handleLoadGroup}
      />
    </div>
  )
}
