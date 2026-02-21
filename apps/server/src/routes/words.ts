import { Router } from 'express'
import { prisma } from '../db/client.js'

export const wordsRouter = Router()

// Get all words (optionally filtered by category)
wordsRouter.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query

    const words = await prisma.word.findMany({
      where: categoryId ? { categoryId: String(categoryId) } : undefined,
      include: { category: true },
      orderBy: { word: 'asc' },
    })

    res.json({ success: true, data: words })
  } catch (error) {
    console.error('Error fetching words:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch words' })
  }
})

// Get random word (optionally filtered by category) — must be BEFORE /:id
wordsRouter.get('/random', async (req, res) => {
  try {
    const { categoryId } = req.query

    const count = await prisma.word.count({
      where: categoryId ? { categoryId: String(categoryId) } : undefined,
    })

    if (count === 0) {
      return res.status(404).json({ success: false, error: 'No words found' })
    }

    const skip = Math.floor(Math.random() * count)

    const word = await prisma.word.findFirst({
      where: categoryId ? { categoryId: String(categoryId) } : undefined,
      skip,
      include: { category: true },
    })

    res.json({ success: true, data: word })
  } catch (error) {
    console.error('Error fetching random word:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch random word' })
  }
})

// Get single word
wordsRouter.get('/:id', async (req, res) => {
  try {
    const word = await prisma.word.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    })

    if (!word) {
      return res.status(404).json({ success: false, error: 'Word not found' })
    }

    res.json({ success: true, data: word })
  } catch (error) {
    console.error('Error fetching word:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch word' })
  }
})

// Create word
wordsRouter.post('/', async (req, res) => {
  try {
    const { categoryId, word, hintEasy, hintMedium, hintHard } = req.body

    if (!categoryId || !word || !hintEasy || !hintMedium || !hintHard) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      })
    }

    const newWord = await prisma.word.create({
      data: { categoryId, word, hintEasy, hintMedium, hintHard },
      include: { category: true },
    })

    res.status(201).json({ success: true, data: newWord })
  } catch (error) {
    console.error('Error creating word:', error)
    res.status(500).json({ success: false, error: 'Failed to create word' })
  }
})

// Update word
wordsRouter.put('/:id', async (req, res) => {
  try {
    const { word, hintEasy, hintMedium, hintHard } = req.body

    const updatedWord = await prisma.word.update({
      where: { id: req.params.id },
      data: { word, hintEasy, hintMedium, hintHard },
      include: { category: true },
    })

    res.json({ success: true, data: updatedWord })
  } catch (error) {
    console.error('Error updating word:', error)
    res.status(500).json({ success: false, error: 'Failed to update word' })
  }
})

// Delete word
wordsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.word.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting word:', error)
    res.status(500).json({ success: false, error: 'Failed to delete word' })
  }
})
