import { useEffect, useState } from 'react'
import { groupsApi, type ApiGroup, type ApiPlayer } from '@/lib/api'
import { getAvatarById, AVATAR_PRESETS } from '@/lib/avatars'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GroupManager() {
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Rename state per group
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Add player state per group
  const [addingToId, setAddingToId] = useState<string | null>(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerAvatar, setNewPlayerAvatar] = useState(AVATAR_PRESETS[0].id)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      setGroups(await groupsApi.getAll())
    } finally {
      setLoading(false)
    }
  }

  // ── Rename ─────────────────────────────────────────────────
  const startRename = (group: ApiGroup) => {
    setEditingId(group.id)
    setEditingName(group.name)
  }

  const confirmRename = async (id: string) => {
    if (!editingName.trim()) return
    try {
      const updated = await groupsApi.rename(id, editingName.trim())
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    } finally {
      setEditingId(null)
    }
  }

  // ── Delete group ───────────────────────────────────────────
  const deleteGroup = async (id: string) => {
    await groupsApi.delete(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  // ── Add player ─────────────────────────────────────────────
  const startAddPlayer = (groupId: string) => {
    setAddingToId(groupId)
    setNewPlayerName('')
    setNewPlayerAvatar(AVATAR_PRESETS[0].id)
  }

  const confirmAddPlayer = async (groupId: string) => {
    if (!newPlayerName.trim()) return
    const player = await groupsApi.addPlayer(groupId, newPlayerName.trim(), newPlayerAvatar)
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, players: [...g.players, player] } : g))
    )
    setAddingToId(null)
  }

  // ── Remove player ──────────────────────────────────────────
  const removePlayer = async (groupId: string, player: ApiPlayer) => {
    await groupsApi.removePlayer(groupId, player.id)
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, players: g.players.filter((p) => p.id !== player.id) } : g
      )
    )
  }

  if (loading) {
    return <p className="text-slate-400 text-sm text-center py-6">Laden...</p>
  }

  if (groups.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-6">
        Nog geen groepen opgeslagen. Maak een groep aan via het spelerscherm.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = expandedId === group.id
        const isEditing = editingId === group.id
        const isAddingPlayer = addingToId === group.id

        return (
          <div key={group.id} className="bg-slate-700 rounded-xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-2 p-3">
              {isEditing ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmRename(group.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                  className="flex-1 text-left"
                >
                  <span className="font-semibold text-white">{group.name}</span>
                  <span className="text-slate-400 text-sm ml-2">
                    ({group.players.length} spelers)
                  </span>
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => confirmRename(group.id)}
                      className="text-green-400 hover:text-green-300 px-2 py-1 text-sm"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-300 px-2 py-1 text-sm"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startRename(group)}
                      className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                      title="Naam wijzigen"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="text-slate-400 hover:text-red-400 px-2 py-1 text-sm transition-colors"
                      title="Groep verwijderen"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : group.id)}
                      className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Expanded: player list */}
            {isExpanded && (
              <div className="border-t border-slate-600 px-3 pb-3 pt-2 space-y-2">
                {group.players.map((player) => {
                  const avatar = getAvatarById(player.avatarId)
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-600 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{avatar?.emoji ?? '🎭'}</span>
                        <span className="text-white text-sm">{player.name}</span>
                      </div>
                      <button
                        onClick={() => removePlayer(group.id, player)}
                        className="text-slate-400 hover:text-red-400 transition-colors text-sm px-1"
                        title="Speler verwijderen"
                      >
                        🗑️
                      </button>
                    </div>
                  )
                })}

                {/* Add player form */}
                {isAddingPlayer ? (
                  <div className="space-y-2 pt-1">
                    {/* Avatar picker */}
                    <div className="flex gap-1 flex-wrap">
                      {AVATAR_PRESETS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setNewPlayerAvatar(a.id)}
                          className={`text-xl p-1 rounded-lg transition-colors ${
                            newPlayerAvatar === a.id
                              ? 'bg-primary-500'
                              : 'bg-slate-600 hover:bg-slate-500'
                          }`}
                          title={a.name}
                        >
                          {a.emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmAddPlayer(group.id)
                          if (e.key === 'Escape') setAddingToId(null)
                        }}
                        placeholder="Naam speler..."
                        className="flex-1 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => confirmAddPlayer(group.id)}
                        disabled={!newPlayerName.trim()}
                      >
                        +
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingToId(null)}>
                        ✕
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAddPlayer(group.id)}
                    className="w-full text-center text-slate-400 hover:text-primary-400 text-sm py-1 transition-colors"
                  >
                    + Speler toevoegen
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
