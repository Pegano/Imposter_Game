import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useGameStore } from '@/stores/gameStore'
import { getAvatarById } from '@/lib/avatars'
import { socket } from '@/lib/socket'

export function GameDiscussion() {
  const { players, settings, setGameState, isMultiDevice, myPlayerId, timerRemaining } = useGameStore()

  const myPlayer = players.find((p) => p.id === myPlayerId)
  const amIHost = myPlayer?.isHost ?? false

  // Pick a random starting player once on mount
  const starter = useMemo(
    () => players[Math.floor(Math.random() * players.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // ── Single-device local timer ─────────────────────────────────
  const [timeRemaining, setTimeRemaining] = useState(settings.timerSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isMultiDevice) return // server handles timer
    if (!settings.timerEnabled || isPaused || timeRemaining <= 0) return
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [settings.timerEnabled, isPaused, timeRemaining, isMultiDevice])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // Use server time in multi-device mode, local time otherwise
  const displayTime = isMultiDevice ? timerRemaining : timeRemaining

  const timerColor =
    displayTime > 30 ? 'text-white' : displayTime > 10 ? 'text-yellow-400' : 'text-red-400'
  const timerBorder =
    displayTime > 30 ? 'border-slate-600' : displayTime > 10 ? 'border-yellow-500' : 'border-red-500'

  return (
    <div className="flex flex-col flex-1 p-4">

      {/* Timer */}
      {settings.timerEnabled && (
        <div className="flex flex-col items-center mb-8">
          <div
            className={`
              inline-flex items-center justify-center
              w-32 h-32 rounded-full border-4
              ${timerBorder} ${displayTime <= 10 ? 'animate-pulse' : ''}
            `}
          >
            <span className={`text-4xl font-mono font-bold ${timerColor}`}>
              {formatTime(displayTime)}
            </span>
          </div>

          {/* Pause button: host in multi-device, everyone in single-device */}
          {(!isMultiDevice || amIHost) && (
            <button
              onClick={() => {
                if (isMultiDevice) {
                  socket.emit('toggle_timer_pause')
                } else {
                  setIsPaused((p) => !p)
                }
              }}
              className="mt-3 text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isPaused ? '▶️ Verder' : '⏸️ Pauze'}
            </button>
          )}
          {isMultiDevice && !amIHost && (
            <p className="mt-3 text-slate-500 text-xs">Timer wordt beheerd door de host</p>
          )}
        </div>
      )}

      {/* Starter card */}
      {starter && (
        <div className="bg-primary-500/10 border border-primary-500/40 rounded-2xl p-6 mb-6 text-center">
          <p className="text-slate-400 text-sm mb-4">Begint met beschrijven:</p>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-4xl">
              {getAvatarById(starter.avatarId)?.emoji ?? '🎭'}
            </div>
            <p className="text-white text-2xl font-bold">{starter.name}</p>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Daarna om de beurt met de klok mee
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="flex-1 text-center">
        <p className="text-slate-400">
          Beschrijf het woord <span className="text-primary-400 font-semibold">zonder het te noemen</span>
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Na 2 rondes: wijs de imposter aan
        </p>
        {isMultiDevice && !amIHost && (
          <p className="text-slate-500 text-sm mt-4">De host kan de imposter onthullen</p>
        )}
      </div>

      {/* Reveal button: host in multi-device, everyone in single-device */}
      {(!isMultiDevice || amIHost) && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            if (isMultiDevice) {
              socket.emit('reveal')
            } else {
              setGameState('reveal')
            }
          }}
        >
          🎭 Onthul Imposter
        </Button>
      )}
    </div>
  )
}
