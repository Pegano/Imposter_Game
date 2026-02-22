import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAvatarById } from '@/lib/avatars'
import type { StatsResponse, PlayerStat, GameResultSummary } from '@imposter-game/shared'

const RANK_MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return `Vandaag ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

function LeaderboardRow({ player, rank }: { player: PlayerStat; rank: number }) {
  const avatar = getAvatarById(player.avatarId)
  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: rank * 0.06 }}
      className={`flex items-center gap-3 p-3 rounded-xl
        ${rank === 0 ? 'bg-yellow-500/10 border border-yellow-500/40' : 'bg-slate-800'}`}
    >
      <span className="text-xl w-8 text-center shrink-0">
        {RANK_MEDAL[rank] ?? `${rank + 1}`}
      </span>
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl shrink-0">
        {avatar?.emoji ?? '🎭'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{player.playerName}</p>
        <p className="text-slate-500 text-xs">{player.gamesPlayed} spellen · {player.wins} gewonnen</p>
      </div>
      <p className={`text-sm font-bold shrink-0 ${player.totalScore > 0 ? 'text-green-400' : player.totalScore < 0 ? 'text-red-400' : 'text-slate-400'}`}>
        {player.totalScore > 0 ? '+' : ''}{player.totalScore}
      </p>
    </motion.div>
  )
}

function RecentGameCard({ game, index }: { game: GameResultSummary; index: number }) {
  const winner = game.playerResults.find((p) => p.isWinner)
  const winnerAvatar = winner ? getAvatarById(winner.avatarId) : null

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-800 rounded-xl p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-xs">{formatDate(game.createdAt)}</span>
        <span className="text-slate-500 text-xs">{game.playerCount} spelers · {game.roundsPlayed} {game.roundsPlayed === 1 ? 'ronde' : 'rondes'}</span>
      </div>
      {winner && (
        <div className="flex items-center gap-2">
          <span className="text-base">{winnerAvatar?.emoji ?? '🎭'}</span>
          <span className="text-white text-sm font-medium">{winner.playerName}</span>
          <span className="text-yellow-400 text-xs ml-auto">🏆 +{winner.score}p</span>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {game.playerResults.filter((p) => !p.isWinner).map((p) => {
          const av = getAvatarById(p.avatarId)
          return (
            <span key={p.playerName} className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded-full text-xs">
              <span>{av?.emoji ?? '🎭'}</span>
              <span className="text-slate-300">{p.playerName}</span>
              <span className={p.score > 0 ? 'text-green-400' : p.score < 0 ? 'text-red-400' : 'text-slate-500'}>
                {p.score > 0 ? '+' : ''}{p.score}
              </span>
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}

export function Stats() {
  const navigate = useNavigate()
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d: StatsResponse) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Kon statistieken niet laden')
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-1 -ml-1 transition-colors">
          ← Terug
        </button>
        <h1 className="text-xl font-semibold text-white">Statistieken</h1>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Laden...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="flex-1 overflow-auto space-y-6 min-h-0">
          {/* Leaderboard */}
          <section>
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Topspelers
            </h2>
            {data.leaderboard.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">Nog geen wedstrijden gespeeld</p>
            ) : (
              <div className="space-y-2">
                {data.leaderboard.map((player, i) => (
                  <LeaderboardRow key={`${player.playerName}-${player.avatarId}`} player={player} rank={i} />
                ))}
              </div>
            )}
          </section>

          {/* Recent games */}
          {data.recentGames.length > 0 && (
            <section>
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Recente wedstrijden
              </h2>
              <div className="space-y-2">
                {data.recentGames.map((game, i) => (
                  <RecentGameCard key={game.id} game={game} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
