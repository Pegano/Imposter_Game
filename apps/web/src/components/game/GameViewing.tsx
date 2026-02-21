import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { PlayerCard } from './PlayerCard'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { getHintForDifficulty, allPlayersViewed } from '@imposter-game/shared'

export function GameViewing() {
  const { players, currentWord, settings, markPlayerViewed, setGameState } = useGameStore()
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null)

  const viewingPlayer = viewingPlayerId ? players.find((p) => p.id === viewingPlayerId) : null
  const allViewed = allPlayersViewed(players)
  const viewedCount = players.filter((p) => p.hasViewed).length

  // Get content to show (word or hint based on role)
  const getPlayerContent = () => {
    if (!viewingPlayer || !currentWord) return ''
    if (viewingPlayer.isImposter) {
      return getHintForDifficulty(currentWord, settings.difficulty)
    }
    return currentWord.word
  }

  const handleCardTap = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (player && !player.hasViewed) {
      setViewingPlayerId(playerId)
    }
  }

  const handleCloseCard = () => {
    if (viewingPlayerId) {
      markPlayerViewed(viewingPlayerId)
      setViewingPlayerId(null)
    }
  }

  const handleStartDiscussion = () => {
    setGameState('discussion')
  }

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">Bekijk je kaart</h1>
        <p className="text-slate-400 mt-1">
          Geef de telefoon aan de speler wiens kaart nog dicht is
        </p>
      </div>

      {/* Players Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              showViewedState
              onTap={!player.hasViewed ? () => handleCardTap(player.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="text-center py-4">
        <p className={`text-sm ${allViewed ? 'text-green-400' : 'text-slate-400'}`}>
          {viewedCount} van {players.length} spelers hebben gekeken
        </p>
      </div>

      {/* Start Discussion Button */}
      {allViewed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="primary" size="lg" fullWidth onClick={handleStartDiscussion}>
            Start Discussie →
          </Button>
        </motion.div>
      )}

      {/* Card Flip Overlay */}
      <AnimatePresence>
        {viewingPlayerId && viewingPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6"
            onClick={handleCloseCard}
          >
            {/* Player info */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-4xl mx-auto mb-3">
                {getAvatarById(viewingPlayer.avatarId)?.emoji || '🎭'}
              </div>
              <p className="text-white font-semibold">{viewingPlayer.name}</p>
              <p className="text-slate-400 text-sm">
                {viewingPlayer.isImposter ? 'Je bent de Imposter!' : 'Jouw woord is:'}
              </p>
            </div>

            {/* The word/hint card */}
            <motion.div
              initial={{ scale: 0.8, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className={`
                w-full max-w-xs aspect-[3/4]
                rounded-2xl
                flex items-center justify-center
                text-center p-6
                ${viewingPlayer.isImposter ? 'bg-red-500/20 border-2 border-red-500' : 'bg-primary-500/20 border-2 border-primary-500'}
              `}
            >
              <div>
                {viewingPlayer.isImposter && (
                  <p className="text-red-400 text-sm mb-4">🎭 Je bent de Imposter</p>
                )}
                <p className="text-3xl font-bold text-white">{getPlayerContent()}</p>
                {viewingPlayer.isImposter && (
                  <p className="text-slate-400 text-sm mt-4">(Dit is je hint)</p>
                )}
              </div>
            </motion.div>

            {/* Close instruction */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 text-sm mt-8"
            >
              Tik ergens om terug te gaan
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
