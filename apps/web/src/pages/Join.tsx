import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Join() {
  const { code: urlCode } = useParams()
  const [code, setCode] = useState(urlCode || '')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!code.trim()) {
      setError('Voer een game code in')
      return
    }
    // TODO: Implement join game via socket
    console.log('Joining game:', code)
  }

  return (
    <div className="flex flex-col flex-1 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            ← Terug
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-white ml-4">Deelnemen</h1>
      </div>

      {/* Join Form */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xs mx-auto w-full">
        <p className="text-slate-400 mb-4 text-center">Voer de game code in:</p>

        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError('')
          }}
          placeholder="BLAUW-1234"
          className="text-center text-xl font-mono tracking-wider mb-4"
          maxLength={10}
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button variant="primary" size="lg" fullWidth onClick={handleJoin}>
          Zoeken →
        </Button>

        <div className="flex items-center w-full my-8">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="px-4 text-slate-500 text-sm">OF</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        <Button variant="secondary" size="lg" fullWidth>
          📷 Scan QR Code
        </Button>
      </div>
    </div>
  )
}
