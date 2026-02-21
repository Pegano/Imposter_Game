import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '@/lib/socket'
import { useGameStore } from '@/stores/gameStore'
import type { GameSession } from '@imposter-game/shared'

export function useGameSocket() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleGameState = (session: GameSession | null) => {
      if (!session) {
        useGameStore.getState().resetGame()
        navigate('/')
        return
      }

      const prevState = useGameStore.getState().gameState
      useGameStore.getState().syncGameState(session)

      // Navigate to game when a round starts
      if (session.state === 'viewing' && prevState !== 'viewing') {
        navigate('/game')
      }
    }

    // game_created fires only for host; game_state fires for everyone
    socket.on('game_created', handleGameState)
    socket.on('game_state', handleGameState)

    socket.on('your_player', (player) => {
      useGameStore.getState().setMyPlayerId(player.id)
    })

    socket.on('your_role', (role) => {
      useGameStore.getState().setMyRole(role)
    })

    socket.on('player_viewed', (playerId) => {
      useGameStore.getState().markPlayerViewed(playerId)
    })

    socket.on('timer_update', (remaining) => {
      useGameStore.getState().setTimerRemaining(remaining)
    })

    socket.on('game_revealed', ({ word, imposter, hint }) => {
      // game_revealed fires alongside game_state 'reveal'; data already synced via game_state
      // Store reveal-specific info in currentWord if missing
      const store = useGameStore.getState()
      if (!store.currentWord) {
        store.setCurrentWord({
          id: '',
          categoryId: '',
          word,
          hintEasy: hint,
          hintMedium: hint,
          hintHard: hint,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      // Make sure imposter flag is visible — syncGameState handles it via game_state
      void imposter
    })

    socket.on('error', (message) => {
      console.error('[Socket error]', message)
    })

    return () => {
      socket.off('game_created', handleGameState)
      socket.off('game_state', handleGameState)
      socket.off('your_player')
      socket.off('your_role')
      socket.off('player_viewed')
      socket.off('timer_update')
      socket.off('game_revealed')
      socket.off('error')
    }
  }, [navigate])
}
