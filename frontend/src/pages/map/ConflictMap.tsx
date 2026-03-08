import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getConflictEvents, getNewsByLocation } from '../../services/api'
import { useLang } from '../../store/LanguageContext'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Article {
  url: string
  title: string
  seendate: string
  domain: string
  language: string
  sourcecountry: string
  socialimage?: string
}

interface ConflictZone {
  country: string
  countryAr: string
  lat: number
  lng: number
  severity: 'critical' | 'high' | 'low'
  articles: Article[]
}

const CONFLICT_ZONES: ConflictZone[] = [
  { country: 'Ukraine', countryAr: 'أوكرانيا', lat: 49.0, lng: 31.0, severity: 'critical', articles: [] },
  { country: 'Gaza', countryAr: 'غزة', lat: 31.5, lng: 34.4, severity: 'critical', articles: [] },
  { country: 'Sudan', countryAr: 'السودان', lat: 15.5, lng: 32.5, severity: 'critical', articles: [] },
  { country: 'Syria', countryAr: 'سوريا', lat: 34.8, lng: 38.9, severity: 'high', articles: [] },
  { country: 'Yemen', countryAr: 'اليمن', lat: 15.5, lng: 48.5, severity: 'high', articles: [] },
  { country: 'Myanmar', countryAr: 'ميانمار', lat: 19.7, lng: 96.0, severity: 'high', articles: [] },
  { country: 'Somalia', countryAr: 'الصومال', lat: 5.1, lng: 46.2, severity: 'low', articles: [] },
  { country: 'Iran', countryAr: 'إيران', lat: 32.4, lng: 53.6, severity: 'critical', articles: [] },
]

const severityColor = (severity: string) => {
  if (severity === 'critical') return '#ef4444'
  if (severity === 'high') return '#f97316'
  return '#eab308'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)}`
}

const ConflictMap = () => {
  const { t, lang } = useLang()
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null)
  const [zoneArticles, setZoneArticles] = useState<Article[]>([])
  const [loadingZone, setLoadingZone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'low'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getConflictEvents()
        setRecentArticles(res.data.articles || [])
      } catch {
        setMapError('Failed to load conflict data. Try refreshing.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleZoneClick = async (zone: ConflictZone) => {
    setSelectedZone(zone)
    setLoadingZone(true)
    try {
      const res = await getNewsByLocation(zone.country)
      setZoneArticles(res.data.articles || [])
    } catch {
      setZoneArticles([])
    } finally {
      setLoadingZone(false)
    }
  }

  const filteredZones = CONFLICT_ZONES.filter(
    z => activeFilter === 'all' || z.severity === activeFilter
  )

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)', background: '#080808' }}>
      {/* Map area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Top overlay bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(to bottom, #080808ee, transparent)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#ef4444',
              letterSpacing: '0.12em',
            }}>
              ◆ LIVE CONFLICT INTELLIGENCE
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: '#222',
              letterSpacing: '0.08em',
            }}>
              {CONFLICT_ZONES.length} ACTIVE ZONES
            </span>
          </div>
        </div>

        {/* Severity filter */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: '4px',
          background: '#080808ee',
          border: '1px solid #1a1a1a',
          borderRadius: '6px',
          padding: '4px',
        }}>
          {(['all', 'critical', 'high', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                padding: '5px 12px',
                borderRadius: '4px',
                border: 'none',
                background: activeFilter === f ? '#161616' : 'transparent',
                color: activeFilter === f
                  ? f === 'all' ? '#fff'
                    : f === 'critical' ? '#ef4444'
                      : f === 'high' ? '#f97316'
                        : '#eab308'
                  : '#333',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {mapError && (
          <div style={{
            position: 'absolute',
            top: '50px',
            left: '16px',
            zIndex: 1000,
            background: '#0a0a0a',
            border: '1px solid #ef444433',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#ef4444',
            maxWidth: '280px',
            letterSpacing: '0.06em',
          }}>
            {mapError}
          </div>
        )}

        <MapContainer
          center={[20, 20]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          {filteredZones.map(zone => (
            <CircleMarker
              key={zone.country}
              center={[zone.lat, zone.lng]}
              radius={zone.severity === 'critical' ? 14 : zone.severity === 'high' ? 10 : 7}
              pathOptions={{
                color: severityColor(zone.severity),
                fillColor: severityColor(zone.severity),
                fillOpacity: selectedZone?.country === zone.country ? 0.7 : 0.3,
                weight: selectedZone?.country === zone.country ? 2 : 1,
              }}
              eventHandlers={{ click: () => handleZoneClick(zone) }}
            >
              <Popup>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#000' }}>
                  <strong>{lang === 'ar' ? zone.countryAr : zone.country}</strong>
                  <br />
                  <span style={{ color: severityColor(zone.severity), fontSize: '0.6rem' }}>
                    {zone.severity.toUpperCase()}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <div style={{
        width: '360px',
        borderLeft: '1px solid #111',
        display: 'flex',
        flexDirection: 'column',
        background: '#080808',
        overflow: 'hidden',
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #111',
          display: 'center' as any,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {selectedZone ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: severityColor(selectedZone.severity),
                  boxShadow: `0 0 6px ${severityColor(selectedZone.severity)}`,
                  display: 'inline-block',
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  letterSpacing: '0.05em',
                }}>
                  {lang === 'ar' ? selectedZone.countryAr : selectedZone.country}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: severityColor(selectedZone.severity),
                  border: `1px solid ${severityColor(selectedZone.severity)}33`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  letterSpacing: '0.08em',
                }}>
                  {selectedZone.severity.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: '#333',
                  background: 'none',
                  border: '1px solid #1a1a1a',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}
              >
                {t.map.back.toUpperCase()}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: '#444',
                letterSpacing: '0.1em',
              }}>
                {t.map.liveField.toUpperCase()}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: '#222',
                letterSpacing: '0.08em',
              }}>
                · {recentArticles.length} SIGNALS
              </span>
            </div>
          )}
        </div>

        {/* Zone list when no zone selected */}
        {!selectedZone && (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #111',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {CONFLICT_ZONES.map(zone => (
              <button
                key={zone.country}
                onClick={() => handleZoneClick(zone)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: '#0a0a0a',
                  border: '1px solid #161616',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: severityColor(zone.severity),
                    boxShadow: `0 0 4px ${severityColor(zone.severity)}`,
                    display: 'inline-block',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    color: '#ccc',
                    letterSpacing: '0.04em',
                  }}>
                    {lang === 'ar' ? zone.countryAr : zone.country}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: severityColor(zone.severity),
                  letterSpacing: '0.08em',
                }}>
                  {zone.severity.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Articles feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#222',
              letterSpacing: '0.1em',
            }}>
              {t.map.loading.toUpperCase()}
            </div>
          )}

          {loadingZone && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#ef4444',
              letterSpacing: '0.1em',
              animation: 'pulse 1.5s infinite',
            }}>
              ◆ FETCHING INTEL...
            </div>
          )}

          {!loading && !loadingZone && (selectedZone ? zoneArticles : recentArticles).map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: '1px solid #111',
                borderRadius: '6px',
                padding: '12px',
                background: '#090909',
                display: 'block',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#1a1a1a'
                e.currentTarget.style.background = '#0e0e0e'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#111'
                e.currentTarget.style.background = '#090909'
              }}
            >
              {article.socialimage && (
                <img
                  src={article.socialimage}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    opacity: 0.7,
                  }}
                />
              )}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: '#888',
                lineHeight: 1.5,
                margin: '0 0 8px 0',
              }}>
                {article.title}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: '#333',
                  letterSpacing: '0.06em',
                }}>
                  {article.domain}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: '#222',
                  letterSpacing: '0.06em',
                }}>
                  {formatDate(article.seendate)}
                </span>
              </div>
            </a>
          ))}

          {!loading && !loadingZone && selectedZone && zoneArticles.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: '#222',
              letterSpacing: '0.1em',
            }}>
              {t.map.noArticles.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConflictMap