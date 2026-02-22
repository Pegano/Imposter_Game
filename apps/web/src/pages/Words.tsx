import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WordModal } from '@/components/game/WordModal'
import { categoriesApi, wordsApi, generateApi, type ApiCategory, type ApiWord } from '@/lib/api'

// ─── Emoji picker voor categorieën ───────────────────────────
const CATEGORY_ICONS = ['🐾', '🍕', '🌍', '⚽', '🎬', '🎵', '🏠', '🚗', '🌿', '🧠', '🛠️', '👗', '🎮', '📚', '🧁']

export function Words() {
  // ── Categories state ──────────────────────────────────────
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  // ── Selected category (words view) ───────────────────────
  const [selectedCat, setSelectedCat] = useState<ApiCategory | null>(null)
  const [words, setWords] = useState<ApiWord[]>([])
  const [loadingWords, setLoadingWords] = useState(false)

  // ── Add category form ─────────────────────────────────────
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState(CATEGORY_ICONS[0])
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [savingCat, setSavingCat] = useState(false)

  // ── Edit category inline ──────────────────────────────────
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState('')

  // ── Word modal ────────────────────────────────────────────
  const [wordModalOpen, setWordModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<ApiWord | null>(null)

  // ── AI generatie ──────────────────────────────────────────
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  // ── Load categories on mount ──────────────────────────────
  useEffect(() => {
    fetchCategories()
  }, [])

  // ── Load words when category selected ────────────────────
  useEffect(() => {
    if (!selectedCat) return
    setLoadingWords(true)
    wordsApi.getByCategory(selectedCat.id)
      .then(setWords)
      .finally(() => setLoadingWords(false))
  }, [selectedCat])

  const fetchCategories = async () => {
    setLoadingCats(true)
    try {
      setCategories(await categoriesApi.getAll())
    } finally {
      setLoadingCats(false)
    }
  }

  // ── Category actions ──────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    try {
      const cat = await categoriesApi.create(newCatName.trim(), newCatIcon)
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCatName('')
    } finally {
      setSavingCat(false)
    }
  }

  const handleRenameCategory = async (id: string) => {
    if (!editingCatName.trim()) return
    const cat = await categoriesApi.update(id, editingCatName.trim(),
      categories.find((c) => c.id === id)?.icon ?? undefined)
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: cat.name } : c)))
    setEditingCatId(null)
  }

  const handleDeleteCategory = async (cat: ApiCategory) => {
    if (cat.isDefault) return
    await categoriesApi.delete(cat.id)
    setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    if (selectedCat?.id === cat.id) setSelectedCat(null)
  }

  // ── Word actions ──────────────────────────────────────────
  const handleSaveWord = async (data: { word: string; hintEasy: string; hintMedium: string; hintHard: string }) => {
    if (!selectedCat) return
    if (editingWord) {
      const updated = await wordsApi.update(editingWord.id, data)
      setWords((prev) => prev.map((w) => (w.id === editingWord.id ? updated : w)))
      // Update word count stays same
    } else {
      const created = await wordsApi.create({ categoryId: selectedCat.id, ...data })
      setWords((prev) => [...prev, created].sort((a, b) => a.word.localeCompare(b.word)))
      setCategories((prev) =>
        prev.map((c) => c.id === selectedCat.id ? { ...c, wordCount: c.wordCount + 1 } : c)
      )
    }
    setEditingWord(null)
  }

  const handleDeleteWord = async (word: ApiWord) => {
    await wordsApi.delete(word.id)
    setWords((prev) => prev.filter((w) => w.id !== word.id))
    setCategories((prev) =>
      prev.map((c) => c.id === selectedCat?.id ? { ...c, wordCount: Math.max(0, c.wordCount - 1) } : c)
    )
  }

  const openAddWord = () => { setEditingWord(null); setWordModalOpen(true) }
  const openEditWord = (word: ApiWord) => { setEditingWord(word); setWordModalOpen(true) }

  const handleGenerate = async () => {
    if (!selectedCat) return
    setGenerating(true)
    setGenerateError('')
    try {
      const newWords = await generateApi.words(selectedCat.id, selectedCat.name, 20)
      setWords((prev) => [...prev, ...newWords].sort((a, b) => a.word.localeCompare(b.word)))
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCat.id ? { ...c, wordCount: c.wordCount + newWords.length } : c
        )
      )
    } catch (e: any) {
      setGenerateError(e.message ?? 'Generatie mislukt')
    } finally {
      setGenerating(false)
    }
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 p-4">

      {/* Header */}
      <div className="flex items-center mb-6">
        {selectedCat ? (
          <Button variant="ghost" size="sm" onClick={() => setSelectedCat(null)}>← Terug</Button>
        ) : (
          <Link to="/">
            <Button variant="ghost" size="sm">← Terug</Button>
          </Link>
        )}
        <h1 className="text-xl font-semibold text-white ml-4">
          {selectedCat ? selectedCat.icon + ' ' + selectedCat.name : 'Categorieën'}
        </h1>
      </div>

      <AnimatePresence mode="wait">

        {/* ── CATEGORIES VIEW ──────────────────────────────── */}
        {!selectedCat && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            {/* Add category form */}
            <div className="bg-slate-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-sm text-slate-400 font-medium">Nieuwe categorie</p>

              {/* Icon picker */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIconPicker((v) => !v)}
                  className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl hover:bg-slate-600 transition-colors"
                >
                  {newCatIcon}
                </button>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Naam categorie..."
                  className="flex-1"
                />
                <Button onClick={handleAddCategory} disabled={!newCatName.trim() || savingCat}>
                  +
                </Button>
              </div>

              {/* Icon grid */}
              {showIconPicker && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => { setNewCatIcon(icon); setShowIconPicker(false) }}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors
                        ${newCatIcon === icon ? 'bg-primary-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category list */}
            <div className="flex-1 space-y-2 overflow-auto">
              {loadingCats && <p className="text-slate-400 text-center py-8">Laden...</p>}

              {!loadingCats && categories.length === 0 && (
                <p className="text-slate-500 text-center py-8">Nog geen categorieën.</p>
              )}

              {categories.map((cat) => (
                <div key={cat.id} className="bg-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-2xl w-8 text-center">{cat.icon ?? '📁'}</span>

                    {editingCatId === cat.id ? (
                      <Input
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategory(cat.id)
                          if (e.key === 'Escape') setEditingCatId(null)
                        }}
                        className="flex-1 text-sm"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setSelectedCat(cat)}
                        className="flex-1 text-left"
                      >
                        <span className="text-white font-medium">{cat.name}</span>
                        <span className="text-slate-500 text-sm ml-2">{cat.wordCount} woorden</span>
                        {cat.isDefault && (
                          <span className="ml-2 text-xs text-slate-600">standaard</span>
                        )}
                      </button>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {editingCatId === cat.id ? (
                        <>
                          <button onClick={() => handleRenameCategory(cat.id)} className="text-green-400 px-2 py-1 text-sm">✓</button>
                          <button onClick={() => setEditingCatId(null)} className="text-slate-400 px-2 py-1 text-sm">✕</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name) }}
                            className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                            title="Naam wijzigen"
                          >
                            ✏️
                          </button>
                          {!cat.isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="text-slate-400 hover:text-red-400 px-2 py-1 text-sm transition-colors"
                              title="Verwijderen"
                            >
                              🗑️
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCat(cat)}
                            className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                          >
                            →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── WORDS VIEW ───────────────────────────────────── */}
        {selectedCat && (
          <motion.div
            key="words"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col flex-1"
          >
            {/* Add word + generate buttons */}
            <div className="flex gap-2 mb-4">
              <Button variant="primary" fullWidth onClick={openAddWord}>
                + Woord toevoegen
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? '⏳ Genereren...' : '🤖 Genereer met AI'}
              </Button>
            </div>

            {generateError && (
              <p className="text-red-400 text-sm mb-3 text-center">{generateError}</p>
            )}

            {generating && (
              <p className="text-slate-400 text-sm mb-3 text-center">
                AI genereert 20 woorden met hints... even geduld
              </p>
            )}

            {/* Words list */}
            <div className="flex-1 space-y-2 overflow-auto">
              {loadingWords && <p className="text-slate-400 text-center py-8">Laden...</p>}

              {!loadingWords && words.length === 0 && (
                <p className="text-slate-500 text-center py-8">
                  Nog geen woorden in deze categorie.
                </p>
              )}

              {words.map((word) => (
                <div key={word.id} className="bg-slate-800 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{word.word}</p>
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-xs text-slate-400">
                          <span className="text-green-400">M:</span> {word.hintEasy}
                        </p>
                        <p className="text-xs text-slate-400">
                          <span className="text-yellow-400">G:</span> {word.hintMedium}
                        </p>
                        <p className="text-xs text-slate-400">
                          <span className="text-red-400">Z:</span> {word.hintHard}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditWord(word)}
                        className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteWord(word)}
                        className="text-slate-400 hover:text-red-400 px-2 py-1 text-sm transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word modal */}
      <WordModal
        isOpen={wordModalOpen}
        word={editingWord}
        categoryName={selectedCat?.name ?? ''}
        onClose={() => { setWordModalOpen(false); setEditingWord(null) }}
        onSave={handleSaveWord}
      />
    </div>
  )
}
