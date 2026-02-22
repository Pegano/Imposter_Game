import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '@/lib/socket'
import { useGameStore } from '@/stores/gameStore'
import type { GameSession, GameState } from '@imposter-game/shared'

const ACTIVE_STATES: GameState[] = ['joining', 'setup', 'viewing', 'discussion', 'reveal', 'scoreboard']

export function useGameSocket() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleGameState = (session: GameSession | null) => {
      if (!session) {
        localStorage.removeItem('imposter_session')
        useGameStore.getState().resetGame()
        navigate('/')
        return
      }

      const prevState = useGameStore.getState().gameState
      useGameStore.getState().syncGameState(session)

      // Persist session for auto-rejoin on reconnect
      const myPlayerId = useGameStore.getState().myPlayerId
      if (myPlayerId) {
        localStorage.setItem('imposter_session', JSON.stringify({ code: session.code, playerId: myPlayerId }))
      }

      // Navigate to /game when entering an active game state from outside
      if (ACTIVE_STATES.includes(session.state) && !ACTIVE_STATES.includes(prevState)) {
        navigate('/game')
      }
    }

    // game_created fires only for host; game_state fires for everyone
    socket.on('game_created', handleGameState)
    socket.on('game_state', handleGameState)

    socket.on('your_player', (player) => {
      useGameStore.getState().setMyPlayerId(player.id)
      // Save immediately with game code if session is already in store (host flow)
      const code = useGameStore.getState().session?.code
      if (code) {
        localStorage.setItem('imposter_session', JSON.stringify({ code, playerId: player.id }))
      }
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

    // Auto-rejoin when socket (re)connects
    const handleConnect = () => {
      try {
        const stored = localStorage.getItem('imposter_session')
        if (!stored) return
        const { code, playerId } = JSON.parse(stored) as { code?: string; playerId?: string }
        if (code && playerId) socket.emit('rejoin_game', { code, playerId })
      } catch {
        localStorage.removeItem('imposter_session')
      }
    }

    socket.on('connect', handleConnect)
    // Socket may already be connected when this effect runs
    if (socket.connected) handleConnect()

    return () => {
      socket.off('game_created', handleGameState)
      socket.off('game_state', handleGameState)
      socket.off('your_player')
      socket.off('your_role')
      socket.off('player_viewed')
      socket.off('timer_update')
      socket.off('game_revealed')
      socket.off('error')
      socket.off('connect', handleConnect)
    }
  }, [navigate])
}
