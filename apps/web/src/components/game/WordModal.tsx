import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ApiWord } from '@/lib/api'

interface WordModalProps {
  isOpen: boolean
  word?: ApiWord | null       // null = toevoegen, ApiWord = bewerken
  categoryName: string
  onClose: () => void
  onSave: (data: { word: string; hintEasy: string; hintMedium: string; hintHard: string }) => Promise<void>
}

const EMPTY = { word: '', hintEasy: '', hintMedium: '', hintHard: '' }

export function WordModal({ isOpen, word, categoryName, onClose, onSave }: WordModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      setForm(
        word
          ? { word: word.word, hintEasy: word.hintEasy, hintMedium: word.hintMedium, hintHard: word.hintHard }
          : EMPTY
      )
      setError('')
    }
  }, [isOpen, word])

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const isValid = form.word.trim() && form.hintEasy.trim() && form.hintMedium.trim() && form.hintHard.trim()

  const handleSave = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      await onSave({
        word: form.word.trim(),
        hintEasy: form.hintEasy.trim(),
        hintMedium: form.hintMedium.trim(),
        hintHard: form.hintHard.trim(),
      })
      onClose()
    } catch {
      setError('Opslaan mislukt, probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={word ? `✏️ Woord bewerken` : `➕ Woord toevoegen`}
    >
      <div className="space-y-4">
        <p className="text-slate-400 text-sm">Categorie: <span className="text-white">{categoryName}</span></p>

        {/* Word */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Woord</label>
          <Input value={form.word} onChange={set('word')} placeholder="bijv. Pizza" autoFocus />
        </div>

        {/* Hints */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400 font-medium">Hints voor de imposter</p>

          <div>
            <label className="flex items-center gap-2 text-sm mb-1">
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Makkelijk</span>
              <span className="text-slate-500">1 woord — duidelijk gerelateerd</span>
            </label>
            <Input
              value={form.hintEasy}
              onChange={set('hintEasy')}
              placeholder="bijv. Tomaat"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-1">
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">Gemiddeld</span>
              <span className="text-slate-500">1 woord — vager verband</span>
            </label>
            <Input
              value={form.hintMedium}
              onChange={set('hintMedium')}
              placeholder="bijv. Italië"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-1">
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Moeilijk</span>
              <span className="text-slate-500">1 woord — abstract / ver verband</span>
            </label>
            <Input
              value={form.hintHard}
              onChange={set('hintHard')}
              placeholder="bijv. Napels"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Annuleren
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave} disabled={!isValid || loading}>
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
