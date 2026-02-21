import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import { categoriesRouter } from './routes/categories.js'
import { wordsRouter } from './routes/words.js'
import { groupsRouter } from './routes/groups.js'
import { generateRouter } from './routes/generate.js'
import { setupSocketHandlers } from './socket/handlers.js'
import type { ClientToServerEvents, ServerToClientEvents } from '@imposter-game/shared'

// Load environment variables
config()

const app = express()
const httpServer = createServer(app)

// Socket.IO setup
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/categories', categoriesRouter)
app.use('/api/words', wordsRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/generate', generateRouter)

// Socket.IO handlers
setupSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket server ready`)
})
