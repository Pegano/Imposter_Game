import { motion } from 'framer-motion'
import { AVATAR_PRESETS } from '@/lib/avatars'
import { Button } from '@/components/ui/Button'

interface AvatarSelectorProps {
  selected: string
  onSelect: (id: string) => void
  onClose: () => void
}

export function AvatarSelector({ selected, onSelect, onClose }: AvatarSelectorProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      {/* Selector */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-slate-800 rounded-t-3xl p-6 safe-area-bottom"
      >
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Kies je avatar
        </h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {AVATAR_PRESETS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`
                aspect-square rounded-xl
                flex flex-col items-center justify-center
                transition-all duration-200
                ${
                  selected === avatar.id
                    ? 'bg-primary-500 ring-2 ring-primary-300'
                    : 'bg-slate-700 hover:bg-slate-600'
                }
              `}
            >
              <span className="text-3xl">{avatar.emoji}</span>
              <span className="text-xs text-slate-300 mt-1">{avatar.name}</span>
            </button>
          ))}
        </div>

        <Button variant="ghost" fullWidth onClick={onClose}>
          Annuleren
        </Button>
      </motion.div>
    </>
  )
}
