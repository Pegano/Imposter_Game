import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../db/client.js'

export const generateRouter = Router()

const client = new Anthropic()

interface GeneratedWord {
  word: string
  hintEasy: string   // 1 woord, duidelijk gerelateerd
  hintMedium: string // 1 woord, vager verband
  hintHard: string   // 1 woord, abstract / ver verband
}

// POST /api/generate/words
// Body: { categoryId, categoryName, count? }
generateRouter.post('/words', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'ANTHROPIC_API_KEY is niet ingesteld op de server',
    })
  }

  const { categoryId, categoryName, count = 20 } = req.body

  if (!categoryId || !categoryName) {
    return res.status(400).json({ success: false, error: 'categoryId en categoryName zijn verplicht' })
  }

  // Haal bestaande woorden op zodat AI geen duplicaten maakt
  const existing = await prisma.word.findMany({
    where: { categoryId },
    select: { word: true },
  })
  const existingWords = existing.map((w) => w.word).join(', ')

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Je bent een assistent die woorden genereert voor een gezelschapsspel genaamd "Imposter".
Het spel werkt zo: spelers zien een woord. De imposter ziet alleen een hint (1 woord) in plaats van het echte woord.

Genereer ${count} unieke woorden voor de categorie "${categoryName}" in het Nederlands.

Regels:
- Elk woord is een zelfstandig naamwoord dat kinderen en volwassenen kennen
- Elke hint bestaat uit PRECIES 1 Nederlands woord
- hintEasy: duidelijk gerelateerd aan het woord (bijna een synoniemen of direct kenmerk)
- hintMedium: vager verband, categorie of eigenschap
- hintHard: abstract of ver verband, moeilijk te raden
- Geen duplicaten met deze bestaande woorden: ${existingWords || 'geen'}

Antwoord ALLEEN met een JSON array, geen uitleg:
[
  { "word": "Pizza", "hintEasy": "Tomaat", "hintMedium": "Italië", "hintHard": "Napels" },
  ...
]`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return res.status(500).json({ success: false, error: 'AI gaf geen geldig JSON terug' })
    }

    const generated: GeneratedWord[] = JSON.parse(jsonMatch[0])

    // Sla alle gegenereerde woorden op in de database
    const created = await Promise.all(
      generated.map((g) =>
        prisma.word.create({
          data: {
            categoryId,
            word: g.word,
            hintEasy: g.hintEasy,
            hintMedium: g.hintMedium,
            hintHard: g.hintHard,
          },
        })
      )
    )

    res.json({ success: true, data: created, count: created.length })
  } catch (error) {
    console.error('AI generation error:', error)
    res.status(500).json({ success: false, error: 'AI generatie mislukt' })
  }
})
