import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { PlayerCard } from './PlayerCard'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { getHintForDifficulty, allPlayersViewed } from '@imposter-game/shared'
import { socket } from '@/lib/socket'
import { wordsApi } from '@/lib/api'

function AvatarDisplay({ avatarId, className }: { avatarId: string; className?: string }) {
  const avatar = getAvatarById(avatarId)
  if (avatar?.imageNotViewed.endsWith('.png')) {
    return <img src={avatar.imageNotViewed} alt={avatar.name} className={className ?? 'w-12 h-12 object-contain'} />
  }
  return <span className="text-4xl">{avatar?.emoji ?? '🎭'}</span>
}

export function GameViewing() {
  const { players, currentWord, settings, markPlayerViewed, setGameState, myPlayerId, myRole, isMultiDevice, assignRoles } =
    useGameStore()

  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null)
  const [myCardOpen, setMyCardOpen] = useState(false)

  const handleSkipWord = async () => {
    try {
      const word = await wordsApi.getRandom(settings.categoryId ?? undefined)
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
    } catch {
      // ignore
    }
  }

  const viewingPlayer = viewingPlayerId ? players.find((p) => p.id === viewingPlayerId) : null
  const allViewed = allPlayersViewed(players)
  const viewedCount = players.filter((p) => p.hasViewed).length

  const myPlayer = players.find((p) => p.id === myPlayerId)
  const amIHost = myPlayer?.isHost ?? false
  const iHaveViewed = myPlayer?.hasViewed ?? false

  // ── Single-device helpers ─────────────────────────────────────
  const getPlayerContent = () => {
    if (!viewingPlayer || !currentWord) return ''
    if (viewingPlayer.isImposter) return getHintForDifficulty(currentWord, settings.difficulty)
    return currentWord.word
  }

  const handleCardTap = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (player && !player.hasViewed) setViewingPlayerId(playerId)
  }

  const handleCloseSingleDevice = () => {
    if (viewingPlayerId) {
      markPlayerViewed(viewingPlayerId)
      setViewingPlayerId(null)
    }
  }

  // ════════════════════════════════════════════════════════════
  // MULTI-DEVICE MODE
  // ════════════════════════════════════════════════════════════
  if (isMultiDevice) {
    return (
      <div className="flex flex-col flex-1 p-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-white">Bekijk je kaart</h1>
          <p className="text-slate-400 mt-1 text-sm">Tik op je kaart om je rol te zien</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* My card */}
          {myPlayer && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { if (!iHaveViewed) setMyCardOpen(true) }}
              disabled={iHaveViewed}
              className={`
                w-48 aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-3
                border-2 transition-all
                ${iHaveViewed
                  ? 'bg-slate-800 border-slate-600 opacity-60 cursor-default'
                  : 'bg-primary-500/20 border-primary-500 cursor-pointer hover:bg-primary-500/30'}
              `}
            >
              <div className="flex items-center justify-center w-14 h-14">
                <AvatarDisplay avatarId={myPlayer.avatarId} className="w-14 h-14 object-contain" />
              </div>
              <p className="text-white font-semibold">{myPlayer.name}</p>
              {iHaveViewed
                ? <p className="text-slate-400 text-xs">✓ Bekeken</p>
                : <p className="text-primary-300 text-xs">Tik om te bekijken</p>
              }
            </motion.button>
          )}

          {/* Progress */}
          <p className={`text-sm ${allViewed ? 'text-green-400' : 'text-slate-400'}`}>
            {viewedCount} / {players.length} spelers hebben gekeken
          </p>

          {/* Other players' status */}
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {players.filter((p) => p.id !== myPlayerId).map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
                  ${player.hasViewed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
              >
                <span>{getAvatarById(player.avatarId)?.emoji ?? '🎭'}</span>
                <span>{player.name}</span>
                {player.hasViewed && <span>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {amIHost && (
          <button
            onClick={() => socket.emit('skip_word')}
            className="text-slate-400 text-sm underline underline-offset-2 text-center py-2 hover:text-slate-300"
          >
            Woord overslaan
          </button>
        )}

        {allViewed && amIHost && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="primary" size="lg" fullWidth onClick={() => socket.emit('start_discussion')}>
              Start Discussie →
            </Button>
          </motion.div>
        )}
        {allViewed && !amIHost && (
          <p className="text-slate-400 text-sm text-center pb-2">
            Wachten op host om discussie te starten...
          </p>
        )}

        {/* My card overlay */}
        <AnimatePresence>
          {myCardOpen && myPlayer && myRole && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6"
              onClick={() => { setMyCardOpen(false); socket.emit('mark_viewed') }}
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  <AvatarDisplay avatarId={myPlayer.avatarId} className="w-16 h-16 object-contain" />
                </div>
                <p className="text-white font-semibold">{myPlayer.name}</p>
                <p className="text-slate-400 text-sm">
                  {myRole.isImposter ? 'Je bent de Imposter!' : 'Jouw woord is:'}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0.8, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className={`
                  w-full max-w-xs aspect-[3/4] rounded-2xl flex items-center justify-center text-center p-6
                  ${myRole.isImposter ? 'bg-red-500/20 border-2 border-red-500' : 'bg-primary-500/20 border-2 border-primary-500'}
                `}
              >
                <div>
                  {myRole.isImposter && <p className="text-red-400 text-sm mb-4">🎭 Je bent de Imposter</p>}
                  <p className="text-3xl font-bold text-white">{myRole.content}</p>
                  {myRole.isImposter && <p className="text-slate-400 text-sm mt-4">(Dit is je hint)</p>}
                </div>
              </motion.div>
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

  // ════════════════════════════════════════════════════════════
  // SINGLE-DEVICE MODE (unchanged)
  // ════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col flex-1 p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">Bekijk je kaart</h1>
        <p className="text-slate-400 mt-1">
          Geef de telefoon aan de speler wiens kaart nog dicht is
        </p>
      </div>

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

      <div className="text-center py-4">
        <p className={`text-sm ${allViewed ? 'text-green-400' : 'text-slate-400'}`}>
          {viewedCount} van {players.length} spelers hebben gekeken
        </p>
      </div>

      <button
        onClick={handleSkipWord}
        className="text-slate-400 text-sm underline underline-offset-2 text-center py-2 hover:text-slate-300 w-full"
      >
        Woord overslaan
      </button>

      {allViewed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => setGameState('discussion')}>
            Start Discussie →
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {viewingPlayerId && viewingPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6"
            onClick={handleCloseSingleDevice}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                <AvatarDisplay avatarId={viewingPlayer.avatarId} className="w-16 h-16 object-contain" />
              </div>
              <p className="text-white font-semibold">{viewingPlayer.name}</p>
              <p className="text-slate-400 text-sm">
                {viewingPlayer.isImposter ? 'Je bent de Imposter!' : 'Jouw woord is:'}
              </p>
            </div>
            <motion.div
              initial={{ scale: 0.8, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className={`
                w-full max-w-xs aspect-[3/4] rounded-2xl flex items-center justify-center text-center p-6
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
