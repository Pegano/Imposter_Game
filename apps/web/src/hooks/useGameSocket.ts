import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '@/lib/socket'
import { useGameStore } from '@/stores/gameStore'
import type { GameSession } from '@imposter-game/shared'

const ACTIVE_STATES = new Set(['joining', 'setup', 'viewing', 'discussion', 'reveal', 'scoreboard'])

export function useGameSocket() {
  const navigate = useNavigate()

  useEffect(() => {
    // Flag: we just emitted rejoin_game and are waiting for the response
    let pendingRejoin = false

    const handleGameState = (session: GameSession | null) => {
      if (!session) {
        localStorage.removeItem('imposter_session')
        useGameStore.getState().resetGame()
        navigate('/')
        return
      }

      const prevState = useGameStore.getState().gameState
      useGameStore.getState().syncGameState(session)

      // Persist session so we can auto-rejoin after a disconnect or refresh
      const myPlayerId = useGameStore.getState().myPlayerId
      if (myPlayerId) {
        localStorage.setItem('imposter_session', JSON.stringify({ code: session.code, playerId: myPlayerId }))
      }

      // Navigate to /game when:
      // 1. A new round starts (state → viewing), OR
      // 2. We just rejoined an already-active game (pendingRejoin was set)
      if (
        (session.state === 'viewing' && prevState !== 'viewing') ||
        (pendingRejoin && ACTIVE_STATES.has(session.state))
      ) {
        pendingRejoin = false
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
      void imposter
    })

    socket.on('error', (message) => {
      console.error('[Socket error]', message)
      // If rejoin failed, clear the flag + stale localStorage so it doesn't
      // accidentally trigger navigation when the host creates a new game
      if (pendingRejoin) {
        pendingRejoin = false
        localStorage.removeItem('imposter_session')
      }
    })

    // Auto-rejoin when the socket (re)connects after a disconnect or refresh
    const handleConnect = () => {
      try {
        const stored = localStorage.getItem('imposter_session')
        if (!stored) return
        const { code, playerId } = JSON.parse(stored) as { code?: string; playerId?: string }
        if (code && playerId) {
          pendingRejoin = true
          socket.emit('rejoin_game', { code, playerId })
        }
      } catch {
        localStorage.removeItem('imposter_session')
      }
    }

    socket.on('connect', handleConnect)
    // If socket is already connected on mount (typical first load), attempt rejoin now
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
