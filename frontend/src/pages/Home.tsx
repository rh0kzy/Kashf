import { Link } from 'react-router-dom'
import { useLang } from '../store/LanguageContext'
import { useEffect, useState } from 'react'

const TICKER_ITEMS = [
  'BBC frames Gaza conflict as humanitarian crisis',
  'RT emphasizes Western provocation in Ukraine coverage',
  'Al Jazeera leads with civilian casualties in Sudan',
  'CNN focuses on diplomatic efforts in Middle East',
  'Guardian highlights climate refugee displacement',
  'Fox News emphasizes border security narrative',
  'Deutsche Welle reports on EU sanctions impact',
  'France 24 covers Sahel military coups extensively',
]

const Ticker = () => {
  return (
    <div
      style={{
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
        background: '#0a0a0a',
        overflow: 'hidden',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '60px',
          animation: 'ticker 30s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#444',
              letterSpacing: '0.05em',
            }}
          >
            <span style={{ color: '#ef4444', marginRight: '8px' }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

const TensionMeter = () => {
  const [tension, setTension] = useState(0)

  useEffect(() => {
    const target = 73
    const step = target / 60
    let current = 0
    const interval = setInterval(() => {
      current += step
      if (current >= target) {
        setTension(target)
        clearInterval(interval)
      } else {
        setTension(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [])

  const getColor = (val: number) => {
    if (val >= 80) return '#ef4444'
    if (val >= 60) return '#f97316'
    if (val >= 40) return '#eab308'
    return '#22c55e'
  }

  const getLabel = (val: number) => {
    if (val >= 80) return 'CRITICAL'
    if (val >= 60) return 'HIGH'
    if (val >= 40) return 'ELEVATED'
    return 'LOW'
  }

  return (
    <div
      style={{
        border: '1px solid #1a1a1a',
        borderRadius: '8px',
        padding: '20px 24px',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: '#444',
            letterSpacing: '0.1em',
          }}
        >
          GLOBAL MEDIA TENSION
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: getColor(tension),
            letterSpacing: '0.1em',
            padding: '2px 8px',
            border: `1px solid ${getColor(tension)}33`,
            borderRadius: '4px',
          }}
        >
          {getLabel(tension)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.5rem',
            fontWeight: 700,
            color: getColor(tension),
            lineHeight: 1,
            transition: 'color 0.3s',
          }}
        >
          {tension}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#333',
            marginBottom: '8px',
          }}
        >
          / 100
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '4px',
          background: '#1a1a1a',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${tension}%`,
            background: `linear-gradient(90deg, #ef4444, ${getColor(tension)})`,
            borderRadius: '2px',
            transition: 'width 0.016s linear',
            boxShadow: `0 0 8px ${getColor(tension)}66`,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: '#2a2a2a',
        }}
      >
        BASED ON GDELT TONE ANALYSIS · UPDATES EVERY 15MIN
      </span>
    </div>
  )
}

const StatCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div
    style={{
      border: '1px solid #1a1a1a',
      borderRadius: '8px',
      padding: '16px 20px',
      background: '#0a0a0a',
    }}
  >
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: '#444',
        letterSpacing: '0.1em',
        marginBottom: '8px',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: '#333',
        marginTop: '6px',
      }}
    >
      {sub}
    </div>
  </div>
)

const FeatureCard = ({
  path,
  icon,
  title,
  desc,
  tag,
}: {
  path: string
  icon: string
  title: string
  desc: string
  tag: string
}) => {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={path}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? '#2a2a2a' : '#161616'}`,
        borderRadius: '8px',
        padding: '24px',
        background: hovered ? '#0e0e0e' : '#090909',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#333',
            letterSpacing: '0.1em',
            padding: '2px 8px',
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
          }}
        >
          {tag}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: '#555',
          lineHeight: 1.6,
        }}
      >
        {desc}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: hovered ? '#ef4444' : '#2a2a2a',
          transition: 'color 0.2s',
          marginTop: 'auto',
        }}
      >
        ENTER MODULE →
      </div>
    </Link>
  )
}

const Home = () => {
  const { t, lang } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <Ticker />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#ef4444',
              letterSpacing: '0.15em',
              marginBottom: '16px',
            }}
          >
            {lang === 'ar' ? '// منصة استخبارات إعلامية' : '// MEDIA INTELLIGENCE PLATFORM'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.05em',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            {lang === 'ar' ? (
              <>
                اكشف الحقيقة<br />
                <span style={{ color: '#ef4444' }}>خلف الخبر</span>
              </>
            ) : (
              <>
                UNCOVER THE TRUTH<br />
                <span style={{ color: '#ef4444' }}>BEHIND THE NEWS</span>
              </>
            )}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#555',
              maxWidth: '500px',
              lineHeight: 1.7,
            }}
          >
            {t.home.tagline}
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <TensionMeter />
          <StatCard
            label="SOURCES MONITORED"
            value="65+"
            sub="Languages covered"
          />
          <StatCard
            label="ARTICLES TODAY"
            value="12K+"
            sub="Indexed by GDELT"
          />
          <StatCard
            label="CONFLICT ZONES"
            value="8"
            sub="Active regions"
          />
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <FeatureCard
            path="/reader"
            icon="⚡"
            title={t.home.readerTitle}
            desc={t.home.readerDesc}
            tag="AI POWERED"
          />
          <FeatureCard
            path="/detector"
            icon="🎯"
            title={t.home.detectorTitle}
            desc={t.home.detectorDesc}
            tag="FACT CHECK"
          />
          <FeatureCard
            path="/map"
            icon="🌍"
            title={t.home.mapTitle}
            desc={t.home.mapDesc}
            tag="LIVE DATA"
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #111',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#222',
              letterSpacing: '0.08em',
            }}
          >
            POWERED BY GDELT · MISTRAL AI · GUARDIAN API · NEWSAPI
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#222',
              letterSpacing: '0.08em',
            }}
          >
            KASHF © 2026
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home