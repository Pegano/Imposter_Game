import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home } from './pages/Home'
import { Lobby } from './pages/Lobby'
import { Join } from './pages/Join'
import { Game } from './pages/Game'
import { Settings } from './pages/Settings'
import { Words } from './pages/Words'
import { Stats } from './pages/Stats'
import { useGameSocket } from './hooks/useGameSocket'
import { UpdateBanner } from './components/UpdateBanner'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/join" element={<Join />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="/game" element={<Game />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/words" element={<Words />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  useGameSocket()

  return (
    <div className="flex flex-col min-h-screen safe-area-top safe-area-bottom">
      <AnimatedRoutes />
      <UpdateBanner />
    </div>
  )
}

export default App
