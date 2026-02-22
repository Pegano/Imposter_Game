import { create } from 'zustand'
import type { GameState, GamePlayer, GameSettings, GameSession, Word, GameOutcome } from '@imposter-game/shared'
import { generateGameCode } from '@imposter-game/shared'

interface GameStore {
  // Session state
  session: GameSession | null
  gameState: GameState
  players: GamePlayer[]
  settings: GameSettings
  currentWord: Word | null
  myPlayerId: string | null
  myRole: { isImposter: boolean; content: string } | null

  // Timer state
  timerRemaining: number

  // Multi-device mode
  isMultiDevice: boolean

  // Actions
  createGame: () => void
  setGameState: (state: GameState) => void
  addPlayer: (player: GamePlayer) => void
  removePlayer: (playerId: string) => void
  updateSettings: (settings: Partial<GameSettings>) => void
  setMyRole: (role: { isImposter: boolean; content: string }) => void
  markPlayerViewed: (playerId: string) => void
  setCurrentWord: (word: Word) => void
  setTimerRemaining: (seconds: number) => void
  assignRoles: (word: Word) => void
  resetGame: () => void
  nextRound: () => void

  // Multi-device actions
  setMultiDevice: (v: boolean) => void
  setMyPlayerId: (id: string) => void
  syncGameState: (session: GameSession) => void

  // Scoring (single-device)
  applyOutcome: (outcome: GameOutcome) => void
}

const DEFAULT_SETTINGS: GameSettings = {
  categoryId: undefined,
  difficulty: 1,
  timerEnabled: true,
  timerSeconds: 120,
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  session: null,
  gameState: 'lobby',
  players: [],
  settings: DEFAULT_SETTINGS,
  currentWord: null,
  myPlayerId: null,
  myRole: null,
  timerRemaining: 0,
  isMultiDevice: false,

  // Actions
  createGame: () => {
    const code = generateGameCode()
    set({
      session: {
        id: crypto.randomUUID(),
        code,
        hostId: '',
        state: 'lobby',
        settings: DEFAULT_SETTINGS,
        players: [],
        timerPaused: false,
        createdAt: new Date(),
      },
      gameState: 'lobby',
      players: [],
    })
  },

  setGameState: (state) => set({ gameState: state }),

  addPlayer: (player) =>
    set((s) => {
      const isFirstPlayer = s.players.length === 0
      const newPlayer = {
        ...player,
        isHost: isFirstPlayer,
        score: player.score ?? 0,
      }
      return {
        players: [...s.players, newPlayer],
        myPlayerId: isFirstPlayer ? player.id : s.myPlayerId,
      }
    }),

  removePlayer: (playerId) =>
    set((s) => ({
      players: s.players.filter((p) => p.id !== playerId),
    })),

  updateSettings: (newSettings) =>
    set((s) => ({
      settings: { ...s.settings, ...newSettings },
    })),

  setMyRole: (role) => set({ myRole: role }),

  markPlayerViewed: (playerId) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === playerId ? { ...p, hasViewed: true } : p)),
    })),

  setCurrentWord: (word) => set({ currentWord: word }),

  setTimerRemaining: (seconds) => set({ timerRemaining: seconds }),

  assignRoles: (word) => {
    const { players } = get()
    if (players.length < 3) return

    // Reset all players
    const resetPlayers = players.map((p) => ({
      ...p,
      isImposter: false,
      hasViewed: false,
    }))

    // Pick random imposter
    const imposterIndex = Math.floor(Math.random() * resetPlayers.length)
    resetPlayers[imposterIndex].isImposter = true

    set({
      players: resetPlayers,
      currentWord: word,
      gameState: 'viewing',
    })
  },

  resetGame: () =>
    set({
      gameState: 'lobby',
      players: [],
      currentWord: null,
      myRole: null,
      timerRemaining: 0,
    }),

  nextRound: () =>
    set((s) => ({
      gameState: 'setup',
      currentWord: null,
      myRole: null,
      timerRemaining: s.settings.timerSeconds,
      players: s.players.map((p) => ({
        ...p,
        isImposter: false,
        hasViewed: false,
        // score is preserved across rounds
      })),
    })),

  applyOutcome: (outcome) =>
    set((s) => {
      const players = s.players.map((p) => {
        const score = p.score ?? 0
        if (outcome === 'imposter_lost' && !p.isImposter) return { ...p, score: score + 1 }
        if (outcome === 'imposter_guessed' && p.isImposter) return { ...p, score: score + 5 }
        if (outcome === 'imposter_won' && !p.isImposter) return { ...p, score: score - 2 }
        return p
      })
      const session = s.session
        ? { ...s.session, roundsPlayed: (s.session.roundsPlayed ?? 0) + 1 }
        : s.session
      return { players, session, gameState: 'scoreboard' as GameState }
    }),

  setMultiDevice: (v) => set({ isMultiDevice: v }),

  setMyPlayerId: (id) => set({ myPlayerId: id }),

  syncGameState: (session) =>
    set({
      session,
      gameState: session.state,
      players: session.players,
      settings: session.settings,
      currentWord: session.word ?? null,
    }),
}))
