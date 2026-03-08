import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getConflictEvents, getNewsByLocation } from '../../services/api'
import L from 'leaflet'


// Fix leaflet default icon issue with vite
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
  articles: Article[]
  lat: number
  lng: number
}

const CONFLICT_ZONES: ConflictZone[] = [
  { country: 'Ukraine', lat: 49.0, lng: 31.0, articles: [] },
  { country: 'Gaza', lat: 31.5, lng: 34.4, articles: [] },
  { country: 'Sudan', lat: 15.5, lng: 32.5, articles: [] },
  { country: 'Syria', lat: 34.8, lng: 38.9, articles: [] },
  { country: 'Yemen', lat: 15.5, lng: 48.5, articles: [] },
  { country: 'Myanmar', lat: 19.7, lng: 96.0, articles: [] },
  { country: 'Somalia', lat: 5.1, lng: 46.2, articles: [] },
  { country: 'Iran', lat: 32.4, lng: 53.6, articles: [] },
]

const ConflictMap = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [zoneArticles, setZoneArticles] = useState<Article[]>([])
  const [loadingZone, setLoadingZone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getConflictEvents()
        setRecentArticles(res.data.articles || [])
      } catch (err) {
        setMapError('Failed to load conflict data. GDELT may be rate limiting. Try refreshing in 30 seconds.')
      } finally {
        setLoading(false)
      }
    };
    
    // Fix Leaflet's invalidation on mount
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
    
    fetchEvents();
    return () => clearTimeout(timer);
  }, [])

  const handleZoneClick = async (zone: ConflictZone) => {
    setSelectedZone(zone.country)
    setLoadingZone(true)
    try {
      const res = await getNewsByLocation(zone.country)
      setZoneArticles(res.data.articles || [])
    } catch (err) {
      setZoneArticles([])
    } finally {
      setLoadingZone(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const y = dateStr.slice(0, 4)
    const m = dateStr.slice(4, 6)
    const d = dateStr.slice(6, 8)
    return `${d}/${m}/${y}`
  }

  return (
    <div className="flex w-full h-[calc(100vh-65px)] overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative h-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/80">
            <p className="text-gray-400">Loading conflict data...</p>
          </div>
        )}
        {mapError && (
          <div className="absolute top-4 left-4 z-10 bg-red-950/90 border border-red-800 rounded-lg p-3 text-red-300 text-xs max-w-xs">
            {mapError}
          </div>
        )}
        <MapContainer
          center={[20, 20]}
          zoom={2}
          className="w-full h-full"
          style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {CONFLICT_ZONES.map(zone => (
            <CircleMarker
              key={zone.country}
              center={[zone.lat, zone.lng]}
              radius={12}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.4,
                weight: 2,
              }}
              eventHandlers={{
                click: () => handleZoneClick(zone),
              }}
            >
              <Popup>
                <div className="text-black font-semibold">{zone.country}</div>
                <div className="text-xs text-gray-600">Click marker to load news</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <div className="w-96 border-l border-gray-800 flex flex-col overflow-hidden">
        {selectedZone ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">{selectedZone}</h2>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-gray-500 hover:text-white text-sm"
              >
                Back
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
              {loadingZone ? (
                <p className="text-gray-500 text-sm text-center mt-10">Loading articles...</p>
              ) : zoneArticles.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-10">No articles found.</p>
              ) : (
                zoneArticles.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors block"
                  >
                    {article.socialimage && (
                      <img
                        src={article.socialimage}
                        alt=""
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <p className="text-sm text-white leading-snug mb-2">{article.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{article.domain}</span>
                      <span className="text-xs text-gray-600">{article.sourcecountry}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Live Conflict Feed</h2>
              <p className="text-xs text-gray-500 mt-1">Click a zone on the map for local news</p>
            </div>
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
              {recentArticles.slice(0, 30).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors block"
                >
                  <p className="text-xs text-white leading-snug mb-2">{article.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{article.domain}</span>
                    <span className="text-xs text-gray-600">{formatDate(article.seendate)}</span>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ConflictMap