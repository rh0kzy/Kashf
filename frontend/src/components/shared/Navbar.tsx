import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../../store/LanguageContext'
import logo from '../../assets/logo.png'

const Navbar = () => {
  const { pathname } = useLocation()
  const { t, lang, toggleLang } = useLang()

  const links = [
    { path: '/', label: t.nav.home },
    { path: '/reader', label: t.nav.reader },
    { path: '/detector', label: t.nav.detector },
    { path: '/map', label: t.nav.map },
  ]

  return (
    <nav
      style={{ borderBottom: '1px solid #1a1a1a', background: '#080808' }}
      className="px-6 py-3 flex items-center justify-between sticky top-0 z-50"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Kashf" style={{ height: '32px', width: 'auto' }} />
        <div className="relative">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#fff',
            }}
          >
            KASHF
          </span>
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, #ef4444, transparent)',
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#22c55e',
              letterSpacing: '0.1em',
            }}
          >
            {t.common.live}
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              padding: '6px 14px',
              borderRadius: '4px',
              transition: 'all 0.15s',
              color: pathname === link.path ? '#fff' : '#555',
              background: pathname === link.path ? '#161616' : 'transparent',
              border: pathname === link.path ? '1px solid #2a2a2a' : '1px solid transparent',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            padding: '5px 12px',
            borderRadius: '4px',
            border: '1px solid #2a2a2a',
            background: '#111',
            color: '#888',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.color = '#fff'
              ; (e.target as HTMLButtonElement).style.borderColor = '#444'
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.color = '#888'
              ; (e.target as HTMLButtonElement).style.borderColor = '#2a2a2a'
          }}
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>

        {/* Connection status */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#333',
            letterSpacing: '0.08em',
          }}
        >
          {t.common.connected} —
        </div>
      </div>
    </nav>
  )
}

export default Navbar