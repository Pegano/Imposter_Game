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
  const [colorFrom, colorTo] = avatar?.colors ?? ['#6D28D9', '#4338CA']
  const hasViewed = showViewedState && player.hasViewed

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      whileTap={onTap ? { scale: 0.94 } : undefined}
      onClick={onTap}
      className={`
        relative rounded-2xl overflow-hidden aspect-[3/4] select-none
        ${onTap ? 'cursor-pointer' : ''}
        ${isCurrentPlayer ? 'ring-2 ring-white/60' : ''}
      `}
      style={{
        background: `linear-gradient(155deg, ${colorFrom} 0%, ${colorTo} 100%)`,
        boxShadow: `0 8px 32px ${colorFrom}40`,
      }}
    >
      {/* Decorative light blobs */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 blur-2xl"
        style={{ background: colorFrom }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-20 blur-xl"
        style={{ background: colorTo }}
      />

      {/* Viewed overlay */}
      {hasViewed && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
          <span className="text-4xl mb-1">👀</span>
          <span className="text-white/60 text-xs">Bekeken</span>
        </div>
      )}

      {/* Tap-to-view hint */}
      {showViewedState && !hasViewed && onTap && (
        <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-12 z-10 pointer-events-none">
          <span className="text-white/70 text-xs bg-black/40 px-2 py-0.5 rounded-full">
            Tik om te bekijken
          </span>
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 flex items-center justify-center text-sm text-white transition-colors"
        >
          ✕
        </button>
      )}

      {/* Main avatar — fills the card */}
      {avatar && (hasViewed ? avatar.imageViewed : avatar.imageNotViewed)?.endsWith('.png') ? (
        <img
          src={hasViewed ? avatar.imageViewed : avatar.imageNotViewed}
          alt={avatar.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pb-8">
          <span className="text-7xl drop-shadow-2xl leading-none">
            {avatar?.emoji ?? '🎭'}
          </span>
        </div>
      )}

      {/* Name band at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-2">
        <p className="text-white font-semibold text-sm text-center truncate leading-tight">
          {player.name}
        </p>
        {player.isHost && (
          <p className="text-yellow-300 text-xs text-center leading-tight">Host</p>
        )}
      </div>
    </motion.div>
  )
}
