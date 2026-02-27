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
        className="fixed inset-0 bg-black/70 z-40"
      />

      {/* Selector */}
      <motion.div
        initial={{ opacity: 0, y: 120 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 120 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 safe-area-bottom"
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <h2 className="text-xl font-semibold text-white text-center mb-5">
          Kies je karakter
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATAR_PRESETS.map((avatar) => {
            const isSelected = selected === avatar.id
            return (
              <motion.button
                key={avatar.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelect(avatar.id)}
                className={`
                  relative aspect-square rounded-xl overflow-hidden
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isSelected ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'}
                `}
                style={{
                  background: `linear-gradient(155deg, ${avatar.colors[0]}, ${avatar.colors[1]})`,
                }}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                )}
                {avatar.imageNotViewed.endsWith('.png') ? (
                  <>
                    <img
                      src={avatar.imageNotViewed}
                      alt={avatar.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-white font-medium drop-shadow z-10">{avatar.name}</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl drop-shadow-lg">{avatar.emoji}</span>
                    <span className="text-xs text-white/90 font-medium mt-1 drop-shadow">{avatar.name}</span>
                  </>
                )}
              </motion.button>
            )
          })}
        </div>

        <Button variant="ghost" fullWidth onClick={onClose}>
          Annuleren
        </Button>
      </motion.div>
    </>
  )
}
