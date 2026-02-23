import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import { socket } from '@/lib/socket'
import { GameSetup } from '@/components/game/GameSetup'
import { GameViewing } from '@/components/game/GameViewing'
import { GameDiscussion } from '@/components/game/GameDiscussion'
import { GameReveal } from '@/components/game/GameReveal'
import { GameScoreboard } from '@/components/game/GameScoreboard'
import { PlayerCard } from '@/components/game/PlayerCard'

function JoiningWait() {
  const { players } = useGameStore()
  return (
    <div className="flex flex-col flex-1 p-4 items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-4xl mb-3">⏳</p>
        <h2 className="text-white font-semibold text-lg mb-1">Wachten op meer spelers</h2>
        <p className="text-slate-400 text-sm">De host start het spel zodra iedereen er is</p>
      </div>
      {players.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-slate-400 text-xs text-center mb-3">
            {players.length} speler{players.length !== 1 ? 's' : ''} in de lobby
          </p>
          <div className="grid grid-cols-2 gap-3">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Game() {
  const { gameState, isMultiDevice, myPlayerId, players, resetGame } = useGameStore()
  const navigate = useNavigate()
  const [confirmEnd, setConfirmEnd] = useState(false)

  const amIHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false

  const handleLeave = () => {
    if (amIHost) {
      socket.emit('end_game')
      setConfirmEnd(false)
    } else {
      socket.emit('leave_game')
      localStorage.removeItem('imposter_session')
      resetGame()
      navigate('/')
    }
  }

  const leaveButton = isMultiDevice ? (
    <div className="absolute top-2 right-2 z-40">
      {confirmEnd ? (
        <div className="flex items-center gap-2 bg-slate-800/95 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
          <span className="text-xs text-slate-300">Spel stoppen voor iedereen?</span>
          <button
            onClick={handleLeave}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            Ja
          </button>
          <button
            onClick={() => setConfirmEnd(false)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Nee
          </button>
        </div>
      ) : (
        <button
          onClick={() => amIHost ? setConfirmEnd(true) : handleLeave()}
          className="text-slate-600 hover:text-slate-400 text-sm px-2 py-1 transition-colors rounded"
          aria-label={amIHost ? 'Spel beëindigen' : 'Spel verlaten'}
        >
          {amIHost ? '⏹' : '✕'}
        </button>
      )}
    </div>
  ) : null

  switch (gameState) {
    case 'joining':
      return <div className="relative flex flex-col flex-1">{leaveButton}<JoiningWait /></div>
    case 'setup':
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameSetup /></div>
    case 'viewing':
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameViewing /></div>
    case 'discussion':
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameDiscussion /></div>
    case 'reveal':
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameReveal /></div>
    case 'scoreboard':
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameScoreboard /></div>
    default:
      return <div className="relative flex flex-col flex-1">{leaveButton}<GameSetup /></div>
  }
}
