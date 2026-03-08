import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
      <h1 className="text-6xl font-bold tracking-widest mb-4">KASHF</h1>
      <p className="text-gray-400 text-lg mb-12 max-w-xl">
        Uncover the truth. Compare how the world's media covers the same story.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link to="/reader" className="border border-gray-700 rounded-lg p-6 hover:border-white transition-colors">
          <h2 className="text-xl font-semibold mb-2">📰 Side-by-Side Reader</h2>
          <p className="text-gray-400 text-sm">Same story, different narratives. Compare coverage across global outlets.</p>
        </Link>
        <Link to="/detector" className="border border-gray-700 rounded-lg p-6 hover:border-white transition-colors">
          <h2 className="text-xl font-semibold mb-2">🔍 Fake News Detector</h2>
          <p className="text-gray-400 text-sm">Paste any article. Get a credibility score and bias analysis.</p>
        </Link>
        <Link to="/map" className="border border-gray-700 rounded-lg p-6 hover:border-white transition-colors">
          <h2 className="text-xl font-semibold mb-2">🌍 Conflict Map</h2>
          <p className="text-gray-400 text-sm">Live conflict zones with news feeds and casualty data.</p>
        </Link>
      </div>
    </div>
  )
}

export default Home