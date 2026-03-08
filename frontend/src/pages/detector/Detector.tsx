import { useState } from 'react'
import { checkArticle, extractAndCheck } from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { useLang } from '../../store/LanguageContext'

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

const ScoreBar = ({ score, label, color }: { score: number; label: string; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: '#444',
        letterSpacing: '0.08em',
      }}>
        {label.toUpperCase()}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.2rem',
        fontWeight: 700,
        color,
      }}>
        {score}
      </span>
    </div>
    <div style={{ width: '100%', height: '2px', background: '#1a1a1a', borderRadius: '1px' }}>
      <div style={{
        height: '100%',
        width: `${score}%`,
        background: color,
        borderRadius: '1px',
        boxShadow: `0 0 6px ${color}66`,
        transition: 'width 0.5s ease',
      }} />
    </div>
  </div>
)

const VerdictBadge = ({ verdict }: { verdict: string }) => {
  const config: Record<string, { color: string; bg: string }> = {
    'Credible': { color: '#22c55e', bg: '#22c55e11' },
    'Likely Credible': { color: '#86efac', bg: '#22c55e0a' },
    'Uncertain': { color: '#eab308', bg: '#eab30811' },
    'Likely Misleading': { color: '#f97316', bg: '#f9731611' },
    'Misleading': { color: '#ef4444', bg: '#ef444411' },
  }
  const style = config[verdict] || { color: '#888', bg: '#88888811' }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      borderRadius: '4px',
      border: `1px solid ${style.color}33`,
      background: style.bg,
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: style.color,
        boxShadow: `0 0 6px ${style.color}`,
        display: 'inline-block',
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: style.color,
        letterSpacing: '0.1em',
      }}>
        {verdict.toUpperCase()}
      </span>
    </div>
  )
}

const ClaimList = ({
  items,
  label,
  color,
}: {
  items: string[]
  label: string
  color: string
}) => {
  if (!items.length) return null
  return (
    <div style={{
      border: `1px solid ${color}22`,
      borderRadius: '8px',
      padding: '16px',
      background: `${color}05`,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color,
        letterSpacing: '0.1em',
        marginBottom: '12px',
      }}>
        {label.toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: '1px' }}>—</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.78rem',
              color: '#555',
              lineHeight: 1.5,
            }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const Detector = () => {
  const [mode, setMode] = useState<'paste' | 'url'>('paste')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState<DetectorResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLang()

  const handleCheck = async () => {
    if (mode === 'url' && !url.trim()) return
    if (mode === 'paste' && !content.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let res
      if (mode === 'url') {
        res = await extractAndCheck({ url })
      } else {
        res = await checkArticle({ title, source, content })
      }
      setResult(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to analyze article.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '6px',
    padding: '12px 16px',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: '#ef4444',
          letterSpacing: '0.15em',
          marginBottom: '8px',
        }}>
          // {t.detector.title.toUpperCase()}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.05em',
          margin: '0 0 8px 0',
        }}>
          {t.detector.title}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: '#444',
          margin: 0,
        }}>
          {t.detector.subtitle}
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '6px',
        padding: '4px',
        width: 'fit-content',
      }}>
        {(['paste', 'url'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              padding: '7px 16px',
              borderRadius: '4px',
              border: 'none',
              background: mode === m ? '#161616' : 'transparent',
              color: mode === m ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {m === 'paste' ? t.detector.pasteMode.toUpperCase() : t.detector.urlMode.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {mode === 'url' ? (
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#333',
            }}>
              URL:
            </span>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder={t.detector.urlPlaceholder}
              style={{ ...inputStyle, paddingLeft: '52px' }}
              onFocus={e => (e.target.style.borderColor = '#2a2a2a')}
              onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t.detector.titlePlaceholder}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#2a2a2a')}
                onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
              />
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder={t.detector.sourcePlaceholder}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#2a2a2a')}
                onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
              />
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t.detector.contentPlaceholder}
              rows={10}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = '#2a2a2a')}
              onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
            />
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <button
          onClick={handleCheck}
          disabled={loading || (mode === 'url' ? !url.trim() : !content.trim())}
          style={{
            padding: '12px 28px',
            background: loading ? '#111' : '#ef4444',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          {loading ? t.detector.checking : t.detector.check}
        </button>
      </div>

      {error && <div style={{ marginBottom: '24px' }}><ErrorMessage message={error} onRetry={handleCheck} /></div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#ef4444',
            letterSpacing: '0.15em',
            animation: 'pulse 1.5s infinite',
          }}>
            ◆ RUNNING CREDIBILITY ANALYSIS...
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#222', letterSpacing: '0.1em', marginTop: '12px' }}>
            CROSS-REFERENCING CLAIMS · ANALYZING LANGUAGE PATTERNS
          </div>
        </div>
      )}

      {!loading && result?.mistral && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verdict */}
          <div style={{
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            background: '#090909',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: '#333',
                letterSpacing: '0.1em',
              }}>
                {t.detector.verdict.toUpperCase()}
              </span>
              <VerdictBadge verdict={result.mistral.verdict} />
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: '#666',
              lineHeight: 1.7,
              margin: 0,
            }}>
              {result.mistral.explanation}
            </p>
          </div>

          {/* Scores */}
          <div style={{
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            background: '#090909',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#333',
              letterSpacing: '0.1em',
              marginBottom: '20px',
            }}>
              {t.detector.scores.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ScoreBar score={result.mistral.credibilityScore} label={t.detector.credibility} color="#22c55e" />
              <ScoreBar score={result.mistral.manipulationLanguage} label={t.detector.manipulation} color="#ef4444" />
              <ScoreBar score={result.mistral.emotionalLanguage} label={t.detector.emotional} color="#eab308" />
              <ScoreBar score={result.mistral.opinionVsFact} label={t.detector.opinionFact} color="#3b82f6" />
            </div>
          </div>

          {/* Claims */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            <ClaimList items={result.mistral.redFlags} label={t.detector.redFlags} color="#ef4444" />
            <ClaimList items={result.mistral.verifiedClaims} label={t.detector.verified} color="#22c55e" />
            <ClaimList items={result.mistral.suspiciousClaims} label={t.detector.suspicious} color="#eab308" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Detector