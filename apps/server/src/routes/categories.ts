import { Router } from 'express'
import { prisma } from '../db/client.js'

export const categoriesRouter = Router()

// Get all categories with word count
categoriesRouter.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { words: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = categories.map((cat) => ({
      ...cat,
      wordCount: cat._count.words,
      _count: undefined,
    }))

    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch categories' })
  }
})

// Get single category
categoriesRouter.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { words: true },
    })

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    res.json({ success: true, data: category })
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch category' })
  }
})

// Create category
categoriesRouter.post('/', async (req, res) => {
  try {
    const { name, icon } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' })
    }

    const category = await prisma.category.create({
      data: { name, icon, isDefault: false },
    })

    res.status(201).json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ success: false, error: 'Failed to create category' })
  }
})

// Update category
categoriesRouter.put('/:id', async (req, res) => {
  try {
    const { name, icon } = req.body

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon },
    })

    res.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating category:', error)
    res.status(500).json({ success: false, error: 'Failed to update category' })
  }
})

// Delete category
categoriesRouter.delete('/:id', async (req, res) => {
  try {
    // Check if it's a default category
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    })

    if (category?.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default category'
      })
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ success: false, error: 'Failed to delete category' })
  }
})
