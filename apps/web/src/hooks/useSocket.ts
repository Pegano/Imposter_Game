import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@imposter-game/shared'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3001'

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket: TypedSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`)
      console.error('Connection error:', err)
    })

    socket.on('error', (message) => {
      setError(message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const emit = useCallback(<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args)
    }
  }, [])

  const on = useCallback(<E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event as any, handler as (...args: unknown[]) => void)
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event as any, handler as (...args: unknown[]) => void)
      }
    }
  }, [])

  const off = useCallback(<E extends keyof ServerToClientEvents>(
    event: E,
    handler?: ServerToClientEvents[E]
  ) => {
    if (socketRef.current) {
      socketRef.current.off(event as any, handler as ((...args: unknown[]) => void) | undefined)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
  }
}
