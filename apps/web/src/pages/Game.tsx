import { useGameStore } from '@/stores/gameStore'
import { GameSetup } from '@/components/game/GameSetup'
import { GameViewing } from '@/components/game/GameViewing'
import { GameDiscussion } from '@/components/game/GameDiscussion'
import { GameReveal } from '@/components/game/GameReveal'

export function Game() {
  const { gameState } = useGameStore()

  switch (gameState) {
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
