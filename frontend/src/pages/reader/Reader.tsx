import { useState } from 'react'
import { analyzeQuery } from '../../services/api'

interface Article {
  source: string
  title: string
  summary: string
  url: string
  publishedAt: string
  image?: string
  analysis?: {
    bias: string
    biasScore: number
    tone: string
    toneScore: number
    framing: string
    keyVerbs: string[]
    tags: string[]
    opinionVsFact: number
    summary: string
  }
}

const BiasBar = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score < 30) return 'bg-blue-500'
    if (score < 45) return 'bg-blue-300'
    if (score < 55) return 'bg-gray-400'
    if (score < 70) return 'bg-red-300'
    return 'bg-red-500'
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full relative">
        <div
          className={`absolute top-0 h-2 w-2 rounded-full ${getColor(score)} -translate-x-1/2`}
          style={{ left: `${score}%` }}
        />
      </div>
    </div>
  )
}

const ArticleCard = ({ article }: { article: Article }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden flex flex-col">
      {article.image && (
        <img src={article.image} alt="" className="w-full h-40 object-cover" />
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {article.source}
          </span>
          {article.analysis && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
              {article.analysis.bias}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold leading-snug">{article.title}</h3>

        {article.analysis ? (
          <>
            <p className="text-xs text-gray-400 leading-relaxed">
              {article.analysis.summary}
            </p>

            <BiasBar score={article.analysis.biasScore} />

            <div className="flex gap-2 flex-wrap">
              {article.analysis.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900 rounded p-2">
                <div className="text-gray-500 mb-1">Tone</div>
                <div className="text-white">{article.analysis.tone}</div>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <div className="text-gray-500 mb-1">Opinion %</div>
                <div className="text-white">{article.analysis.opinionVsFact}%</div>
              </div>
            </div>

            {expanded && (
              <div className="text-xs text-gray-400 border-t border-gray-800 pt-3">
                <div className="mb-2">
                  <span className="text-gray-500">Framing: </span>
                  {article.analysis.framing}
                </div>
                <div>
                  <span className="text-gray-500">Key verbs: </span>
                  {article.analysis.keyVerbs.join(', ')}
                </div>
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-500 hover:text-white transition-colors text-left"
            >
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-400 leading-relaxed">{article.summary}</p>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-white transition-colors mt-auto"
        >
          Read original article
        </a>
      </div>
    </div>
  )
}

const Reader = () => {
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const res = await analyzeQuery(query)
      setArticles(res.data.articles)
    } catch (err) {
      setError('Failed to fetch articles. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Side-by-Side Reader</h1>
        <p className="text-gray-400">Search any topic and see how different outlets frame the same story.</p>
      </div>

      <div className="flex gap-3 mb-10">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Gaza, Ukraine, Climate Change..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-6">{error}</div>
      )}

      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">⚙️</div>
          <p>Fetching articles and running AI analysis...</p>
          <p className="text-sm text-gray-600 mt-2">This may take 15-30 seconds</p>
        </div>
      )}

      {!loading && searched && articles.length === 0 && !error && (
        <div className="text-center py-20 text-gray-500">No articles found. Try a different query.</div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <div className="text-sm text-gray-500 mb-6">
            {articles.length} articles analyzed for <span className="text-white">"{query}"</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={i} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Reader