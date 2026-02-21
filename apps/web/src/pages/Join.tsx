import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlayerCard } from '@/components/game/PlayerCard'
import { AvatarSelector } from '@/components/game/AvatarSelector'
import { useGameStore } from '@/stores/gameStore'
import { AVATAR_PRESETS } from '@/lib/avatars'
import { socket } from '@/lib/socket'

type Step = 'code' | 'profile' | 'waiting'

export function Join() {
  const { code: urlCode } = useParams()

  const [step, setStep] = useState<Step>(urlCode ? 'profile' : 'code')
  const [code, setCode] = useState(urlCode?.toUpperCase() || '')
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].id)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [error, setError] = useState('')

  const { players, setMultiDevice } = useGameStore()

  // Enable multi-device mode whenever someone visits /join
  useEffect(() => {
    setMultiDevice(true)
  }, [setMultiDevice])

  // ── Step 1: validate code ──────────────────────────────────────
  const handleCodeSubmit = () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Voer een game code in')
      return
    }
    setCode(trimmed)
    setError('')
    setStep('profile')
  }

  // ── Step 2: join game ──────────────────────────────────────────
  const handleJoin = () => {
    if (!name.trim()) {
      setError('Voer je naam in')
      return
    }
    setError('')
    socket.emit('join_game', { code, name: name.trim(), avatarId: selectedAvatar })
    setStep('waiting')
  }

  // ── Step 3: waiting — navigation to /game is handled by useGameSocket
  //    when game_state transitions to 'viewing'

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">← Terug</Button>
        </Link>
        <h1 className="text-xl font-semibold text-white ml-4">Deelnemen</h1>
      </div>

      {/* ── Step: Code ── */}
      {step === 'code' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xs mx-auto w-full">
          <p className="text-slate-400 mb-6 text-center text-sm">
            Voer de game code in die de host heeft gedeeld
          </p>

          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="BLAUW-1234"
            className="text-center text-xl font-mono tracking-wider mb-4"
            maxLength={12}
            onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <Button variant="primary" size="lg" fullWidth onClick={handleCodeSubmit}>
            Doorgaan →
          </Button>
        </div>
      )}

      {/* ── Step: Profile ── */}
      {step === 'profile' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xs mx-auto w-full gap-4">
          <div className="bg-slate-800 rounded-xl px-4 py-2 text-center">
            <p className="text-slate-400 text-xs">Game code</p>
            <p className="text-xl font-mono font-bold text-primary-400">{code}</p>
          </div>

          <p className="text-slate-400 text-sm text-center">Kies een avatar en voer je naam in</p>

          <button
            onClick={() => setShowAvatarSelector(true)}
            className="w-20 h-20 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-4xl transition-colors"
            aria-label="Kies avatar"
          >
            {AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.emoji ?? '🎭'}
          </button>

          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Jouw naam..."
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button variant="primary" size="lg" fullWidth onClick={handleJoin} disabled={!name.trim()}>
            Deelnemen →
          </Button>

          <button
            onClick={() => { setStep('code'); setError('') }}
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            ← Andere code invoeren
          </button>
        </div>
      )}

      {/* ── Step: Waiting ── */}
      {step === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-4xl mb-3">⏳</p>
            <h2 className="text-white font-semibold text-lg mb-1">Wachten op de host</h2>
            <p className="text-slate-400 text-sm">Het spel start zodra de host begint</p>
          </div>

          {players.length > 0 && (
            <div className="w-full max-w-sm">
              <p className="text-slate-400 text-xs text-center mb-3">
                {players.length} speler{players.length !== 1 ? 's' : ''} in de lobby
              </p>
              <div className="grid grid-cols-2 gap-3">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
    </div>
  )
}
