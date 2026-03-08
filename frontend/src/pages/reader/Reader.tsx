import { useState } from 'react'
import { analyzeQuery } from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { useLang } from '../../store/LanguageContext'

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

const BiasBar = ({ score, left, center, right }: { score: number; left: string; center: string; right: string }) => {
  const getColor = (score: number) => {
    if (score < 30) return '#3b82f6'
    if (score < 45) return '#93c5fd'
    if (score < 55) return '#888'
    if (score < 70) return '#fca5a5'
    return '#ef4444'
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        {[left, center, right].map(label => (
          <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#333', letterSpacing: '0.08em' }}>
            {label}
          </span>
        ))}
      </div>
      <div style={{ width: '100%', height: '2px', background: '#1a1a1a', borderRadius: '1px', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: `${score}%`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getColor(score),
            transform: 'translateX(-50%)',
            boxShadow: `0 0 6px ${getColor(score)}`,
          }}
        />
      </div>
    </div>
  )
}

const ToneTag = ({ tone }: { tone: string }) => {
  const colors: Record<string, string> = {
    Positive: '#22c55e',
    Neutral: '#888',
    Negative: '#ef4444',
    Alarming: '#ef4444',
    Sympathetic: '#3b82f6',
    Critical: '#f97316',
  }
  const color = colors[tone] || '#555'
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.55rem',
      color,
      border: `1px solid ${color}33`,
      padding: '2px 6px',
      borderRadius: '3px',
      letterSpacing: '0.08em',
    }}>
      {tone.toUpperCase()}
    </span>
  )
}

const ArticleCard = ({ article, index }: { article: Article; index: number }) => {
  const [expanded, setExpanded] = useState(false)
  const { t } = useLang()

  return (
    <div style={{
      border: '1px solid #161616',
      borderRadius: '8px',
      background: '#090909',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
    >
      {article.image && (
        <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
          <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #090909)' }} />
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: '#ef4444',
            letterSpacing: '0.1em',
            background: '#090909cc',
            padding: '2px 6px',
            borderRadius: '3px',
          }}>
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#ef4444',
            letterSpacing: '0.1em',
          }}>
            {article.source.toUpperCase()}
          </span>
          {article.analysis && <ToneTag tone={article.analysis.tone} />}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: '#ccc',
          lineHeight: 1.5,
          margin: 0,
        }}>
          {article.title}
        </h3>

        {article.analysis && (
          <>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: '#444',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {article.analysis.summary}
            </p>

            <BiasBar
              score={article.analysis.biasScore}
              left={t.reader.left}
              center={t.reader.center}
              right={t.reader.right}
            />

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {article.analysis.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: '#333',
                  border: '1px solid #1a1a1a',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  letterSpacing: '0.06em',
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: t.reader.bias, value: article.analysis.bias },
                { label: t.reader.opinion, value: `${article.analysis.opinionVsFact}%` },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#0e0e0e',
                  borderRadius: '4px',
                  padding: '8px',
                  border: '1px solid #161616',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#333', marginBottom: '4px', letterSpacing: '0.08em' }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {expanded && (
              <div style={{ borderTop: '1px solid #161616', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#444' }}>
                  <span style={{ color: '#333', marginRight: '6px' }}>{t.reader.framing.toUpperCase()}:</span>
                  {article.analysis.framing}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#444' }}>
                  <span style={{ color: '#333', marginRight: '6px' }}>{t.reader.keyVerbs.toUpperCase()}:</span>
                  {article.analysis.keyVerbs.join(' · ')}
                </div>
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: '#2a2a2a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                letterSpacing: '0.08em',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}
            >
              {expanded ? '[ COLLAPSE ]' : '[ EXPAND ANALYSIS ]'}
            </button>
          </>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#2a2a2a',
            textDecoration: 'none',
            marginTop: 'auto',
            letterSpacing: '0.08em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}
        >
          {t.reader.readMore} ↗
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
  const { t } = useLang()

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const res = await analyzeQuery(query)
      setArticles(res.data.articles)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch articles.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: '#ef4444',
          letterSpacing: '0.15em',
          marginBottom: '8px',
        }}>
          // {t.reader.title.toUpperCase()}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.05em',
          margin: '0 0 8px 0',
        }}>
          {t.reader.title}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: '#444',
          margin: 0,
        }}>
          {t.reader.subtitle}
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#333',
          }}>
            &gt;_
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t.reader.placeholder}
            style={{
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              padding: '12px 16px 12px 40px',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = '#2a2a2a')}
            onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '12px 24px',
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
          {loading ? t.reader.analyzing : t.reader.analyze}
        </button>
      </div>

      {error && <div style={{ marginBottom: '24px' }}><ErrorMessage message={error} onRetry={handleSearch} /></div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#ef4444',
            letterSpacing: '0.15em',
            marginBottom: '16px',
            animation: 'pulse 1.5s infinite',
          }}>
            ◆ FETCHING AND ANALYZING SOURCES...
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#222', letterSpacing: '0.1em' }}>
            THIS MAY TAKE 15-30 SECONDS
          </div>
        </div>
      )}

      {!loading && searched && articles.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#222', letterSpacing: '0.1em' }}>
          NO SIGNALS FOUND — TRY A DIFFERENT QUERY
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#333',
            letterSpacing: '0.1em',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: '#22c55e' }}>◆</span>
            {articles.length} {t.reader.results} "{query}"
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '12px',
          }}>
            {articles.map((article, i) => (
              <ArticleCard key={i} article={article} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Reader