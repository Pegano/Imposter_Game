import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { getHintForDifficulty } from '@imposter-game/shared'
import { socket } from '@/lib/socket'

export function GameReveal() {
  const navigate = useNavigate()
  const { players, currentWord, settings, nextRound, resetGame, isMultiDevice, myPlayerId } = useGameStore()

  const imposter = players.find((p) => p.isImposter)
  const amIHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false
  const imposterHint = currentWord
    ? getHintForDifficulty(currentWord, settings.difficulty)
    : ''

  const handleNextRound = () => {
    if (isMultiDevice) {
      socket.emit('next_round')
    } else {
      nextRound()
    }
  }

  const handleEndGame = () => {
    if (isMultiDevice) {
      socket.emit('end_game')
    } else {
      resetGame()
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col flex-1 p-4 items-center justify-center">
      {/* The Word */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-slate-400 text-sm mb-2">Het woord was</p>
        <div className="bg-primary-500/20 border-2 border-primary-500 rounded-2xl px-8 py-6">
          <p className="text-4xl font-bold text-white">{currentWord?.word || '???'}</p>
        </div>
      </motion.div>

      {/* The Imposter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <p className="text-slate-400 text-sm mb-4">De imposter was</p>

        {imposter && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center text-5xl">
                {getAvatarById(imposter.avatarId)?.emoji || '🎭'}
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-xl">
                🎭
              </div>
            </motion.div>
            <p className="text-xl font-bold text-white mt-4">{imposter.name}</p>
          </div>
        )}
      </motion.div>

      {/* Imposter's Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-8 max-w-xs"
      >
        <p className="text-slate-500 text-sm">
          {imposter?.name}'s hint was:
        </p>
        <p className="text-slate-300 italic mt-1">"{imposterHint}"</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-xs space-y-3"
      >
        {isMultiDevice && !amIHost ? (
          <p className="text-slate-400 text-sm text-center">
            Wachten op host om door te gaan...
          </p>
        ) : (
          <>
            <Button variant="primary" size="lg" fullWidth onClick={handleNextRound}>
              Volgende Ronde
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={handleEndGame}>
              Stoppen
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}
