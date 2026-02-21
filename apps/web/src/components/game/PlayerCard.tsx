import { motion } from 'framer-motion'
import type { GamePlayer } from '@imposter-game/shared'
import { getAvatarById } from '@/lib/avatars'

interface PlayerCardProps {
  player: GamePlayer
  onRemove?: () => void
  onTap?: () => void
  showViewedState?: boolean
  isCurrentPlayer?: boolean
}

export function PlayerCard({
  player,
  onRemove,
  onTap,
  showViewedState = false,
  isCurrentPlayer = false,
}: PlayerCardProps) {
  const avatar = getAvatarById(player.avatarId)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={onTap ? { scale: 0.95 } : undefined}
      onClick={onTap}
      className={`
        relative bg-slate-800 rounded-xl p-4
        flex flex-col items-center
        ${onTap ? 'cursor-pointer active:bg-slate-700' : ''}
        ${isCurrentPlayer ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700 hover:bg-red-500 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
      )}

      {/* Avatar */}
      <div className="relative">
        <div
          className={`
            w-16 h-16 rounded-full
            flex items-center justify-center text-3xl
            ${showViewedState
              ? player.hasViewed
                ? 'bg-green-500/20'
                : 'bg-slate-700'
              : 'bg-slate-700'
            }
          `}
        >
          {avatar?.emoji || '🎭'}
        </div>

        {/* Viewed indicator */}
        {showViewedState && (
          <div
            className={`
              absolute -top-1 -right-1
              w-6 h-6 rounded-full
              flex items-center justify-center text-sm
              ${player.hasViewed ? 'bg-green-500' : 'bg-slate-600'}
            `}
          >
            {player.hasViewed ? '👀' : '😴'}
          </div>
        )}
      </div>

      {/* Name */}
      <p className="mt-2 text-white font-medium text-center truncate w-full">
        {player.name}
      </p>

      {/* Host badge */}
      {player.isHost && (
        <span className="text-xs text-primary-400 mt-1">Host</span>
      )}

      {/* Tap instruction */}
      {onTap && !player.hasViewed && showViewedState && (
        <span className="text-xs text-slate-400 mt-1">Tik om te bekijken</span>
      )}
    </motion.div>
  )
}
