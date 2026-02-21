// ============================================
// DOMAIN TYPES
// ============================================

// Avatar presets
export interface AvatarPreset {
  id: string
  name: string
  imageNotViewed: string // URL to "eyes closed" version
  imageViewed: string // URL to "eyes open" version
}

// Category for words
export interface Category {
  id: string
  name: string
  icon?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Word with hints per difficulty
export interface Word {
  id: string
  categoryId: string
  word: string
  hintEasy: string
  hintMedium: string
  hintHard: string
  createdAt: Date
  updatedAt: Date
}

// Saved player (in a group)
export interface Player {
  id: string
  name: string
  avatarId: string
  groupId?: string
  createdAt: Date
  updatedAt: Date
}

// Player group for reuse
export interface PlayerGroup {
  id: string
  name: string
  players: Player[]
  createdAt: Date
  updatedAt: Date
}

// ============================================
// GAME SESSION TYPES
// ============================================

export type GameState = 'lobby' | 'joining' | 'setup' | 'viewing' | 'discussion' | 'reveal'

export type Difficulty = 1 | 2 | 3

// Player in current game session
export interface GamePlayer {
  id: string
  name: string
  avatarId: string
  isImposter: boolean
  hasViewed: boolean
  isHost: boolean
  isConnected: boolean
  joinedAt: Date
}

// Game session settings
export interface GameSettings {
  categoryId?: string // null = all categories
  difficulty: Difficulty
  timerEnabled: boolean
  timerSeconds: number
}

// Live game session
export interface GameSession {
  id: string
  code: string
  hostId: string
  state: GameState
  wordId?: string
  word?: Word
  settings: GameSettings
  players: GamePlayer[]
  timerStartedAt?: Date
  timerPaused: boolean
  createdAt: Date
}

// ============================================
// SOCKET EVENTS
// ============================================

// Client → Server events
export interface ClientToServerEvents {
  create_game: (data: { playerName: string; avatarId: string }) => void
  join_game: (data: { code: string; name: string; avatarId: string }) => void
  leave_game: () => void
  add_player: (data: { name: string; avatarId: string }) => void
  remove_player: (data: { playerId: string }) => void
  update_settings: (settings: Partial<GameSettings>) => void
  start_round: () => void
  mark_viewed: () => void
  start_discussion: () => void
  toggle_timer_pause: () => void
  reveal: () => void
  next_round: () => void
  end_game: () => void
}

// Server → Client events
export interface ServerToClientEvents {
  game_created: (session: GameSession) => void
  game_state: (session: GameSession) => void
  player_joined: (player: GamePlayer) => void
  player_left: (playerId: string) => void
  player_viewed: (playerId: string) => void
  your_role: (data: { isImposter: boolean; content: string }) => void
  your_player: (player: GamePlayer) => void
  timer_update: (remainingSeconds: number) => void
  game_revealed: (data: { word: string; imposter: GamePlayer; hint: string }) => void
  error: (message: string) => void
  connection_status: (connected: boolean) => void
}

// ============================================
// API TYPES
// ============================================

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Category with word count
export interface CategoryWithCount extends Category {
  wordCount: number
}

// Create/Update DTOs
export interface CreateCategoryDto {
  name: string
  icon?: string
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
}

export interface CreateWordDto {
  categoryId: string
  word: string
  hintEasy: string
  hintMedium: string
  hintHard: string
}

export interface UpdateWordDto {
  word?: string
  hintEasy?: string
  hintMedium?: string
  hintHard?: string
}

export interface CreatePlayerGroupDto {
  name: string
  players: Array<{ name: string; avatarId: string }>
}

export interface UpdatePlayerGroupDto {
  name?: string
}

// ============================================
// UTILS
// ============================================

// Generate a game code like "BLAUW-7392"
export function generateGameCode(): string {
  const words = ['ROOD', 'BLAUW', 'GROEN', 'GEEL', 'ORANJE', 'PAARS', 'ROZE', 'WIT', 'ZWART']
  const word = words[Math.floor(Math.random() * words.length)]
  const number = Math.floor(1000 + Math.random() * 9000)
  return `${word}-${number}`
}

// Get hint based on difficulty
export function getHintForDifficulty(word: Word, difficulty: Difficulty): string {
  switch (difficulty) {
    case 1:
      return word.hintEasy
    case 2:
      return word.hintMedium
    case 3:
      return word.hintHard
  }
}

// Check if enough players
export function canStartGame(players: GamePlayer[]): boolean {
  return players.length >= 3
}

// Check if all players have viewed
export function allPlayersViewed(players: GamePlayer[]): boolean {
  return players.every((p) => p.hasViewed)
}
