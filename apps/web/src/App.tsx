import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Lobby } from './pages/Lobby'
import { Join } from './pages/Join'
import { Game } from './pages/Game'
import { Settings } from './pages/Settings'
import { Words } from './pages/Words'

function App() {
  return (
    <div className="flex flex-col min-h-screen safe-area-top safe-area-bottom">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/join" element={<Join />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/game" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/words" element={<Words />} />
      </Routes>
    </div>
  )
}

export default App
