import { useGameStore } from '@/stores/gameStore'
import { GameSetup } from '@/components/game/GameSetup'
import { GameViewing } from '@/components/game/GameViewing'
import { GameDiscussion } from '@/components/game/GameDiscussion'
import { GameReveal } from '@/components/game/GameReveal'
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
  const { gameState } = useGameStore()

  switch (gameState) {
    case 'joining':
      return <JoiningWait />
    case 'setup':
      return <GameSetup />
    case 'viewing':
      return <GameViewing />
    case 'discussion':
      return <GameDiscussion />
    case 'reveal':
      return <GameReveal />
    default:
      return <GameSetup />
  }
}
