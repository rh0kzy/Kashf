import { useState } from 'react'
import { checkArticle } from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'

interface DetectorResult {
  mistral: {
    credibilityScore: number
    manipulationLanguage: number
    emotionalLanguage: number
    opinionVsFact: number
    redFlags: string[]
    verifiedClaims: string[]
    suspiciousClaims: string[]
    verdict: string
    explanation: string
  } | null
  claimbuster: object | null
}

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`relative w-20 h-20 rounded-full border-4 ${color} flex items-center justify-center`}>
      <span className="text-2xl font-bold">{score}</span>
    </div>
    <span className="text-xs text-gray-400 text-center">{label}</span>
  </div>
)

const VerdictBadge = ({ verdict }: { verdict: string }) => {
  const colors: Record<string, string> = {
    'Credible': 'bg-green-900 text-green-300 border-green-700',
    'Likely Credible': 'bg-green-900/50 text-green-400 border-green-800',
    'Uncertain': 'bg-yellow-900 text-yellow-300 border-yellow-700',
    'Likely Misleading': 'bg-red-900/50 text-red-400 border-red-800',
    'Misleading': 'bg-red-900 text-red-300 border-red-700',
  }

  return (
    <span className={`px-4 py-2 rounded-full border text-sm font-semibold ${colors[verdict] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
      {verdict}
    </span>
  )
}

const Detector = () => {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState<DetectorResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await checkArticle({ title, source, content })
      setResult(res.data)
    } catch (err) {
      setError('Failed to analyze article. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Fake News Detector</h1>
        <p className="text-gray-400">Paste an article to get a credibility score, bias analysis, and fact-check breakdown.</p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Article title (optional)"
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
          />
          <input
            type="text"
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Source / outlet name (optional)"
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste the full article content here..."
          rows={10}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !content.trim()}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 self-end"
        >
          {loading ? 'Analyzing...' : 'Check Article'}
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={handleCheck} />}

      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🔍</div>
          <p>Running credibility analysis...</p>
          <p className="text-sm text-gray-600 mt-2">This may take 10-20 seconds</p>
        </div>
      )}

      {!loading && result?.mistral && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Verdict</h2>
              <VerdictBadge verdict={result.mistral.verdict} />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{result.mistral.explanation}</p>
          </div>

          <div className="border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Scores</h2>
            <div className="flex justify-around flex-wrap gap-6">
              <ScoreRing
                score={result.mistral.credibilityScore}
                label="Credibility"
                color="border-green-500"
              />
              <ScoreRing
                score={result.mistral.manipulationLanguage}
                label="Manipulation"
                color="border-red-500"
              />
              <ScoreRing
                score={result.mistral.emotionalLanguage}
                label="Emotional Language"
                color="border-yellow-500"
              />
              <ScoreRing
                score={result.mistral.opinionVsFact}
                label="Opinion vs Fact"
                color="border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.mistral.redFlags.length > 0 && (
              <div className="border border-red-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Red Flags</h3>
                <ul className="flex flex-col gap-2">
                  {result.mistral.redFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-gray-300">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.mistral.verifiedClaims.length > 0 && (
              <div className="border border-green-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-400 mb-3">Verified Claims</h3>
                <ul className="flex flex-col gap-2">
                  {result.mistral.verifiedClaims.map((claim, i) => (
                    <li key={i} className="text-xs text-gray-300">• {claim}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.mistral.suspiciousClaims.length > 0 && (
              <div className="border border-yellow-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">Suspicious Claims</h3>
                <ul className="flex flex-col gap-2">
                  {result.mistral.suspiciousClaims.map((claim, i) => (
                    <li key={i} className="text-xs text-gray-300">• {claim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Detector