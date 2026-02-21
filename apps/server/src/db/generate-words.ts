/**
 * Script om 400+ woorden te genereren via Claude en op te slaan in de database.
 * Gebruik: npm run db:generate-words
 *
 * Vereist: ANTHROPIC_API_KEY in .env
 */
import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()
const client = new Anthropic()

interface GeneratedWord {
  word: string
  hintEasy: string
  hintMedium: string
  hintHard: string
}

const CATEGORIES = [
  { id: 'cat-animals',   name: 'Dieren',        count: 60 },
  { id: 'cat-food',      name: 'Eten & Drinken', count: 60 },
  { id: 'cat-countries', name: 'Landen',         count: 50 },
  { id: 'cat-sports',    name: 'Sport',          count: 50 },
  { id: 'cat-objects',   name: 'Voorwerpen',     count: 60 },
  { id: 'cat-jobs',      name: 'Beroepen',       count: 50, create: true, icon: '👷' },
  { id: 'cat-music',     name: 'Muziek',         count: 40, create: true, icon: '🎵' },
  { id: 'cat-nature',    name: 'Natuur',         count: 40, create: true, icon: '🌿' },
]

async function generateForCategory(
  categoryId: string,
  categoryName: string,
  count: number
): Promise<GeneratedWord[]> {
  const existing = await prisma.word.findMany({
    where: { categoryId },
    select: { word: true },
  })
  const existingWords = existing.map((w) => w.word).join(', ')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Je bent een assistent die woorden genereert voor een gezelschapsspel "Imposter" voor families met kinderen.
De imposter ziet ALLEEN een hint (1 woord) in plaats van het echte woord.

Genereer ${count} unieke woorden voor categorie "${categoryName}" in het Nederlands.

Regels:
- Bekende woorden voor kinderen ÉN volwassenen
- Hints zijn PRECIES 1 Nederlands woord
- hintEasy: direct kenmerk of nauw verwant woord (imposter kan het bijna raden)
- hintMedium: vager, categorie of eigenschap op afstand
- hintHard: abstract of ver verband (moeilijk te raden)
- Geen duplicaten met: ${existingWords || 'geen bestaande woorden'}

Antwoord ALLEEN met een JSON array:
[
  { "word": "Olifant", "hintEasy": "Slurf", "hintMedium": "Afrika", "hintHard": "Ivoor" },
  { "word": "Pizza", "hintEasy": "Tomaat", "hintMedium": "Italië", "hintHard": "Napels" }
]`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error(`Geen JSON voor categorie ${categoryName}`)
  return JSON.parse(jsonMatch[0])
}

async function main() {
  console.log('🤖 Woorden genereren via Claude...\n')

  let total = 0

  for (const cat of CATEGORIES) {
    // Maak categorie aan als die nog niet bestaat
    if (cat.create) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon ?? '📁',
          isDefault: true,
        },
      })
      console.log(`✅ Categorie aangemaakt: ${cat.name}`)
    }

    console.log(`⏳ Genereren: ${cat.name} (${cat.count} woorden)...`)

    try {
      const words = await generateForCategory(cat.id, cat.name, cat.count)

      await Promise.all(
        words.map((w) =>
          prisma.word.upsert({
            where: { id: `${cat.id}-${w.word.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
              id: `${cat.id}-${w.word.toLowerCase().replace(/\s+/g, '-')}`,
              categoryId: cat.id,
              word: w.word,
              hintEasy: w.hintEasy,
              hintMedium: w.hintMedium,
              hintHard: w.hintHard,
            },
          })
        )
      )

      console.log(`✅ ${cat.name}: ${words.length} woorden opgeslagen`)
      total += words.length
    } catch (err) {
      console.error(`❌ Fout bij ${cat.name}:`, err)
    }

    // Kleine pauze tussen API calls
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log(`\n🎉 Klaar! ${total} woorden gegenereerd en opgeslagen.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
