import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { getHintForDifficulty } from '@imposter-game/shared'
import type { GameOutcome } from '@imposter-game/shared'
import { socket } from '@/lib/socket'

export function GameReveal() {
  const { players, currentWord, settings, applyOutcome, isMultiDevice, myPlayerId } = useGameStore()

  const imposter = players.find((p) => p.isImposter)
  const amIHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false
  const imposterHint = currentWord
    ? getHintForDifficulty(currentWord, settings.difficulty)
    : ''

  const handleOutcome = (outcome: GameOutcome) => {
    if (isMultiDevice) {
      socket.emit('set_outcome', outcome)
    } else {
      applyOutcome(outcome)
    }
  }

  const outcomes: { outcome: GameOutcome; emoji: string; label: string; sub: string; color: string }[] = [
    {
      outcome: 'imposter_lost',
      emoji: '🏆',
      label: 'Imposter verloren',
      sub: 'Anderen +1 punt',
      color: 'bg-green-500/20 border-green-500 hover:bg-green-500/30',
    },
    {
      outcome: 'imposter_guessed',
      emoji: '🔍',
      label: 'Imposter raadde het woord',
      sub: 'Imposter +5 punten',
      color: 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30',
    },
    {
      outcome: 'imposter_won',
      emoji: '😈',
      label: 'Imposter niet gevonden',
      sub: 'Anderen -2 punten',
      color: 'bg-red-500/20 border-red-500 hover:bg-red-500/30',
    },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-full p-4 gap-6">
      {/* The Word */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-slate-400 text-sm mb-2">Het woord was</p>
        <div className="bg-primary-500/20 border-2 border-primary-500 rounded-2xl px-8 py-4">
          <p className="text-4xl font-bold text-white">{currentWord?.word || '???'}</p>
        </div>
      </motion.div>

      {/* The Imposter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-slate-400 text-sm mb-3">De imposter was</p>

        {imposter && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center text-4xl">
                {getAvatarById(imposter.avatarId)?.emoji || '🎭'}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-lg">
                🎭
              </div>
            </motion.div>
            <p className="text-lg font-bold text-white mt-3">{imposter.name}</p>
            <p className="text-slate-400 text-xs mt-1">hint: "{imposterHint}"</p>
          </div>
        )}
      </motion.div>

      {/* Outcome selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs"
      >
        {isMultiDevice && !amIHost ? (
          <p className="text-slate-400 text-sm text-center">
            Wachten op host om de uitkomst te bepalen...
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-400 text-xs text-center mb-3">Wat was de uitkomst?</p>
            {outcomes.map(({ outcome, emoji, label, sub, color }) => (
              <button
                key={outcome}
                onClick={() => handleOutcome(outcome)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${color}`}
              >
                <span className="text-2xl shrink-0">{emoji}</span>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-slate-400 text-xs">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </div>
  )
}
