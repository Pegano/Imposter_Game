import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { socket } from '@/lib/socket'

const RANK_MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

export function GameScoreboard() {
  const navigate = useNavigate()
  const { players, nextRound, resetGame, isMultiDevice, myPlayerId } = useGameStore()

  const [showWinner, setShowWinner] = useState(false)

  const amIHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false

  const sorted = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = sorted[0]
  const maxScore = winner?.score ?? 0

  const handleNextRound = () => {
    if (isMultiDevice) {
      socket.emit('next_round')
    } else {
      nextRound()
    }
  }

  const handleStop = () => {
    setShowWinner(true)
  }

  const handleGoHome = () => {
    if (isMultiDevice) {
      socket.emit('end_game')
    } else {
      resetGame()
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="text-center mb-6 shrink-0">
        <h1 className="text-xl font-semibold text-white">Scorebord</h1>
      </div>

      {/* Score list */}
      <div className="flex-1 overflow-auto space-y-3 min-h-0">
        {sorted.map((player, i) => {
          const score = player.score ?? 0
          const barWidth = maxScore > 0 ? Math.max(8, (score / maxScore) * 100) : 8

          return (
            <motion.div
              key={player.id}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl
                ${i === 0 ? 'bg-yellow-500/10 border border-yellow-500/40' : 'bg-slate-800'}`}
            >
              {/* Rank */}
              <span className="text-xl w-8 text-center shrink-0">
                {RANK_MEDAL[i] ?? `${i + 1}`}
              </span>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl shrink-0">
                {getAvatarById(player.avatarId)?.emoji ?? '🎭'}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm truncate">{player.name}</p>
                  <p className={`text-sm font-bold shrink-0 ml-2
                    ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {score > 0 ? '+' : ''}{score}
                  </p>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-primary-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sorted.length * 0.08 + 0.2 }}
        className="shrink-0 pt-4 space-y-3"
      >
        {isMultiDevice && !amIHost ? (
          <p className="text-slate-400 text-sm text-center">
            Wachten op host...
          </p>
        ) : (
          <>
            <Button variant="primary" size="lg" fullWidth onClick={handleNextRound}>
              Volgende Ronde
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={handleStop}>
              Stoppen
            </Button>
          </>
        )}
      </motion.div>

      {/* Winner overlay */}
      <AnimatePresence>
        {showWinner && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-8xl mb-6"
            >
              🏆
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <p className="text-slate-400 text-sm mb-3">Winnaar!</p>
              <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-yellow-400 flex items-center justify-center text-5xl mx-auto mb-4">
                {getAvatarById(winner.avatarId)?.emoji ?? '🎭'}
              </div>
              <p className="text-3xl font-bold text-white">{winner.name}</p>
              <p className="text-yellow-400 text-xl font-semibold mt-1">
                {winner.score ?? 0} punt{(winner.score ?? 0) !== 1 ? 'en' : ''}
              </p>

              {/* All scores compact */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-xs">
                {sorted.slice(1).map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-full text-xs">
                    <span>{getAvatarById(p.avatarId)?.emoji ?? '🎭'}</span>
                    <span className="text-slate-300">{p.name}</span>
                    <span className="text-slate-500">{p.score ?? 0}p</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button variant="primary" size="lg" onClick={handleGoHome}>
                Klaar →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
