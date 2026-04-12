const { fetchAllConflictFlights } = require('../services/flightService')

const getFlights = async (req, res) => {
    try {
        const flights = await fetchAllConflictFlights()
        res.json({ success: true, flights, count: flights.length })
    } catch (error) {
        console.error('getFlights error:', error.message)
        res.status(500).json({ error: 'Failed to fetch flight data' })
    }
}

module.exports = { getFlights }
