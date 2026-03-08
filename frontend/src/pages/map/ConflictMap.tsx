import { useState, useEffect, useRef } from 'react'
import { Ion, Viewer, Cartesian3, Color, HeightReference, NearFarScalar, UrlTemplateImageryProvider } from 'cesium'
import { useLang } from '../../store/LanguageContext'
import { getConflictEvents, getNewsByLocation, getIntelFeed } from '../../services/api'
import 'cesium/Widgets/widgets.css'

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN

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
}

const CONFLICT_ZONES: ConflictZone[] = [
  { country: 'Ukraine', countryAr: 'أوكرانيا', lat: 49.0, lng: 31.0, severity: 'critical' },
  { country: 'Gaza', countryAr: 'غزة', lat: 31.5, lng: 34.4, severity: 'critical' },
  { country: 'Sudan', countryAr: 'السودان', lat: 15.5, lng: 32.5, severity: 'critical' },
  { country: 'Syria', countryAr: 'سوريا', lat: 34.8, lng: 38.9, severity: 'high' },
  { country: 'Yemen', countryAr: 'اليمن', lat: 15.5, lng: 48.5, severity: 'high' },
  { country: 'Myanmar', countryAr: 'ميانمار', lat: 19.7, lng: 96.0, severity: 'high' },
  { country: 'Somalia', countryAr: 'الصومال', lat: 5.1, lng: 46.2, severity: 'low' },
  { country: 'Iran', countryAr: 'إيران', lat: 32.4, lng: 53.6, severity: 'critical' },
]

const severityColor = (severity: string) => {
  if (severity === 'critical') return Color.fromCssColorString('#ef4444')
  if (severity === 'high') return Color.fromCssColorString('#f97316')
  return Color.fromCssColorString('#eab308')
}

const severityHex = (severity: string) => {
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
  const viewerRef = useRef<Viewer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null)
  const [zoneArticles, setZoneArticles] = useState<Article[]>([])
  const [loadingZone, setLoadingZone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'low'>('all')
  const [sidebarTab, setSidebarTab] = useState<'zones' | 'intel'>('zones')
  const [intelItems, setIntelItems] = useState<any[]>([])
  const [intelLoading, setIntelLoading] = useState(false)
  const [intelCategory, setIntelCategory] = useState<'all' | 'breaking' | 'conflict' | 'arabic'>('all')

  const fetchIntel = async (category = 'all') => {
    setIntelLoading(true)
    try {
      const res = await getIntelFeed(category)
      setIntelItems(res.data.items || [])
    } catch {
      setIntelItems([])
    } finally {
      setIntelLoading(false)
    }
  }

  useEffect(() => {
    if (sidebarTab === 'intel') {
      fetchIntel(intelCategory)
    }
  }, [sidebarTab, intelCategory])

  // Init Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const viewer = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
    })

    // Remove default imagery and add dark styled tiles
    viewer.imageryLayers.removeAll()
    const darkTiles = new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 19,
      credit: 'CartoDB',
    })
    viewer.imageryLayers.addImageryProvider(darkTiles)

    // Dark atmosphere
    viewer.scene.backgroundColor = Color.fromCssColorString('#080808')
    viewer.scene.globe.enableLighting = true
    viewer.scene.atmosphere.brightnessShift = -0.5
    if (viewer.scene.skyBox) viewer.scene.skyBox.show = true
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true

    // Set initial camera
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(25, 20, 20000000),
      duration: 2,
    })

    viewerRef.current = viewer

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  // Add conflict zone markers
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    viewer.entities.removeAll()

    const filtered = CONFLICT_ZONES.filter(
      z => activeFilter === 'all' || z.severity === activeFilter
    )

    filtered.forEach(zone => {
      const color = severityColor(zone.severity)
      const pulseColor = zone.severity === 'critical'
        ? Color.fromCssColorString('#ef444466')
        : Color.fromCssColorString('#f9731644')

      // Main point
      viewer.entities.add({
        position: Cartesian3.fromDegrees(zone.lng, zone.lat),
        point: {
          pixelSize: zone.severity === 'critical' ? 14 : zone.severity === 'high' ? 10 : 7,
          color,
          outlineColor: color.withAlpha(0.3),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          scaleByDistance: new NearFarScalar(1.5e6, 1.5, 8.0e6, 0.8),
        },
        label: {
          text: zone.country,
          font: '11px JetBrains Mono, monospace',
          fillColor: Color.fromCssColorString('#ffffff66'),
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: { x: 0, y: -20 } as any,
          scaleByDistance: new NearFarScalar(1.5e6, 1.2, 8.0e6, 0.0),
        },
        // Pulse ring for critical
        ...(zone.severity === 'critical' && {
          ellipse: {
            semiMinorAxis: 150000,
            semiMajorAxis: 150000,
            material: pulseColor,
            outline: true,
            outlineColor: color,
            outlineWidth: 1,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
        }),
        properties: { zone } as any,
      })
    })

    // Click handler
    const handler = viewer.screenSpaceEventHandler
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position)
      if (picked?.id?.properties?.zone) {
        handleZoneClick(picked.id.properties.zone.getValue())
      }
    }, 1) // LEFT_CLICK = 1

    return () => {
      handler.removeInputAction(1)
    }
  }, [activeFilter])

  // Fetch live feed
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getConflictEvents()
        setRecentArticles(res.data.articles || [])
      } catch {
        setMapError('Failed to load conflict data.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleZoneClick = async (zone: ConflictZone) => {
    setSelectedZone(zone)
    setLoadingZone(true)

    // Fly to zone
    if (viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(zone.lng, zone.lat, 3000000),
        duration: 1.5,
      })
    }

    try {
      const res = await getNewsByLocation(zone.country)
      setZoneArticles(res.data.articles || [])
    } catch {
      setZoneArticles([])
    } finally {
      setLoadingZone(false)
    }
  }

  const handleBack = () => {
    setSelectedZone(null)
    if (viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(25, 20, 20000000),
        duration: 1.5,
      })
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)', background: '#080808' }}>
      {/* Cesium container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Top overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'linear-gradient(to bottom, #080808dd, transparent)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
        }}>
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

        {/* Filter bar */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
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
            zIndex: 100,
            background: '#0a0a0a',
            border: '1px solid #ef444433',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#ef4444',
            maxWidth: '280px',
          }}>
            {mapError}
          </div>
        )}
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
        {/* Sidebar header with tabs */}
        <div style={{
          borderBottom: '1px solid #111',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #111',
          }}>
            {(['zones', 'intel'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setSidebarTab(tab)
                  setSelectedZone(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  border: 'none',
                  borderBottom: sidebarTab === tab ? '2px solid #ef4444' : '2px solid transparent',
                  background: 'transparent',
                  color: sidebarTab === tab ? '#fff' : '#333',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab === 'zones' ? '🌍 CONFLICT ZONES' : '📡 INTEL FEED'}
              </button>
            ))}
          </div>

          {/* Tab-specific header */}
          {sidebarTab === 'zones' && (
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {selectedZone ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: severityHex(selectedZone.severity),
                      boxShadow: `0 0 6px ${severityHex(selectedZone.severity)}`,
                      display: 'inline-block',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '1rem',
                      fontWeight: 600, color: '#fff', letterSpacing: '0.05em',
                    }}>
                      {lang === 'ar' ? selectedZone.countryAr : selectedZone.country}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      color: severityHex(selectedZone.severity),
                      border: `1px solid ${severityHex(selectedZone.severity)}33`,
                      padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.08em',
                    }}>
                      {selectedZone.severity.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleBack}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#333',
                      background: 'none', border: '1px solid #1a1a1a', borderRadius: '4px',
                      padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.08em',
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
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#22c55e', boxShadow: '0 0 6px #22c55e',
                    display: 'inline-block', animation: 'pulse 2s infinite',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    color: '#444', letterSpacing: '0.1em',
                  }}>
                    {t.map.liveField.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#222' }}>
                    · {recentArticles.length} SIGNALS
                  </span>
                </div>
              )}
            </div>
          )}

          {sidebarTab === 'intel' && (
            <div style={{ padding: '10px 12px', display: 'flex', gap: '4px' }}>
              {(['all', 'breaking', 'conflict', 'arabic'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setIntelCategory(cat)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                    letterSpacing: '0.06em', padding: '4px 8px', borderRadius: '3px',
                    border: 'none',
                    background: intelCategory === cat ? '#161616' : 'transparent',
                    color: intelCategory === cat ? '#ef4444' : '#333',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: '7px',
        }}>
          {/* ZONES TAB */}
          {sidebarTab === 'zones' && (
            <>
              {!selectedZone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                  {CONFLICT_ZONES.map(zone => (
                    <button
                      key={zone.country}
                      onClick={() => handleZoneClick(zone)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 10px', background: '#0a0a0a',
                        border: '1px solid #161616', borderRadius: '5px',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: severityHex(zone.severity),
                          boxShadow: `0 0 4px ${severityHex(zone.severity)}`,
                          display: 'inline-block',
                        }} />
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                          color: '#ccc', letterSpacing: '0.04em',
                        }}>
                          {lang === 'ar' ? zone.countryAr : zone.country}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                        color: severityHex(zone.severity), letterSpacing: '0.08em',
                      }}>
                        {zone.severity.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {(loading || loadingZone) && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: loadingZone ? '#ef4444' : '#222',
                  letterSpacing: '0.1em',
                  animation: loadingZone ? 'pulse 1.5s infinite' : 'none',
                }}>
                  {loadingZone ? '◆ FETCHING INTEL...' : t.map.loading.toUpperCase()}
                </div>
              )}

              {!loading && !loadingZone && (selectedZone ? zoneArticles : recentArticles).map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    border: '1px solid #111', borderRadius: '6px', padding: '10px',
                    background: '#090909', display: 'block', textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#0e0e0e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#090909' }}
                >
                  {article.socialimage && (
                    <img src={article.socialimage} alt="" style={{
                      width: '100%', height: '90px', objectFit: 'cover',
                      borderRadius: '4px', marginBottom: '8px', opacity: 0.65,
                    }} />
                  )}
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                    color: '#777', lineHeight: 1.5, margin: '0 0 7px 0',
                  }}>
                    {article.title}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#2a2a2a' }}>
                      {article.domain}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#1a1a1a' }}>
                      {formatDate(article.seendate)}
                    </span>
                  </div>
                </a>
              ))}
            </>
          )}

          {/* INTEL TAB */}
          {sidebarTab === 'intel' && (
            <>
              {intelLoading && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: '#ef4444', letterSpacing: '0.1em',
                  animation: 'pulse 1.5s infinite',
                }}>
                  ◆ LOADING INTEL FEED...
                </div>
              )}

              {!intelLoading && intelItems.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: '#222', letterSpacing: '0.1em',
                }}>
                  NO INTEL AVAILABLE
                </div>
              )}

              {!intelLoading && intelItems.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    border: '1px solid #111', borderRadius: '6px', padding: '10px',
                    background: '#090909', display: 'block', textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#0e0e0e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#090909' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      color: '#ef4444', letterSpacing: '0.08em',
                    }}>
                      {item.source.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                      color: item.category === 'arabic' ? '#3b82f6'
                        : item.category === 'conflict' ? '#ef4444'
                          : '#f97316',
                      border: `1px solid currentColor`,
                      padding: '1px 5px', borderRadius: '2px', letterSpacing: '0.06em',
                    }}>
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: item.lang === 'ar' ? 'Cairo, sans-serif' : 'var(--font-body)',
                    fontSize: '0.72rem', color: '#777', lineHeight: 1.5,
                    margin: '0 0 6px 0',
                    direction: item.lang === 'ar' ? 'rtl' : 'ltr',
                    textAlign: item.lang === 'ar' ? 'right' : 'left',
                  }}>
                    {item.title}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: '#222',
                  }}>
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString() : ''}
                  </span>
                </a>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConflictMap