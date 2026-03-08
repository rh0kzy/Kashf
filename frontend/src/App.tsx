import { Routes, Route } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Home from './pages/Home'
import Reader from './pages/reader/Reader'
import Detector from './pages/detector/Detector'
import ConflictMap from './pages/map/ConflictMap'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reader" element={<Reader />} />
        <Route path="/detector" element={<Detector />} />
        <Route path="/map" element={<ConflictMap />} />
      </Routes>
    </div>
  )
}

export default App