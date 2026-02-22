import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'

const ACTIVE_STATES = new Set(['setup', 'joining', 'viewing', 'discussion', 'reveal', 'scoreboard'])

export function UpdateBanner() {
  const { gameState, players } = useGameStore()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  const inActiveGame = ACTIVE_STATES.has(gameState) && players.length > 0

  // During an active game: show a subtle dot in the corner so it's not disruptive
  if (inActiveGame) {
    return (
      <div
        className="fixed top-3 right-3 z-50 bg-primary-600 text-white text-xs px-2.5 py-1 rounded-full shadow-lg"
        title="Update beschikbaar na het spel"
      >
        Update beschikbaar
      </div>
    )
  }

  // On home/lobby: show the full banner at the bottom
  return (
    <AnimatePresence>
      <motion.div
        key="update-banner"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-50 bg-slate-800 border border-slate-600 rounded-2xl p-4 shadow-2xl max-w-sm mx-auto"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Nieuwe versie beschikbaar</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Update de app om de laatste verbeteringen te krijgen.
            </p>
          </div>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="mt-3 w-full bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          Nu updaten
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
