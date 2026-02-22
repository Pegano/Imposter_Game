import { Server, Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  GameSession,
  GamePlayer,
  GameOutcome,
} from '@imposter-game/shared'
import { generateGameCode, getHintForDifficulty } from '@imposter-game/shared'
import { prisma } from '../db/client.js'

async function saveGameResult(session: GameSession) {
  try {
    const maxScore = Math.max(...session.players.map((p) => p.score ?? 0))
    await prisma.gameResult.create({
      data: {
        code: session.code,
        roundsPlayed: session.roundsPlayed ?? 1,
        playerCount: session.players.length,
        playerResults: {
          create: session.players.map((p) => ({
            playerName: p.name,
            avatarId: p.avatarId,
            score: p.score ?? 0,
            isWinner: (p.score ?? 0) === maxScore && maxScore > 0,
          })),
        },
      },
    })
  } catch (err) {
    console.error('Failed to save game result:', err)
  }
}

// In-memory game sessions
const gameSessions = new Map<string, GameSession>()

// Map socket ID to player info
const socketToGame = new Map<string, { gameCode: string; playerId: string }>()

// Clean up old sessions every hour
setInterval(() => {
  const now = Date.now()
  const fourHoursAgo = now - 4 * 60 * 60 * 1000

  for (const [code, session] of gameSessions.entries()) {
    if (new Date(session.createdAt).getTime() < fourHoursAgo) {
      gameSessions.delete(code)
      console.log(`Cleaned up old session: ${code}`)
    }
  }
}, 60 * 60 * 1000)

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Create a new game (host is automatically added as first player)
    socket.on('create_game', ({ playerName, avatarId }) => {
      const code = generateGameCode()

      const hostPlayer: GamePlayer = {
        id: crypto.randomUUID(),
        name: playerName,
        avatarId,
        isImposter: false,
        hasViewed: false,
        isHost: true,
        isConnected: true,
        score: 0,
        joinedAt: new Date(),
      }

      const session: GameSession = {
        id: crypto.randomUUID(),
        code,
        hostId: socket.id,
        state: 'lobby',
        settings: {
          difficulty: 1,
          timerEnabled: true,
          timerSeconds: 120,
        },
        players: [hostPlayer],
        timerPaused: false,
        createdAt: new Date(),
      }

      gameSessions.set(code, session)
      socketToGame.set(socket.id, { gameCode: code, playerId: hostPlayer.id })
      socket.join(code)

      socket.emit('game_created', session)
      socket.emit('your_player', hostPlayer)
      console.log(`Game created: ${code} by ${playerName}`)
    })

    // Join an existing game
    socket.on('join_game', ({ code, name, avatarId }) => {
      const session = gameSessions.get(code.toUpperCase())

      if (!session) {
        socket.emit('error', 'Game niet gevonden')
        return
      }

      if (session.state !== 'lobby' && session.state !== 'joining') {
        socket.emit('error', 'Game is al begonnen')
        return
      }

      const player: GamePlayer = {
        id: crypto.randomUUID(),
        name,
        avatarId,
        isImposter: false,
        hasViewed: false,
        isHost: session.players.length === 0,
        isConnected: true,
        score: 0,
        joinedAt: new Date(),
      }

      session.players.push(player)
      session.state = 'joining'

      socketToGame.set(socket.id, { gameCode: code, playerId: player.id })
      socket.join(code)

      socket.emit('your_player', player)
      io.to(code).emit('player_joined', player)
      io.to(code).emit('game_state', session)

      console.log(`Player ${name} joined game ${code}`)
    })

    // Rejoin an existing game (after disconnect/refresh)
    socket.on('rejoin_game', ({ code, playerId }) => {
      const upperCode = code.toUpperCase()
      const session = gameSessions.get(upperCode)

      if (!session) {
        socket.emit('error', 'Game niet gevonden')
        return
      }

      const player = session.players.find((p) => p.id === playerId)
      if (!player) {
        socket.emit('error', 'Speler niet gevonden in dit spel')
        return
      }

      player.isConnected = true
      socketToGame.set(socket.id, { gameCode: upperCode, playerId })
      socket.join(upperCode)

      socket.emit('your_player', player)
      socket.emit('game_state', session)

      // Re-send role if word is known (viewing / discussion / reveal / scoreboard)
      if (session.word && ['viewing', 'discussion', 'reveal', 'scoreboard'].includes(session.state)) {
        const content = player.isImposter
          ? getHintForDifficulty(session.word, session.settings.difficulty)
          : session.word.word
        socket.emit('your_role', { isImposter: player.isImposter, content })
      }

      // Notify others that the player is back
      io.to(upperCode).emit('game_state', session)
      console.log(`Player ${player.name} rejoined game ${upperCode}`)
    })

    // Add player (single-device mode)
    socket.on('add_player', ({ name, avatarId }) => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      const player: GamePlayer = {
        id: crypto.randomUUID(),
        name,
        avatarId,
        isImposter: false,
        hasViewed: false,
        isHost: false,
        isConnected: true,
        score: 0,
        joinedAt: new Date(),
      }

      session.players.push(player)
      io.to(gameInfo.gameCode).emit('player_joined', player)
      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Remove player
    socket.on('remove_player', ({ playerId }) => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      session.players = session.players.filter((p) => p.id !== playerId)
      io.to(gameInfo.gameCode).emit('player_left', playerId)
      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Update game settings
    socket.on('update_settings', (settings) => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      session.settings = { ...session.settings, ...settings }
      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Start a new round
    socket.on('start_round', async () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      if (session.players.length < 3) {
        socket.emit('error', 'Minimaal 3 spelers nodig')
        return
      }

      try {
        // Get random word from database
        const whereClause = session.settings.categoryId
          ? { categoryId: session.settings.categoryId }
          : {}

        const wordCount = await prisma.word.count({ where: whereClause })

        if (wordCount === 0) {
          socket.emit('error', 'Geen woorden gevonden')
          return
        }

        const skip = Math.floor(Math.random() * wordCount)
        const word = await prisma.word.findFirst({
          where: whereClause,
          skip,
        })

        if (!word) {
          socket.emit('error', 'Geen woord gevonden')
          return
        }

        // Assign imposter
        const imposterIndex = Math.floor(Math.random() * session.players.length)

        session.players.forEach((player, index) => {
          player.isImposter = index === imposterIndex
          player.hasViewed = false
        })

        session.wordId = word.id
        session.word = word
        session.state = 'viewing'

        io.to(gameInfo.gameCode).emit('game_state', session)

        // Send individual role info
        session.players.forEach((player) => {
          const playerSocket = findSocketByPlayerId(player.id)
          if (playerSocket) {
            const content = player.isImposter
              ? getHintForDifficulty(word, session.settings.difficulty)
              : word.word

            playerSocket.emit('your_role', {
              isImposter: player.isImposter,
              content,
            })
          }
        })

        console.log(`Round started in game ${gameInfo.gameCode}`)
      } catch (error) {
        console.error('Error starting round:', error)
        socket.emit('error', 'Fout bij starten ronde')
      }
    })

    // Player viewed their card
    socket.on('mark_viewed', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      const player = session.players.find((p) => p.id === gameInfo.playerId)
      if (player) {
        player.hasViewed = true
        io.to(gameInfo.gameCode).emit('player_viewed', player.id)
        io.to(gameInfo.gameCode).emit('game_state', session)
      }
    })

    // Start discussion phase
    socket.on('start_discussion', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      session.state = 'discussion'
      session.timerStartedAt = new Date()
      session.timerPaused = false
      session.starterId = session.players[Math.floor(Math.random() * session.players.length)].id

      io.to(gameInfo.gameCode).emit('game_state', session)

      // Start timer countdown
      if (session.settings.timerEnabled) {
        startTimer(gameInfo.gameCode, session.settings.timerSeconds, io)
      }
    })

    // Toggle timer pause
    socket.on('toggle_timer_pause', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      session.timerPaused = !session.timerPaused
      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Reveal imposter
    socket.on('reveal', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session || !session.word) return

      session.state = 'reveal'

      const imposter = session.players.find((p) => p.isImposter)
      if (imposter) {
        io.to(gameInfo.gameCode).emit('game_revealed', {
          word: session.word.word,
          imposter,
          hint: getHintForDifficulty(session.word, session.settings.difficulty),
        })
      }

      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Score outcome after reveal
    socket.on('set_outcome', (outcome: GameOutcome) => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      if (outcome === 'imposter_lost') {
        session.players.forEach((p) => { if (!p.isImposter) p.score += 1 })
      } else if (outcome === 'imposter_guessed') {
        session.players.forEach((p) => { if (p.isImposter) p.score += 5 })
      } else if (outcome === 'imposter_won') {
        session.players.forEach((p) => { if (!p.isImposter) p.score -= 2 })
      }

      session.roundsPlayed = (session.roundsPlayed ?? 0) + 1
      session.state = 'scoreboard'
      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // Next round
    socket.on('next_round', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (!session) return

      session.state = 'setup'
      session.wordId = undefined
      session.word = undefined
      session.players.forEach((p) => {
        p.isImposter = false
        p.hasViewed = false
      })

      io.to(gameInfo.gameCode).emit('game_state', session)
    })

    // End game
    socket.on('end_game', () => {
      const gameInfo = socketToGame.get(socket.id)
      if (!gameInfo) return

      const session = gameSessions.get(gameInfo.gameCode)
      if (session && session.players.some((p) => (p.score ?? 0) !== 0)) {
        void saveGameResult(session)
      }

      gameSessions.delete(gameInfo.gameCode)
      io.to(gameInfo.gameCode).emit('game_state', null as unknown as GameSession)

      // Clean up all sockets in this game
      for (const [socketId, info] of socketToGame.entries()) {
        if (info.gameCode === gameInfo.gameCode) {
          socketToGame.delete(socketId)
        }
      }
    })

    // Leave game
    socket.on('leave_game', () => {
      handleDisconnect(socket, io)
    })

    // Disconnect
    socket.on('disconnect', () => {
      handleDisconnect(socket, io)
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  // Helper to find socket by player ID
  function findSocketByPlayerId(playerId: string): Socket | undefined {
    for (const [socketId, info] of socketToGame.entries()) {
      if (info.playerId === playerId) {
        return io.sockets.sockets.get(socketId)
      }
    }
    return undefined
  }

  // Handle player disconnect
  function handleDisconnect(
    socket: Socket,
    io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    const gameInfo = socketToGame.get(socket.id)
    if (!gameInfo) return

    const session = gameSessions.get(gameInfo.gameCode)
    if (!session) return

    const player = session.players.find((p) => p.id === gameInfo.playerId)
    if (player) {
      player.isConnected = false
      io.to(gameInfo.gameCode).emit('game_state', session)
    }

    socketToGame.delete(socket.id)
  }
}

// Timer management
const activeTimers = new Map<string, NodeJS.Timeout>()

function startTimer(
  gameCode: string,
  seconds: number,
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  // Clear existing timer
  const existing = activeTimers.get(gameCode)
  if (existing) clearInterval(existing)

  let remaining = seconds

  const timer = setInterval(() => {
    const session = gameSessions.get(gameCode)
    if (!session || session.state !== 'discussion' || session.timerPaused) {
      return
    }

    remaining--
    io.to(gameCode).emit('timer_update', remaining)

    if (remaining <= 0) {
      clearInterval(timer)
      activeTimers.delete(gameCode)
    }
  }, 1000)

  activeTimers.set(gameCode, timer)
}
