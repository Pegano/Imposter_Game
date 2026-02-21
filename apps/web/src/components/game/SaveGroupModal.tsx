import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { groupsApi } from '@/lib/api'
import type { GamePlayer } from '@imposter-game/shared'
import { getAvatarById } from '@/lib/avatars'

interface SaveGroupModalProps {
  isOpen: boolean
  players: GamePlayer[]
  onClose: () => void
  onSaved: (groupName: string) => void
}

export function SaveGroupModal({ isOpen, players, onClose, onSaved }: SaveGroupModalProps) {
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    setError('')
    try {
      await groupsApi.create(
        groupName.trim(),
        players.map((p) => ({ name: p.name, avatarId: p.avatarId }))
      )
      onSaved(groupName.trim())
      setGroupName('')
      onClose()
    } catch (e) {
      setError('Opslaan mislukt, probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💾 Groep opslaan">
      <div className="space-y-4">
        {/* Player preview */}
        <div className="flex flex-wrap gap-2 mb-2">
          {players.map((p) => {
            const avatar = getAvatarById(p.avatarId)
            return (
              <div key={p.id} className="flex items-center gap-1 bg-slate-700 rounded-full px-3 py-1">
                <span className="text-lg">{avatar?.emoji}</span>
                <span className="text-sm text-white">{p.name}</span>
              </div>
            )
          })}
        </div>

        {/* Group name input */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Groepsnaam</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="bijv. Familie, Vrienden..."
            autoFocus
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Annuleren
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={!groupName.trim() || loading}
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
