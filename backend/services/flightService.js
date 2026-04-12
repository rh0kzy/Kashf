const axios = require('axios')

// Conflict zone bounding boxes [minLat, maxLat, minLng, maxLng]
const CONFLICT_REGIONS = [
    { name: 'Ukraine', minLat: 44, maxLat: 53, minLng: 22, maxLng: 40 },
    { name: 'Middle East', minLat: 12, maxLat: 38, minLng: 32, maxLng: 62 },
    { name: 'Sudan', minLat: 8, maxLat: 24, minLng: 21, maxLng: 39 },
    { name: 'Myanmar', minLat: 9, maxLat: 29, minLng: 92, maxLng: 102 },
    { name: 'Somalia', minLat: -2, maxLat: 12, minLng: 40, maxLng: 52 },
]

// ICAO category codes for military and helicopters
const MILITARY_PREFIXES = [
    'AFO', 'AFA', 'RFR', 'RFF', 'MMF', 'UAF', 'IAF', 'SQF',
    'RRR', 'NATO', 'USAF', 'USN', 'USMC', 'RAF', 'GAF',
]

const isLikelyMilitary = (callsign, icao24) => {
    if (!callsign) return false
    const cs = callsign.trim().toUpperCase()
    // Military callsign patterns
    return (
        cs.startsWith('RFF') ||
        cs.startsWith('AFO') ||
        cs.startsWith('MMF') ||
        cs.startsWith('NATO') ||
        cs.startsWith('FORTE') ||
        cs.startsWith('REACH') ||
        cs.startsWith('EVAC') ||
        cs.startsWith('GHOST') ||
        cs.startsWith('VIPER') ||
        cs.startsWith('HAWK') ||
        cs.startsWith('EAGLE') ||
        cs.startsWith('SWORD') ||
        cs.match(/^[A-Z]{2,4}\d{2,4}$/) !== null
    )
}

const fetchFlightsInRegion = async (region) => {
    try {
        const response = await axios.get('https://opensky-network.org/api/states/all', {
            params: {
                lamin: region.minLat,
                lomin: region.minLng,
                lamax: region.maxLat,
                lomax: region.maxLng,
            },
            timeout: 10000,
        })

        const states = response.data?.states || []

        return states
            .filter(s => s[5] && s[6]) // must have position
            .filter(s => isLikelyMilitary(s[1], s[0]) || s[8] === false) // military or on ground=false with no squawk
            .map(s => ({
                icao24: s[0],
                callsign: s[1]?.trim() || 'UNKNOWN',
                originCountry: s[2],
                longitude: s[5],
                latitude: s[6],
                altitude: s[7] || 0,
                onGround: s[8],
                velocity: s[9] || 0,
                heading: s[10] || 0,
                verticalRate: s[11] || 0,
                region: region.name,
                isMilitary: isLikelyMilitary(s[1], s[0]),
            }))
    } catch (error) {
        console.warn(`Flight fetch failed for ${region.name}:`, error.message)
        return []
    }
}

const fetchAllConflictFlights = async () => {
    const results = await Promise.allSettled(
        CONFLICT_REGIONS.map(fetchFlightsInRegion)
    )

    const allFlights = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .filter(f => !f.onGround)

    // Deduplicate by icao24
    const seen = new Set()
    return allFlights.filter(f => {
        if (seen.has(f.icao24)) return false
        seen.add(f.icao24)
        return true
    })
}

module.exports = { fetchAllConflictFlights }
