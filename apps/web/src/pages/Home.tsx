import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center overflow-hidden">

      {/* Hero section */}
      <motion.div
        className="mb-10 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow behind logo */}
        <div className="absolute inset-0 rounded-full blur-3xl opacity-30 bg-violet-600 scale-75 translate-y-4" />

        {/* Logo image */}
        <motion.img
          src="/logo.png"
          alt="Imposter"
          className="relative w-44 h-44 object-contain mx-auto drop-shadow-2xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Title */}
        <h1
          className="text-5xl font-black uppercase tracking-widest mt-4 mb-1"
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          IMPOSTER
        </h1>
        <p className="text-slate-400 text-sm tracking-wide">
          Het party spel voor families
        </p>
      </motion.div>

      {/* Main actions */}
      <motion.div
        className="w-full max-w-xs space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <Link to="/lobby" className="block" onClick={() => localStorage.removeItem('imposter_session')}>
          <Button variant="primary" size="lg" fullWidth>
            Nieuw Spel
          </Button>
        </Link>

        <Link to="/join" className="block" onClick={() => localStorage.removeItem('imposter_session')}>
          <Button variant="secondary" size="lg" fullWidth>
            Deelnemen
          </Button>
        </Link>
      </motion.div>

      {/* Secondary actions */}
      <motion.div
        className="flex flex-wrap gap-3 mt-10 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link to="/stats">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">📊</span>
            Statistieken
          </Button>
        </Link>

        <Link to="/settings">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">⚙️</span>
            Instellingen
          </Button>
        </Link>

        <Link to="/words">
          <Button variant="ghost" size="md">
            <span className="text-xl mr-2">📚</span>
            Woorden
          </Button>
        </Link>
      </motion.div>

      {/* Version */}
      <p className="text-slate-700 text-xs mt-auto pt-8">v1.0.0</p>
    </div>
  )
}
