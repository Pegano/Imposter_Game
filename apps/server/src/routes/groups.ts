import { Router } from 'express'
import { prisma } from '../db/client.js'

export const groupsRouter = Router()

// Get all player groups
groupsRouter.get('/', async (_req, res) => {
  try {
    const groups = await prisma.playerGroup.findMany({
      include: { players: true },
      orderBy: { name: 'asc' },
    })

    res.json({ success: true, data: groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch groups' })
  }
})

// Get single group
groupsRouter.get('/:id', async (req, res) => {
  try {
    const group = await prisma.playerGroup.findUnique({
      where: { id: req.params.id },
      include: { players: true },
    })

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' })
    }

    res.json({ success: true, data: group })
  } catch (error) {
    console.error('Error fetching group:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch group' })
  }
})

// Create group with players
groupsRouter.post('/', async (req, res) => {
  try {
    const { name, players } = req.body

    if (!name || !players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name and at least one player are required'
      })
    }

    const group = await prisma.playerGroup.create({
      data: {
        name,
        players: {
          create: players.map((p: { name: string; avatarId: string }) => ({
            name: p.name,
            avatarId: p.avatarId,
          })),
        },
      },
      include: { players: true },
    })

    res.status(201).json({ success: true, data: group })
  } catch (error) {
    console.error('Error creating group:', error)
    res.status(500).json({ success: false, error: 'Failed to create group' })
  }
})

// Update group name
groupsRouter.put('/:id', async (req, res) => {
  try {
    const { name } = req.body

    const group = await prisma.playerGroup.update({
      where: { id: req.params.id },
      data: { name },
      include: { players: true },
    })

    res.json({ success: true, data: group })
  } catch (error) {
    console.error('Error updating group:', error)
    res.status(500).json({ success: false, error: 'Failed to update group' })
  }
})

// Delete group
groupsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.playerGroup.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ success: false, error: 'Failed to delete group' })
  }
})

// Add player to group
groupsRouter.post('/:id/players', async (req, res) => {
  try {
    const { name, avatarId } = req.body

    if (!name || !avatarId) {
      return res.status(400).json({
        success: false,
        error: 'Name and avatarId are required'
      })
    }

    const player = await prisma.player.create({
      data: {
        name,
        avatarId,
        groupId: req.params.id,
      },
    })

    res.status(201).json({ success: true, data: player })
  } catch (error) {
    console.error('Error adding player:', error)
    res.status(500).json({ success: false, error: 'Failed to add player' })
  }
})

// Remove player from group
groupsRouter.delete('/:groupId/players/:playerId', async (req, res) => {
  try {
    await prisma.player.delete({
      where: { id: req.params.playerId },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error removing player:', error)
    res.status(500).json({ success: false, error: 'Failed to remove player' })
  }
})
