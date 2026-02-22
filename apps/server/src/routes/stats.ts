import { Router } from 'express'
import { prisma } from '../db/client.js'
import type { GameResultPayload } from '@imposter-game/shared'

export const statsRouter = Router()

// POST /api/stats/games — save a completed game result
statsRouter.post('/games', async (req, res) => {
  const payload = req.body as GameResultPayload

  if (!payload?.playerResults?.length) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    const result = await prisma.gameResult.create({
      data: {
        code: payload.code || 'LOCAL',
        roundsPlayed: payload.roundsPlayed || 1,
        playerCount: payload.playerResults.length,
        playerResults: {
          create: payload.playerResults.map((p) => ({
            playerName: p.playerName,
            avatarId: p.avatarId,
            score: p.score,
            isWinner: p.isWinner,
          })),
        },
      },
      include: { playerResults: true },
    })

    return res.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Error saving game result:', error)
    return res.status(500).json({ error: 'Failed to save game result' })
  }
})

// GET /api/stats — leaderboard + recent games
statsRouter.get('/', async (_req, res) => {
  try {
    // Aggregate scores per player name
    const [scoreGroups, winGroups, recentGames] = await Promise.all([
      prisma.gamePlayerResult.groupBy({
        by: ['playerName', 'avatarId'],
        _sum: { score: true },
        _count: { id: true },
        orderBy: { _sum: { score: 'desc' } },
        take: 20,
      }),
      prisma.gamePlayerResult.groupBy({
        by: ['playerName'],
        where: { isWinner: true },
        _count: { id: true },
      }),
      prisma.gameResult.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          playerResults: {
            orderBy: { score: 'desc' },
          },
        },
      }),
    ])

    const winMap = new Map(winGroups.map((w) => [w.playerName, w._count.id]))

    const leaderboard = scoreGroups.map((entry) => ({
      playerName: entry.playerName,
      avatarId: entry.avatarId,
      totalScore: entry._sum.score ?? 0,
      gamesPlayed: entry._count.id,
      wins: winMap.get(entry.playerName) ?? 0,
    }))

    const formattedGames = recentGames.map((game) => ({
      id: game.id,
      code: game.code,
      roundsPlayed: game.roundsPlayed,
      playerCount: game.playerCount,
      createdAt: game.createdAt.toISOString(),
      playerResults: game.playerResults.map((p) => ({
        playerName: p.playerName,
        avatarId: p.avatarId,
        score: p.score,
        isWinner: p.isWinner,
      })),
    }))

    return res.json({
      leaderboard,
      recentGames: formattedGames,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
})
