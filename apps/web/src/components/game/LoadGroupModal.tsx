import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { groupsApi, type ApiGroup } from '@/lib/api'
import { getAvatarById } from '@/lib/avatars'

interface LoadGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (group: ApiGroup) => void
}

export function LoadGroupModal({ isOpen, onClose, onLoad }: LoadGroupModalProps) {
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) fetchGroups()
  }, [isOpen])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const data = await groupsApi.getAll()
      setGroups(data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await groupsApi.delete(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📂 Groep laden">
      <div className="space-y-3">
        {loading && (
          <p className="text-slate-400 text-center py-6">Laden...</p>
        )}

        {!loading && groups.length === 0 && (
          <p className="text-slate-400 text-center py-6">
            Nog geen groepen opgeslagen.
          </p>
        )}

        {!loading && groups.map((group) => (
          <div
            key={group.id}
            onClick={() => { onLoad(group); onClose() }}
            className="w-full text-left bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-xl p-4 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white mb-2">{group.name}</p>
                <div className="flex flex-wrap gap-1">
                  {group.players.map((p) => {
                    const avatar = getAvatarById(p.avatarId)
                    return (
                      <span
                        key={p.id}
                        className="flex items-center gap-1 bg-slate-600 rounded-full px-2 py-0.5 text-xs text-slate-200"
                      >
                        <span>{avatar?.emoji ?? '🎭'}</span>
                        <span>{p.name}</span>
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(group.id, e)}
                disabled={deleting === group.id}
                className="ml-3 p-2 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                aria-label="Groep verwijderen"
              >
                {deleting === group.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        ))}

        <Button variant="secondary" fullWidth onClick={onClose} className="mt-2">
          Sluiten
        </Button>
      </div>
    </Modal>
  )
}
